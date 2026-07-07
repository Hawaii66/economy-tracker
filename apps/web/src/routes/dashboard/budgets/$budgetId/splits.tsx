import { createFileRoute } from '@tanstack/react-router'
import { Split } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/splits')({
  component: SplitsPage,
})

function SplitsPage() {
  return (
    <BudgetSectionPlaceholder
      title="Splits"
      icon={Split}
      description="Select and connect Swish reimbursements to original outflows after they land in your accounts. Collaborative shared budgets let partners link their settlement transfers to tagged split expenses."
    />
  )
}
