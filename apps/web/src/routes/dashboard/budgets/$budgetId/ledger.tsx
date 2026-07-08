import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import LedgerEntriesTable from '@/components/ledger/LedgerEntriesTable'
import { LedgerFilterBar } from '@/components/ledger/LedgerFilterBar'
import RawImportsTable from '@/components/ledger/RawImportsTable'
import {
  buildLedgerByRawId,
  getRawTransactions,
  getTransferCounterpartyId,
  getUnlinkedRawTransactions,
  type BudgetLedgerTransaction,
} from '@/lib/budget-types'
import {
  type LedgerHighlightTarget,
  navigateToLedgerRow,
} from '@/lib/ledger-navigation'
import {
  activeFilterCount,
  filterLedgerTransactions,
  summarizeFilteredLedger,
  type LedgerFilters,
} from '@/lib/ledger-filters'
import { buildLedgerTableContext } from '@/lib/ledger-table-context'
import { formatMoney } from '@/lib/format-money'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/ledger')({
  component: LedgerPage,
  validateSearch: (search: Record<string, unknown>): LedgerFilters => ({
    sinkId: typeof search.sinkId === 'string' ? search.sinkId : undefined,
    categoryId: typeof search.categoryId === 'string' ? search.categoryId : undefined,
    accountId: typeof search.accountId === 'string' ? search.accountId : undefined,
    tagId: typeof search.tagId === 'string' ? search.tagId : undefined,
    from: typeof search.from === 'string' ? search.from : undefined,
    to: typeof search.to === 'string' ? search.to : undefined,
  }),
})

function LedgerPage() {
  const { budgetId } = Route.useParams()
  const { data, isPending, isError } = useQuery(
    convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
  )

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

  return <LedgerPageContent budgetId={budgetId} state={data.state} />
}

