import { createFileRoute } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/accounts')({
  component: AccountsPage,
})

function AccountsPage() {
  return (
    <BudgetSectionPlaceholder
      title="Accounts"
      icon={Wallet}
      description="Physical bank accounts with genesis opening balances and per-bank CSV templates. Internal transfers between accounts are tracked here separately from virtual sink allocations."
    />
  )
}
