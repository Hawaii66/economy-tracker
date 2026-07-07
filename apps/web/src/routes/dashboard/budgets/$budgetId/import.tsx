import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Import, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import ImportReviewTable from '@/components/import/ImportReviewTable'
import ImportedTransactionsTable from '@/components/import/ImportedTransactionsTable'
import { ImportUploadModal } from '@/components/import/ImportUploadModal'
import { Button } from '@/components/ui/button'
import { type CsvParseResult, parseCsvText, readCsvText } from '@/lib/csv-import'
import { getAccounts, getLedgerTransactions, getRawTransactions, getUnlinkedRawTransactions } from '@/lib/budget-types'
import type { BudgetRawTransaction } from '@/lib/budget-types'
import { createEntityId } from '@/lib/entity-id'
import {
  applyReviewRowUpdates,
  buildImportReviewRows,
  buildParsePreview,
  collectStoredTransactionDedupeKeys,
  collectTransactionDedupeKeys,
  dedupeReviewRows,
  mergeTransactionDedupeKeys,
  filterParsedRowsByGenesisDate,
  flattenReviewRows,
  groupApprovedRowsByAccount,
  type CsvParsePreview,
  type ImportReviewBatch,
  type ImportReviewRow,
} from '@/lib/import-review'
import type { MatchableRule } from 'budget-core'
import {
  type SaveImportedTransactionInput,
} from '@/lib/transaction-split'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/import')({
  component: ImportPage,
})

type Rule = MatchableRule & { name: string }
type Category = { id: string; name: string; color: string }
type LifestyleTag = { id: string; name: string; color: string }
type EventTag = { id: string; name: string; color: string; archived: boolean }

