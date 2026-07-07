import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/')({
  component: BudgetOverviewPage,
})

function BudgetOverviewPage() {
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

  const accountCount = Object.keys(data.state.accounts ?? {}).length
  const sinkCount = Object.keys(data.state.sinks ?? {}).length
  const categoryCount = Object.keys(data.state.categories ?? {}).length

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <p className="kicker mb-2">Overview</p>
        <h1 className="display-title m-0 text-3xl text-[var(--text)] sm:text-4xl">
          {data.name}
        </h1>
      </header>

      <div className="budget-overview-grid">
        <section className="budget-panel">
          <p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            Sequence
          </p>
          <p className="display-title m-0 mt-2 text-3xl text-[var(--text)]">{data.sequence}</p>
        </section>
        <section className="budget-panel">
          <p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            Accounts
          </p>
          <p className="display-title m-0 mt-2 text-3xl text-[var(--text)]">{accountCount}</p>
        </section>
        <section className="budget-panel">
          <p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            Sinks
          </p>
          <p className="display-title m-0 mt-2 text-3xl text-[var(--text)]">{sinkCount}</p>
        </section>
        <section className="budget-panel">
          <p className="m-0 text-xs font-bold tracking-[0.14em] text-[var(--text-muted)] uppercase">
            Categories
          </p>
          <p className="display-title m-0 mt-2 text-3xl text-[var(--text)]">{categoryCount}</p>
        </section>
      </div>

      <section className="budget-panel budget-panel-wide">
        <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Budget guard-rail</h2>
        <p className="mt-2 mb-0 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
          Liquid account cash must cover total virtual sink balances. This dashboard will surface
          allocation health, sink pacing, and account liquidity as features are built out.
        </p>
      </section>
    </div>
  )
}
