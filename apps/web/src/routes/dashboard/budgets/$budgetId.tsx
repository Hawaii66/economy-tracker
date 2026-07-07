import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'

export const Route = createFileRoute('/dashboard/budgets/$budgetId')({
  component: BudgetPage,
})

function BudgetPage() {
  const { budgetId } = Route.useParams()
  const { data, isPending, isError } = useQuery(
    convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
  )

  return (
    <main className="page-wrap px-4 pb-8 pt-8">
      <section className="panel rounded-2xl p-6 sm:p-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-block text-sm font-semibold text-[var(--accent)] no-underline hover:underline"
        >
          ← All budgets
        </Link>

        {isPending ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">Loading budget…</p>
        ) : isError || !data ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            This budget could not be loaded. You may not have access.
          </p>
        ) : (
          <>
            <p className="kicker mb-2">Budget</p>
            <h1 className="display-title mb-6 text-3xl text-[var(--text)] sm:text-4xl">
              {data.name}
            </h1>
            <dl className="m-0 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-[var(--text)]">Sequence</dt>
                <dd className="m-0 text-[var(--text-muted)]">{data.sequence}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--text)]">Categories</dt>
                <dd className="m-0 text-[var(--text-muted)]">
                  {Object.keys(data.state.categories).length}
                </dd>
              </div>
            </dl>
          </>
        )}
      </section>
    </main>
  )
}