function LedgerPageContent({
  budgetId,
  state,
}: {
  budgetId: string
  state: Record<string, unknown>
}) {
  const filters = Route.useSearch()
  const [highlighted, setHighlighted] = useState<LedgerHighlightTarget | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deletingLedgerId, setDeletingLedgerId] = useState<string | null>(null)
  const appendEvents = useMutation(api.budgets.appendEvents)

  useEffect(() => {
    if (!highlighted) {
      return
    }

    const timer = window.setTimeout(() => setHighlighted(null), 2500)
    return () => window.clearTimeout(timer)
  }, [highlighted])

  function navigateTo(type: 'raw' | 'ledger', id: string) {
    setHighlighted(navigateToLedgerRow(type, id))
  }

  const context = buildLedgerTableContext(state)
  const ledgerTransactions = filterLedgerTransactions(context.allLedgerTransactions, filters)
  const ledgerByRawId = buildLedgerByRawId(context.allLedgerTransactions)
  const rawTransactions = getRawTransactions(state.rawTransactions)
  const unlinkedRawTransactions = getUnlinkedRawTransactions(
    state.rawTransactions,
    state.ledgerTransactions,
  )
  const summary = summarizeFilteredLedger(ledgerTransactions)

  async function handleDeleteLedger(ledger: BudgetLedgerTransaction) {
    setActionError(null)
    setActionMessage(null)
    setDeletingLedgerId(ledger.id)

    const counterpartyId = getTransferCounterpartyId(ledger, context.internalTransferGroups)
    const ledgerIdsToDelete = counterpartyId ? [ledger.id, counterpartyId] : [ledger.id]

    try {
      await appendEvents({
        budgetId: budgetId as Id<'budgets'>,
        events: ledgerIdsToDelete.map((ledgerTransactionId) => ({
          eventType: 'LEDGER_TRANSACTION_DELETED' as const,
          payload: { ledgerTransactionId },
        })),
      })
      setActionMessage(
        ledger.internalTransferGroupId
          ? 'Removed internal transfer. Both bank imports are back on the Import tab.'
          : ledger.rawTransactionId
            ? `Removed ledger entry. ${ledger.description || 'The bank import'} is back on the Import tab.`
            : `Removed ${ledger.description || 'ledger entry'}.`,
      )
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to remove ledger entry.')
      throw error
    } finally {
      setDeletingLedgerId(null)
    }
  }

  const highlightedRawId = highlighted?.type === 'raw' ? highlighted.id : null
  const highlightedLedgerId = highlighted?.type === 'ledger' ? highlighted.id : null
  const filterCount = activeFilterCount(filters)

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <BookOpen className="size-5" />
          </span>
          <div>
            <p className="kicker mb-1">Transactions</p>
            <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">Ledger</h1>
          </div>
        </div>
      </header>

      <section className="budget-panel">
        <div className="mb-4">
          <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Ledger entries</h2>
          <p className="mt-1 mb-0 max-w-3xl text-sm text-[var(--text-muted)]">
            Categorized transactions that affect account balances. Remove an entry to send its bank
            import back to the Import tab for re-categorization.
          </p>
          {filterCount > 0 ? (
            <>
              <LedgerFilterBar
                budgetId={budgetId}
                filters={filters}
                entities={{
                  accountId: filters.accountId
                    ? {
                        label: context.accountNames[filters.accountId] ?? filters.accountId,
                        href: `/dashboard/budgets/${budgetId}/accounts/${filters.accountId}`,
                      }
                    : undefined,
                  categoryId: filters.categoryId
                    ? {
                        label: context.categoriesById[filters.categoryId]?.name ?? filters.categoryId,
                        href: `/dashboard/budgets/${budgetId}/categories/${filters.categoryId}`,
                      }
                    : undefined,
                  sinkId: filters.sinkId
                    ? {
                        label: context.sinksById[filters.sinkId]?.name ?? filters.sinkId,
                        href: `/dashboard/budgets/${budgetId}/sinks/${filters.sinkId}`,
                      }
                    : undefined,
                  tagId: filters.tagId
                    ? {
                        label: context.tagsById[filters.tagId]?.name ?? filters.tagId,
                        href: `/dashboard/budgets/${budgetId}/tags/${filters.tagId}`,
                      }
                    : undefined,
                }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="demo-pill">
                  {ledgerTransactions.length} of {context.allLedgerTransactions.length} entries
                </span>
                {summary.totalIn > 0 ? (
                  <span className="demo-pill text-[var(--accent)]">
                    In {formatMoney(summary.totalIn)}
                  </span>
                ) : null}
                {summary.totalOut > 0 ? (
                  <span className="demo-pill text-[#E88A8A]">
                    Out {formatMoney(summary.totalOut)}
                  </span>
                ) : null}
              </div>
            </>
          ) : null}
          {actionError ? (
            <p className="demo-alert demo-alert-danger mt-3 mb-0 text-sm">{actionError}</p>
          ) : null}
          {actionMessage ? <p className="demo-alert mt-3 mb-0 text-sm">{actionMessage}</p> : null}
          {filterCount === 0 && ledgerTransactions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="demo-pill">{ledgerTransactions.length} entries</span>
            </div>
          ) : null}
        </div>

        <LedgerEntriesTable
          transactions={ledgerTransactions}
          accountNames={context.accountNames}
          categoriesById={context.categoriesById}
          sinksById={context.sinksById}
          tagsById={context.tagsById}
          ledgerById={context.ledgerById}
          internalTransferGroups={context.internalTransferGroups}
          highlightedId={highlightedLedgerId}
          deletingLedgerId={deletingLedgerId}
          onNavigateToRaw={(rawId) => navigateTo('raw', rawId)}
          onNavigateToLedger={(ledgerId) => navigateTo('ledger', ledgerId)}
          onDelete={handleDeleteLedger}
        />
      </section>

      <section className="budget-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Bank imports</h2>
            <p className="mt-1 mb-0 max-w-3xl text-sm text-[var(--text-muted)]">
              Immutable rows from CSV imports. Click a ledger link to jump to the matching entry.
            </p>
            {rawTransactions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="demo-pill">{rawTransactions.length} imports</span>
                {unlinkedRawTransactions.length > 0 ? (
                  <span className="demo-pill">
                    {unlinkedRawTransactions.length} awaiting categorization
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          {rawTransactions.length === 0 ? (
            <Link
              to="/dashboard/budgets/$budgetId/import"
              params={{ budgetId }}
              className="btn-primary text-sm no-underline"
            >
              Import CSV
            </Link>
          ) : null}
        </div>

        <RawImportsTable
          transactions={rawTransactions}
          ledgerByRawId={ledgerByRawId}
          accountNames={context.accountNames}
          highlightedId={highlightedRawId}
          onNavigateToLedger={(ledgerId) => navigateTo('ledger', ledgerId)}
        />
      </section>
    </div>
  )
}
