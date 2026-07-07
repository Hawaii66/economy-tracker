import { createFileRoute } from '@tanstack/react-router'
import { Wand2 } from 'lucide-react'
import ImportRulesManager from '@/components/rules/ImportRulesManager'
import type { Id } from '@economy-tracker/convex/dataModel'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/rules')({
  component: RulesPage,
})

function RulesPage() {
  const { budgetId } = Route.useParams()

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Wand2 className="size-5" />
          </div>
          <div>
            <p className="kicker mb-1">Organization</p>
            <h1 className="display-title m-0 text-3xl text-[var(--text)] sm:text-4xl">Rules</h1>
          </div>
        </div>
      </header>

      <ImportRulesManager budgetId={budgetId as Id<'budgets'>} />
    </div>
  )
}
