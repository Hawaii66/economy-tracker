import { createFileRoute } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <BudgetSectionPlaceholder
      title="Settings"
      icon={Settings}
      description="Workspace configuration including genesis epoch onboarding, member roles, branch genealogy, and budget-specific preferences for shared or personal sandboxes."
    />
  )
}
