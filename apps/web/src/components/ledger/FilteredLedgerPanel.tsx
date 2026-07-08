import { Link } from '@tanstack/react-router'
import LedgerEntriesTable from '@/components/ledger/LedgerEntriesTable'
import type { LedgerTableContext } from '@/lib/ledger-table-context'
import { filterLedgerTransactions, summarizeFilteredLedger, type LedgerFilters } from '@/lib/ledger-filters'
import { formatMoney } from '@/lib/format-money'

type FilteredLedgerPanelProps = {
  budgetId: string
  filters: LedgerFilters
  context: LedgerTableContext
  title?: string
  description?: string
  readOnly?: boolean
  emptyMessage?: string
}

export function FilteredLedgerPanel({
  budgetId,
  filters,
  context,
  title = 'Transactions',
  description = 'Ledger entries matching the current filter.',
  readOnly = true,
  emptyMessage = 'No ledger entries match this filter yet.',
}: FilteredLedgerPanelProps) {
  const filtered = filterLedgerTransactions(context.allLedgerTransactions, filters)
  const summary = summarizeFilteredLedger(filtered)

  return (
    <section className="budget-panel">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-semibold text-[var(--text)]">{title}</h2>
          <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">{description}</p>
          {filtered.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="demo-pill">
                {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
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
          ) : null}
        </div>
        <Link
          to="/dashboard/budgets/$budgetId/ledger"
          params={{ budgetId }}
          search={filters}
          className="text-sm text-[var(--accent)] no-underline hover:underline"
        >
          View in ledger
        </Link>
      </div>

      {filtered.length > 0 ? (
        <LedgerEntriesTable
          transactions={filtered}
          accountNames={context.accountNames}
          categoriesById={context.categoriesById}
          sinksById={context.sinksById}
          tagsById={context.tagsById}
          ledgerById={context.ledgerById}
          internalTransferGroups={context.internalTransferGroups}
          highlightedId={null}
          deletingLedgerId={null}
          onNavigateToRaw={() => {}}
          onNavigateToLedger={() => {}}
          readOnly={readOnly}
        />
      ) : (
        <p className="m-0 text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      )}
    </section>
  )
}
