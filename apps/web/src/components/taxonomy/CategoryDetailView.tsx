import { aggregateLedgerByCategory } from 'budget-core'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { FilteredLedgerPanel } from '@/components/ledger/FilteredLedgerPanel'
import { SpendingBarChart } from '@/components/charts/chart-panels'
import { toNamedAmounts } from '@/lib/chart-colors'
import { getLedgerTransactions } from '@/lib/budget-types'
import { statsForEntity } from '@/lib/entity-ledger-stats'
import { formatMoney } from '@/lib/format-money'
import { buildLedgerTableContext } from '@/lib/ledger-table-context'

type Category = { id: string; name: string; color: string }

type CategoryDetailViewProps = {
  budgetId: string
  categoryId: string
  state: Record<string, unknown>
}

export default function CategoryDetailView({
  budgetId,
  categoryId,
  state,
}: CategoryDetailViewProps) {
  const categories = Object.values(state.categories ?? {}) as Category[]
  const category = categories.find((candidate) => candidate.id === categoryId)
  const ledger = getLedgerTransactions(state.ledgerTransactions)
  const context = buildLedgerTableContext(state)
  const filters = { categoryId }

  if (!category) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">This category could not be found.</p>
        <Link
          to="/dashboard/budgets/$budgetId/tags"
          params={{ budgetId }}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] no-underline"
        >
          <ArrowLeft className="size-4" />
          Back to categories & tags
        </Link>
      </div>
    )
  }

  const stats = statsForEntity(ledger, filters)
  const spendingRows = toNamedAmounts(
    aggregateLedgerByCategory(ledger),
    (id) => categories.find((candidate) => candidate.id === id)?.name ?? 'Uncategorized',
    (id) => categories.find((candidate) => candidate.id === id)?.color,
  ).slice(0, 8)

  return (
    <div className="budget-page">
      <Link
        to="/dashboard/budgets/$budgetId/tags"
        params={{ budgetId }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
      >
        <ArrowLeft className="size-4" />
        Categories & tags
      </Link>

      <header className="budget-page-header">
        <div className="flex items-start gap-3">
          <span
            className="inline-block size-5 shrink-0 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <p className="kicker mb-1">Category</p>
            <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">
              {category.name}
            </h1>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="budget-panel">
          <h2 className="m-0 text-base font-semibold text-[var(--text)]">Summary</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Transactions
              </dt>
              <dd className="m-0 mt-1 font-semibold text-[var(--text)]">{stats.transactionCount}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Total spent
              </dt>
              <dd className="m-0 mt-1 font-semibold text-[#E88A8A]">
                {formatMoney(stats.totalSpent)}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Total income
              </dt>
              <dd className="m-0 mt-1 font-semibold text-[var(--accent)]">
                {formatMoney(stats.totalIncome)}
              </dd>
            </div>
          </dl>
        </section>

        <SpendingBarChart
          title="Spending by category"
          description="Top categorized expenses in this budget."
          rows={spendingRows}
          emptyMessage="Import and categorize transactions to see spending breakdown."
        />
      </div>

      <div className="mt-4">
        <FilteredLedgerPanel
          budgetId={budgetId}
          filters={filters}
          context={context}
          description="Ledger entries assigned to this category."
          emptyMessage="No transactions in this category yet."
        />
      </div>
    </div>
  )
}
