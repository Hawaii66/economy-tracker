import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import { BudgetOverviewChartsClient } from '@/components/overview/BudgetOverviewChartsClient'
import { getAccounts, getSinks } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { guardRailFromState } from '@/lib/sinks'

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

  const accounts = getAccounts(data.state.accounts)
  const sinks = getSinks(data.state.sinks)
  const accountsRecord = Object.fromEntries(accounts.map((account) => [account.id, account]))
  const sinksRecord = Object.fromEntries(sinks.map((sink) => [sink.id, sink]))
  const guardRail = guardRailFromState({ accounts: accountsRecord, sinks: sinksRecord })
  const lifestyleTags = (data.state.lifestyleTags ?? {}) as Record<
    string,
    { name: string; color: string }
  >
  const eventTags = (data.state.eventTags ?? {}) as Record<string, { name: string; color: string }>
  const tags = { ...lifestyleTags, ...eventTags }

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

      <section
        className={`budget-panel budget-panel-wide border ${
          guardRail.healthy
            ? 'border-[rgba(94,174,255,0.35)]'
            : 'border-[rgba(232,138,138,0.45)]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Budget guard-rail</h2>
            <p className="mt-2 mb-0 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
              Total cash across physical accounts must cover total virtual sink balances. Sinks live
              only in the app — money can sit in any account and move when needed.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
              guardRail.healthy
                ? 'bg-[rgba(94,174,255,0.15)] text-[var(--accent)]'
                : 'bg-[rgba(232,138,138,0.15)] text-[#E88A8A]'
            }`}
          >
            {guardRail.healthy ? 'Healthy' : 'Over-allocated'}
          </span>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Account cash
            </dt>
            <dd className="m-0 mt-1 text-lg font-semibold text-[var(--text)]">
              {formatMoney(guardRail.cash)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Sink balances
            </dt>
            <dd className="m-0 mt-1 text-lg font-semibold text-[var(--text)]">
              {formatMoney(guardRail.sinkTotal)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Headroom
            </dt>
            <dd
              className={`m-0 mt-1 text-lg font-semibold ${
                guardRail.headroom >= 0 ? 'text-[var(--text)]' : 'text-[#E88A8A]'
              }`}
            >
              {formatMoney(guardRail.headroom)}
            </dd>
          </div>
        </dl>

        <p className="mb-0 mt-4 text-sm">
          <Link
            to="/dashboard/budgets/$budgetId/sinks"
            params={{ budgetId }}
            className="font-semibold text-[var(--accent)] no-underline hover:underline"
          >
            Manage sinks
          </Link>
        </p>
      </section>

      <BudgetOverviewChartsClient
        accounts={accounts}
        sinks={sinks}
        categories={(data.state.categories ?? {}) as Record<string, { name: string; color: string }>}
        tags={tags}
        ledgerTransactions={data.state.ledgerTransactions}
        guardRail={guardRail}
      />
    </div>
  )
}
