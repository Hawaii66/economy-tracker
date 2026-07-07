import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/ledger')({
  component: LedgerPage,
})

function LedgerPage() {
  return (
    <BudgetSectionPlaceholder
      title="Ledger"
      icon={BookOpen}
      description="Sandbox ledger with immutable import records and user-adjustable transactions. Categorize expenses, assign sinks, and slice complex income without altering raw bank statement history."
    />
  )
}
