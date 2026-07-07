import { createFileRoute } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import AccountsManager from '@/components/accounts/AccountsManager'
import type { Id } from '@economy-tracker/convex/dataModel'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/accounts')({
  component: AccountsPage,
})

function AccountsPage() {
  const { budgetId } = Route.useParams()

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <Wallet className="size-5" />
          </div>
          <div>
            <p className="kicker mb-1">Physical cash</p>
            <h1 className="display-title m-0 text-3xl text-[var(--text)] sm:text-4xl">Accounts</h1>
          </div>
        </div>
        <p className="mt-3 mb-0 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
          Physical bank accounts with genesis opening balances and per-bank CSV templates. Internal
          transfers between accounts are tracked here separately from virtual sink allocations.
        </p>
      </header>

      <AccountsManager budgetId={budgetId as Id<'budgets'>} />
    </div>
  )
}
