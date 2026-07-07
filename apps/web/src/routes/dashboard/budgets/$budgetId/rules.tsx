import { createFileRoute } from '@tanstack/react-router'
import { Wand2 } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/rules')({
  component: RulesPage,
})

function RulesPage() {
  return (
    <BudgetSectionPlaceholder
      title="Rules"
      icon={Wand2}
      description="Keyword-matching rules that auto-categorize, tag, and route imported transactions to sinks on ingest. Each account can have its own mapping dictionary for bank-specific CSV quirks."
    />
  )
}
