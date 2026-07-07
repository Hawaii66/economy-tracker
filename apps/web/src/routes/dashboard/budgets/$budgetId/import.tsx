import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Import, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import { ImportUploadModal } from '@/components/import/ImportUploadModal'
import ImportReviewTable from '@/components/import/ImportReviewTable'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { type CsvParseResult, parseCsvText, readCsvText } from '@/lib/csv-import'
import { getAccounts, getRawTransactions } from '@/lib/budget-types'
import { createEntityId } from '@/lib/entity-id'
import {
  applyReviewRowUpdates,
  buildImportReviewRows,
  flattenReviewRows,
  groupApprovedRowsByAccount,
  type CsvParsePreview,
  type ImportReviewBatch,
  type ImportReviewRow,
} from '@/lib/import-review'
import type { MatchableRule } from 'budget-core'

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
  const rawTransactions = getRawTransactions(data.state.rawTransactions)

  const rules = (Object.values(data.state.rules ?? {}) as Rule[]).sort((left, right) =>
    (left.keywords[0] ?? left.name).localeCompare(right.keywords[0] ?? right.name),
  )
  const rulesById = Object.fromEntries(
    rules.map((rule) => [rule.id, { name: rule.name, keywords: rule.keywords }]),
  )

  const categoryOptions = (Object.values(data.state.categories ?? {}) as Category[])
    .sort((left, right) => left.name.localeCompare(right.name))

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
      setParsePreview({
        rowCount: parsed.rows.length,
        skippedRowCount: parsed.skippedRowCount,
        delimiter: parsed.delimiter,
      })
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

    setIsParsing(true)

    try {
      const batchId = createEntityId('review-batch')
      const batchOrder = reviewBatches.length
      const batch: ImportReviewBatch = {
        id: batchId,
        accountId: selectedAccountId,
        fileName: pendingFile.name,
        delimiter: pendingParse.delimiter,
        rowCount: pendingParse.rows.length,
        skippedRowCount: pendingParse.skippedRowCount,
        batchOrder,
        rows: buildImportReviewRows(
          pendingParse.rows,
          rules,
          batchId,
          selectedAccountId,
          batchOrder,
        ),
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
      const approvedByAccount = groupApprovedRowsByAccount(reviewBatches)

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

        for (let index = 0; index < rows.length; index += 1) {
          const row = rows[index]
          const rawTransaction = importedTransactions[index]
          if (!row || !rawTransaction) {
            continue
          }

          events.push({
            eventType: 'LEDGER_TRANSACTION_CREATED',
            payload: {
              ledgerTransactionId: createEntityId('txn'),
              rawTransactionId: rawTransaction.rawTransactionId,
              accountId,
              date: row.date,
              amount: row.amount,
              description: row.description,
              categoryId: row.assignment.categoryId,
              sinkId: row.assignment.sinkId,
              lifestyleTagIds: row.assignment.lifestyleTagIds,
              eventTagIds: row.assignment.eventTagIds,
            },
          })
        }
      }

      await appendEvents({
        budgetId: budgetId as Id<'budgets'>,
        events,
      })

      setImportMessage(
        `Imported ${approvedRows.length} transaction${approvedRows.length === 1 ? '' : 's'} from ${approvedByAccount.size} account${approvedByAccount.size === 1 ? '' : 's'}.`,
      )
      resetImportSession()
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.')
    } finally {
      setIsImporting(false)
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
              Transfer linking will be added later.
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
                </span>
              ))}
            </div>

            <ImportReviewTable
              rows={reviewRows}
              categories={categoryOptions}
              tags={tagOptions}
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
                    ? `Import ${approvedRows.length} approved transaction${approvedRows.length === 1 ? '' : 's'}`
                    : 'Approve rows to import'}
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
          {rawTransactions.length} raw transaction{rawTransactions.length === 1 ? '' : 's'} stored
          in this budget.
        </p>
        <TransactionTable transactions={rawTransactions} accountNames={accountNames} />
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
        onAccountChange={setSelectedAccountId}
        onFile={(file) => void handleFileSelect(file)}
        onContinue={handleAddToReview}
      />
    </div>
  )
}
