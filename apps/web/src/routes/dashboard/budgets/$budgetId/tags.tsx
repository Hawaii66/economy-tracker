import { createFileRoute } from '@tanstack/react-router'
import { Tags } from 'lucide-react'
import CategoriesTagsManager from '@/components/taxonomy/CategoriesTagsManager'
import type { Id } from '@economy-tracker/convex/dataModel'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/tags')({
  component: TagsPage,
})

function TagsPage() {
  const { budgetId } = Route.useParams()

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Tags className="size-5" />
          </div>
          <div>
            <p className="kicker mb-1">Organization</p>
            <h1 className="display-title m-0 text-3xl text-[var(--text)] sm:text-4xl">
              Categories & Tags
            </h1>
          </div>
        </div>
      </header>

      <CategoriesTagsManager budgetId={budgetId as Id<'budgets'>} />
    </div>
  )
}
