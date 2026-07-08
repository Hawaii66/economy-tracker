import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import SinkDetailView from '@/components/sinks/SinkDetailView'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/sinks/$sinkId')({
  component: SinkDetailPage,
})

function SinkDetailPage() {
  const { budgetId, sinkId } = Route.useParams()

  const { data, isPending, isError } = useQuery(
    convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
  )

  const { data: activityEvents, isPending: activityPending } = useQuery(
    convexQuery(api.budgets.listSinkActivityEvents, {
      budgetId: budgetId as Id<'budgets'>,
      sinkId,
    }),
  )

  if (isPending || activityPending) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading sink…</p>
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
    <SinkDetailView
      budgetId={budgetId as Id<'budgets'>}
      sinkId={sinkId}
      state={data.state}
      activityEvents={activityEvents ?? []}
    />
  )
}
