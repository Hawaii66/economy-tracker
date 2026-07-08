import { createFileRoute, Outlet, useMatch } from '@tanstack/react-router'
import { Waves } from 'lucide-react'
import SinksManager from '@/components/sinks/SinksManager'
import type { Id } from '@economy-tracker/convex/dataModel'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/sinks')({
  component: SinksPage,
})

function SinksPage() {
  const { budgetId } = Route.useParams()
  const sinkDetailMatch = useMatch({
    from: '/dashboard/budgets/$budgetId/sinks/$sinkId',
    shouldThrow: false,
  })

  if (sinkDetailMatch) {
    return <Outlet />
  }

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Waves className="size-5" />
          </div>
          <div>
            <p className="kicker mb-1">Virtual budgeting</p>
            <h1 className="display-title m-0 text-3xl text-[var(--text)] sm:text-4xl">Sinks</h1>
          </div>
        </div>
        <p className="mt-3 mb-0 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
          Virtual envelopes for target-date goals, recurring bills, and capped reserves. Sinks stay
          decoupled from physical accounts so your budget reflects intent without locking cash to
          specific cards or accounts.
        </p>
      </header>

      <SinksManager budgetId={budgetId as Id<'budgets'>} />
    </div>
  )
}
