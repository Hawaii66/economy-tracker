import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Import } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import CsvDropzone from '@/components/CsvDropzone'
import ImportReviewTable from '@/components/import/ImportReviewTable'
import TransactionTable from '@/components/TransactionTable'
import { Button } from '@/components/ui/button'
import { type CsvParseResult, parseCsvText, readCsvText } from '@/lib/csv-import'
import { getAccounts, getRawTransactions } from '@/lib/budget-types'
import { createEntityId } from '@/lib/entity-id'
import { buildImportReviewRows, type ImportReviewRow } from '@/lib/import-review'
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

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null)
  const [reviewRows, setReviewRows] = useState<ImportReviewRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [newAccountName, setNewAccountName] = useState('')
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
  const isCreatingAccount = selectedAccountId === '__new__'

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

  const approvedRows = reviewRows.filter((row) => row.approved)
  const targetAccountName = isCreatingAccount
    ? newAccountName.trim() || 'New account'
    : accountNames[selectedAccountId] ?? 'Selected account'
  const canImport =
    approvedRows.length > 0 &&
    (isCreatingAccount ? newAccountName.trim().length > 0 : selectedAccountId.length > 0)

  async function handleFile(file: File) {
    setImportMessage(null)
    setImportError(null)
    setParseError(null)
    setSelectedFileName(file.name)

    try {
      const text = await readCsvText(file)
      const parsed = parseCsvText(text)
      setParseResult(parsed)
      setReviewRows(buildImportReviewRows(parsed.rows, rules))
    } catch (error) {
      setParseResult(null)
      setReviewRows([])
      setParseError(error instanceof Error ? error.message : 'Failed to parse CSV file.')
    }
  }

  async function handleImport() {
    if (!parseResult || !canImport) {
      return
    }

    setIsImporting(true)
    setImportMessage(null)
    setImportError(null)

    try {
      const events: Array<{ eventType: string; payload: Record<string, unknown> }> = []
      const accountId = isCreatingAccount ? createEntityId('acct') : selectedAccountId

      if (isCreatingAccount) {
        events.push({
          eventType: 'ACCOUNT_ADDED',
          payload: {
            accountId,
            name: newAccountName.trim(),
            openingBalance: 0,
            currency: 'SEK',
            genesisDate: new Date().toISOString().slice(0, 10),
          },
        })
      }

      const importBatchId = createEntityId('batch')
      const importedTransactions = approvedRows.map((row) => ({
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

      for (let index = 0; index < approvedRows.length; index += 1) {
        const row = approvedRows[index]
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

      await appendEvents({
        budgetId: budgetId as Id<'budgets'>,
        events,
      })

      setImportMessage(
        `Imported ${approvedRows.length} transaction${approvedRows.length === 1 ? '' : 's'}.`,
      )
      setParseResult(null)
      setReviewRows([])
      setSelectedFileName(null)
      setSelectedAccountId(isCreatingAccount ? accountId : selectedAccountId)
      setNewAccountName('')
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
        <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Upload CSV</h2>
        <p className="mt-2 mb-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Drop a bank export to review each transaction. Import rules auto-apply categories and
          tags. Assign a category, approve rows, then import.
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
            Target account
            <select
              className="demo-select"
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              disabled={isImporting}
            >
              <option value="">Select an account…</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
              <option value="__new__">Create new account…</option>
            </select>
          </label>

          {isCreatingAccount ? (
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
              New account name
              <input
                className="demo-input"
                value={newAccountName}
                onChange={(event) => setNewAccountName(event.target.value)}
                placeholder="Checking, savings…"
                disabled={isImporting}
              />
            </label>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>

        <div className="mt-4">
          <CsvDropzone
            onFile={(file) => void handleFile(file)}
            disabled={isImporting}
            fileName={selectedFileName}
          />
        </div>

        {parseError ? (
          <p className="demo-alert demo-alert-danger mt-4 mb-0 text-sm">{parseError}</p>
        ) : null}
        {importError ? (
          <p className="demo-alert demo-alert-danger mt-4 mb-0 text-sm">{importError}</p>
        ) : null}
        {importMessage ? (
          <p className="demo-alert mt-4 mb-0 text-sm">{importMessage}</p>
        ) : null}

        {parseResult ? (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="demo-pill">{parseResult.rows.length} rows ready</span>
              {parseResult.skippedRowCount > 0 ? (
                <span className="demo-pill">{parseResult.skippedRowCount} rows skipped</span>
              ) : null}
              <span className="demo-pill">Delimiter: {parseResult.delimiter}</span>
            </div>

            <ImportReviewTable
              rows={reviewRows}
              categories={categoryOptions}
              tags={tagOptions}
              rulesById={rulesById}
              accountName={targetAccountName}
              onRowsChange={setReviewRows}
              disabled={isImporting}
            />

            <div className="mt-4">
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
            </div>
          </div>
        ) : null}
      </section>

      <section className="budget-panel">
        <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Imported transactions</h2>
        <p className="mt-2 mb-4 text-sm text-[var(--text-muted)]">
          {rawTransactions.length} raw transaction{rawTransactions.length === 1 ? '' : 's'} stored
          in this budget.
        </p>
        <TransactionTable transactions={rawTransactions} accountNames={accountNames} />
      </section>
    </div>
  )
}
