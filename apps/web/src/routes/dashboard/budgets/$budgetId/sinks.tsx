import { createFileRoute } from '@tanstack/react-router'
import { Waves } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/sinks')({
  component: SinksPage,
})

function SinksPage() {
  return (
    <BudgetSectionPlaceholder
      title="Sinks"
      icon={Waves}
      description="Virtual envelopes for target-date goals, recurring bills, and capped reserves. Sinks stay decoupled from physical accounts so your budget reflects intent without locking cash to specific cards or accounts."
    />
  )
}
