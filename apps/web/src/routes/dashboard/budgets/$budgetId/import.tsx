import { createFileRoute } from '@tanstack/react-router'
import { Import } from 'lucide-react'
import BudgetSectionPlaceholder from '@/components/BudgetSectionPlaceholder'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/import')({
  component: ImportPage,
})

function ImportPage() {
  return (
    <BudgetSectionPlaceholder
      title="Import"
      icon={Import}
      description="Upload Swedish bank CSV exports with per-account parser mappings. The engine handles semicolon delimiters, locale number formats, and character encoding before matching rules run on new rows."
    />
  )
}
