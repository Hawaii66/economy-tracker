import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import TransactionTable from '@/components/TransactionTable'
import {
  getAccounts,
  getLedgerTransactions,
  getRawTransactions,
} from '@/lib/budget-types'

export const Route = createFileRoute('/dashboard/budgets/$budgetId/ledger')({
  component: LedgerPage,
})

function LedgerPage() {
  const { budgetId } = Route.useParams()
  const { data, isPending, isError } = useQuery(
    convexQuery(api.budgets.getBudgetState, {
      budgetId: budgetId as Id<'budgets'>,
    }),
  )

  if (isPending) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading budget…</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">
          This budget could not be loaded. You may not have access.
        </p>
      </div>
    )
  }

  const accounts = getAccounts(data.state.accounts)
  const accountNames = Object.fromEntries(accounts.map((account) => [account.id, account.name]))
  const rawTransactions = getRawTransactions(data.state.rawTransactions)
  const ledgerTransactions = getLedgerTransactions(data.state.ledgerTransactions)

  return (
    <div className="budget-page">
      <header className="budget-page-header">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]">
            <BookOpen className="size-5" />
          </span>
          <div>
            <p className="kicker mb-1">Transactions</p>
            <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">Ledger</h1>
          </div>
        </div>
      </header>

      <section className="budget-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Raw imports</h2>
            <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
              Immutable bank statement rows from CSV imports.
            </p>
          </div>
          {rawTransactions.length === 0 ? (
            <Link
              to="/dashboard/budgets/$budgetId/import"
              params={{ budgetId }}
              className="btn-primary text-sm no-underline"
            >
              Import CSV
            </Link>
          ) : null}
        </div>

        <TransactionTable transactions={rawTransactions} accountNames={accountNames} />
      </section>

      {ledgerTransactions.length > 0 ? (
        <section className="budget-panel">
          <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Ledger entries</h2>
          <p className="mt-2 mb-4 text-sm text-[var(--text-muted)]">
            User-adjustable sandbox transactions.
          </p>
          <TransactionTable
            transactions={ledgerTransactions.map((transaction) => ({
              id: transaction.id,
              accountId: transaction.accountId,
              date: transaction.date,
              amount: transaction.amount,
              description: transaction.description,
            }))}
            accountNames={accountNames}
          />
        </section>
      ) : null}
    </div>
  )
}
