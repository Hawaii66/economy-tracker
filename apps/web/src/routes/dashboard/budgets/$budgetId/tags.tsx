import { createFileRoute } from '@tanstack/react-router'
import { Tags } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/tags')({
  component: TagsPage,
})

function TagsPage() {
  return (
    <BudgetSectionPlaceholder
      title="Categories & Tags"
      icon={Tags}
      description="One structural category per transaction, plus permanent lifestyle tags and temporary event tags. Archive event tags when a project ends while keeping their historical data searchable."
    />
  )
}
