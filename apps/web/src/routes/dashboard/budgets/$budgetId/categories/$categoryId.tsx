import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import CategoryDetailView from '@/components/taxonomy/CategoryDetailView'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/categories/$categoryId')({
  component: CategoryDetailPage,
})

function CategoryDetailPage() {
  const { budgetId, categoryId } = Route.useParams()
  const { data, isPending, isError } = useQuery(
    convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
  )

  if (isPending) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading category…</p>
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

  return (
    <CategoryDetailView budgetId={budgetId} categoryId={categoryId} state={data.state} />
  )
}