function ImportPage() {
  const { budgetId } = Route.useParams()
  const { data, isPending, isError } = useQuery(
    convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
  )
  const appendEvents = useMutation(api.budgets.appendEvents)

  const [reviewBatches, setReviewBatches] = useState<ImportReviewBatch[]>([])
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingParse, setPendingParse] = useState<CsvParseResult | null>(null)
  const [parsePreview, setParsePreview] = useState<CsvParsePreview | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [ledgerMessage, setLedgerMessage] = useState<string | null>(null)
  const [ledgerError, setLedgerError] = useState<string | null>(null)

  if (isPending) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading budget…</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">
          This budget could not be loaded. You may not have access.
        </p>
      </div>
    )
  }

  const accounts = getAccounts(data.state.accounts)
  const accountNames = Object.fromEntries(accounts.map((account) => [account.id, account.name]))
  const genesisDatesByAccountId = Object.fromEntries(
    accounts.map((account) => [account.id, account.genesisDate]),
  )
  const rawTransactions = getRawTransactions(data.state.rawTransactions)
  const ledgerTransactions = getLedgerTransactions(data.state.ledgerTransactions)

  const storedDedupeKeys = collectStoredTransactionDedupeKeys(
    rawTransactions,
    ledgerTransactions,
  )

  const unlinkedRawTransactions = getUnlinkedRawTransactions(
    data.state.rawTransactions,
    data.state.ledgerTransactions,
  )

  const rules = (Object.values(data.state.rules ?? {}) as Rule[]).sort((left, right) =>
    (left.keywords[0] ?? left.name).localeCompare(right.keywords[0] ?? right.name),
  )
  const rulesById = Object.fromEntries(
    rules.map((rule) => [rule.id, { name: rule.name, keywords: rule.keywords }]),
  )

  const categoryOptions = (Object.values(data.state.categories ?? {}) as Category[]).sort(
    (left, right) => left.name.localeCompare(right.name),
  )

  const lifestyleTags = Object.values(data.state.lifestyleTags ?? {}) as LifestyleTag[]
  const eventTags = (Object.values(data.state.eventTags ?? {}) as EventTag[]).filter(
    (tag) => !tag.archived,
  )

  const tagOptions = [
    ...lifestyleTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kind: 'permanent' as const,
    })),
    ...eventTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      kind: 'temporary' as const,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name))

  const reviewRows = flattenReviewRows(reviewBatches)
  const approvedRows = reviewRows.filter((row) => row.approved)
  const canImport = approvedRows.length > 0

  function getExistingDedupeKeys() {
    return mergeTransactionDedupeKeys(
      storedDedupeKeys,
      collectTransactionDedupeKeys(flattenReviewRows(reviewBatches)),
    )
  }

  function clearModalDraft() {
    setSelectedFileName(null)
    setPendingFile(null)
    setPendingParse(null)
    setParsePreview(null)
    setParseError(null)
    setSelectedAccountId('')
  }

  function openUploadModal() {
    clearModalDraft()
    setUploadModalOpen(true)
  }

  function updateParsePreview(accountId: string, parsed: CsvParseResult) {
    const genesisDate = accountId ? (genesisDatesByAccountId[accountId] ?? null) : null
    const preview = buildParsePreview(parsed, genesisDate)

    let eligibleRowCount = preview.eligibleRowCount
    let duplicateSkippedRowCount = 0

    if (accountId && genesisDate) {
      const { rows: eligibleRows } = filterParsedRowsByGenesisDate(parsed.rows, genesisDate)
      const deduped = dedupeReviewRows(
        eligibleRows.map((row) => ({
          accountId,
          date: row.date,
          description: row.description,
          amount: row.amount,
          verificationNumber: row.verificationNumber,
          saldo: row.saldo,
        })),
        getExistingDedupeKeys(),
      )
      eligibleRowCount = deduped.rows.length
      duplicateSkippedRowCount = deduped.duplicateSkippedCount

      setParsePreview({
        ...preview,
        eligibleRowCount,
        duplicateSkippedRowCount,
      })
    } else {
      setParsePreview(preview)
    }

    if (accountId && genesisDate && eligibleRowCount === 0 && parsed.rows.length > 0) {
      if (duplicateSkippedRowCount > 0) {
        setParseError('All transactions are already imported or in review.')
        return
      }

      setParseError(
        `All transactions are before this account's genesis date (${genesisDate}).`,
      )
      return
    }

    setParseError(null)
  }

  function handleAccountChange(accountId: string) {
    setSelectedAccountId(accountId)
    if (pendingParse) {
      updateParsePreview(accountId, pendingParse)
    }
  }

  async function handleFileSelect(file: File) {
    setParseError(null)
    setParsePreview(null)
    setPendingParse(null)
    setPendingFile(file)
    setSelectedFileName(file.name)
    setIsPreviewing(true)

    try {
      const text = await readCsvText(file)
      const parsed = parseCsvText(text)

      if (parsed.rows.length === 0) {
        setParseError('No valid transactions found in CSV file.')
        return
      }

      setPendingParse(parsed)
      updateParsePreview(selectedAccountId, parsed)
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse CSV file.')
    } finally {
      setIsPreviewing(false)
    }
  }

  function handleAddToReview() {
    if (!pendingFile || !pendingParse || !selectedAccountId) {
      return
    }

    const genesisDate = genesisDatesByAccountId[selectedAccountId]
    if (!genesisDate) {
      return
    }

    setIsParsing(true)

    try {
      const { rows: eligibleRows, genesisSkippedCount } = filterParsedRowsByGenesisDate(
        pendingParse.rows,
        genesisDate,
      )

      if (eligibleRows.length === 0) {
        setParseError(
          `All transactions are before this account's genesis date (${genesisDate}).`,
        )
        return
      }

      const batchId = createEntityId('review-batch')
      const batchOrder = reviewBatches.length
      const builtRows = buildImportReviewRows(
        eligibleRows,
        rules,
        batchId,
        selectedAccountId,
        batchOrder,
      )
      const { rows: dedupedRows, duplicateSkippedCount } = dedupeReviewRows(
        builtRows,
        getExistingDedupeKeys(),
      )

      if (dedupedRows.length === 0) {
        setParseError('All transactions were already imported or in review.')
        return
      }

      const batch: ImportReviewBatch = {
        id: batchId,
        accountId: selectedAccountId,
        fileName: pendingFile.name,
        delimiter: pendingParse.delimiter,
        rowCount: dedupedRows.length,
        skippedRowCount: pendingParse.skippedRowCount,
        genesisSkippedRowCount: genesisSkippedCount,
        duplicateSkippedRowCount: duplicateSkippedCount,
        batchOrder,
        rows: dedupedRows,
      }

      setReviewBatches((current) => [...current, batch])
      clearModalDraft()
      setUploadModalOpen(false)
    } finally {
      setIsParsing(false)
    }
  }

  function handleRowsChange(updatedRows: ImportReviewRow[]) {
    setReviewBatches((current) => applyReviewRowUpdates(current, updatedRows))
  }

  function resetImportSession() {
    setReviewBatches([])
    clearModalDraft()
  }

  async function handleImport() {
    if (!canImport) {
      return
    }

    setIsImporting(true)
    setImportMessage(null)
    setImportError(null)

    try {
      const events: Array<{ eventType: string; payload: Record<string, unknown> }> = []
      const approvedByAccount = groupApprovedRowsByAccount(
        reviewBatches,
        genesisDatesByAccountId,
      )

      for (const [accountId, rows] of approvedByAccount) {
        const importBatchId = createEntityId('batch')
        const importedTransactions = rows.map((row) => ({
          rawTransactionId: createEntityId('raw'),
          date: row.date,
          amount: row.amount,
          description: row.description,
          rawRow: row.rawRow,
        }))

        events.push({
          eventType: 'TRANSACTIONS_IMPORTED',
          payload: {
            importBatchId,
            accountId,
            importedAt: new Date().toISOString(),
            transactions: importedTransactions,
          },
        })
      }

      await appendEvents({
        budgetId: budgetId as Id<'budgets'>,
        events,
      })

      setImportMessage(
        `Imported ${approvedRows.length} raw transaction${approvedRows.length === 1 ? '' : 's'} from ${approvedByAccount.size} account${approvedByAccount.size === 1 ? '' : 's'}.`,
      )
      resetImportSession()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  async function handleSaveInternalTransfer(
    source: BudgetRawTransaction,
    counterparty: BudgetRawTransaction,
  ) {
    setLedgerError(null)
    setLedgerMessage(null)

    const sourceLedgerTransactionId = createEntityId('txn')
    const counterpartyLedgerTransactionId = createEntityId('txn')
    const transferGroupId = createEntityId('xfer')

    try {
      await appendEvents({
        budgetId: budgetId as Id<'budgets'>,
        events: [
          {
            eventType: 'LEDGER_TRANSACTION_CREATED',
            payload: {
              ledgerTransactionId: sourceLedgerTransactionId,
              rawTransactionId: source.id,
              accountId: source.accountId,
              date: source.date,
              amount: source.amount,
              description: source.description,
              categoryId: null,
              sinkId: null,
              lifestyleTagIds: [],
              eventTagIds: [],
            },
          },
          {
            eventType: 'LEDGER_TRANSACTION_CREATED',
            payload: {
              ledgerTransactionId: counterpartyLedgerTransactionId,
              rawTransactionId: counterparty.id,
              accountId: counterparty.accountId,
              date: counterparty.date,
              amount: counterparty.amount,
              description: counterparty.description,
              categoryId: null,
              sinkId: null,
              lifestyleTagIds: [],
              eventTagIds: [],
            },
          },
          {
            eventType: 'INTERNAL_TRANSFER_LINKED',
            payload: {
              transferGroupId,
              ledgerTransactionIdA: sourceLedgerTransactionId,
              ledgerTransactionIdB: counterpartyLedgerTransactionId,
            },
          },
        ],
      })

      setLedgerMessage(
        `Linked internal transfer between ${accountNames[source.accountId] ?? source.accountId} and ${accountNames[counterparty.accountId] ?? counterparty.accountId}.`,
      )
    } catch (error) {
      setLedgerError(
        error instanceof Error ? error.message : 'Failed to save internal transfer.',
      )
      throw error
    }
  }

  async function handleSaveToLedger(
    transaction: BudgetRawTransaction,
    input: SaveImportedTransactionInput,
  ) {
    setLedgerError(null)
    setLedgerMessage(null)

    const ledgerTransactionId = createEntityId('txn')

    try {
      if (input.mode === 'single') {
        await appendEvents({
          budgetId: budgetId as Id<'budgets'>,
          events: [
            {
              eventType: 'LEDGER_TRANSACTION_CREATED',
              payload: {
                ledgerTransactionId,
                rawTransactionId: transaction.id,
                accountId: transaction.accountId,
                date: transaction.date,
                amount: transaction.amount,
                description: transaction.description,
                categoryId: input.assignment.categoryId,
                sinkId: input.assignment.sinkId,
                lifestyleTagIds: input.assignment.lifestyleTagIds,
                eventTagIds: input.assignment.eventTagIds,
              },
            },
          ],
        })
      } else {
        await appendEvents({
          budgetId: budgetId as Id<'budgets'>,
          events: [
            {
              eventType: 'LEDGER_TRANSACTION_CREATED',
              payload: {
                ledgerTransactionId,
                rawTransactionId: transaction.id,
                accountId: transaction.accountId,
                date: transaction.date,
                amount: transaction.amount,
                description: transaction.description,
                categoryId: null,
                sinkId: null,
                lifestyleTagIds: [],
                eventTagIds: [],
              },
            },
            {
              eventType: 'INCOME_SLICED',
              payload: {
                ledgerTransactionId,
                slices: input.slices.map((slice) => ({
                  sliceId: createEntityId('slice'),
                  amount: slice.amount,
                  description: transaction.description,
                  categoryId: slice.assignment.categoryId,
                  sinkId: slice.assignment.sinkId,
                  lifestyleTagIds: slice.assignment.lifestyleTagIds,
                  eventTagIds: slice.assignment.eventTagIds,
                })),
              },
            },
          ],
        })
      }

      setLedgerMessage(
        input.mode === 'split'
          ? `Saved ${transaction.description || 'transaction'} to the ledger as ${input.slices.length} splits.`
          : `Saved ${transaction.description || 'transaction'} to the ledger.`,
      )
    } catch (error) {
      setLedgerError(error instanceof Error ? error.message : 'Failed to save to ledger.')
      throw error
    }
  }

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Import className="size-5" />
          </span>
          <div>
            <p className="kicker mb-1">Bank CSV</p>
            <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">Import</h1>
          </div>
        </div>
      </header>

      <section className="budget-panel">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Review import</h2>
            <p className="mt-2 mb-0 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              Add exports from multiple accounts (e.g. Maestro and budget) to review together.
              Mark paired rows as internal transfers when moving money between your own accounts.
            </p>
          </div>
          <Button type="button" onClick={openUploadModal} disabled={isImporting}>
            <Plus />
            {reviewBatches.length > 0 ? 'Add CSV' : 'Import CSV'}
          </Button>
        </div>

        {importError ? (
          <p className="demo-alert demo-alert-danger mt-4 mb-0 text-sm">{importError}</p>
        ) : null}
        {importMessage ? (
          <p className="demo-alert mt-4 mb-0 text-sm">{importMessage}</p>
        ) : null}

        {reviewBatches.length > 0 ? (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {reviewBatches.map((batch) => (
                <span key={batch.id} className="demo-pill">
                  {accountNames[batch.accountId] ?? batch.accountId} · {batch.fileName} ·{' '}
                  {batch.rowCount} rows
                  {batch.genesisSkippedRowCount > 0
                    ? ` · ${batch.genesisSkippedRowCount} before genesis`
                    : ''}
                  {batch.duplicateSkippedRowCount > 0
                    ? ` · ${batch.duplicateSkippedRowCount} duplicates`
                    : ''}
                </span>
              ))}
            </div>

            <ImportReviewTable
              rows={reviewRows}
              rulesById={rulesById}
              accountNames={accountNames}
              onRowsChange={handleRowsChange}
              disabled={isImporting}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!canImport || isImporting}
                onClick={() => void handleImport()}
              >
                {isImporting
                  ? 'Importing…'
                  : approvedRows.length > 0
                    ? `Import ${approvedRows.length} selected transaction${approvedRows.length === 1 ? '' : 's'}`
                    : 'Select rows to import'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isImporting}
                onClick={resetImportSession}
              >
                Clear review
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-6 mb-0 text-sm text-[var(--text-muted)]">
            No import in progress. Click Import CSV to get started.
          </p>
        )}
      </section>

      <section className="budget-panel">
        <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Imported transactions</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--text-muted)]">
          {unlinkedRawTransactions.length === 0
            ? 'No unprocessed imports. Expand a row after importing to categorize and save to the ledger.'
            : `${unlinkedRawTransactions.length} imported transaction${unlinkedRawTransactions.length === 1 ? '' : 's'} waiting to be saved to the ledger.`}
        </p>
        {ledgerError ? (
          <p className="demo-alert demo-alert-danger mb-4 text-sm">{ledgerError}</p>
        ) : null}
        {ledgerMessage ? (
          <p className="demo-alert mb-4 text-sm">{ledgerMessage}</p>
        ) : null}
        <ImportedTransactionsTable
          transactions={unlinkedRawTransactions}
          accountNames={accountNames}
          categories={categoryOptions}
          tags={tagOptions}
          rules={rules}
          rulesById={rulesById}
          onSave={handleSaveToLedger}
          onSaveInternalTransfer={handleSaveInternalTransfer}
          disabled={isImporting}
        />
      </section>

      <ImportUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        fileName={selectedFileName}
        parsePreview={parsePreview}
        parseError={parseError}
        isParsing={isParsing}
        isPreviewing={isPreviewing}
        hasExistingBatches={reviewBatches.length > 0}
        disabled={isImporting || isParsing || isPreviewing}
        onAccountChange={handleAccountChange}
        onFile={(file) => void handleFileSelect(file)}
        onContinue={handleAddToReview}
      />
    </div>
  )
}
