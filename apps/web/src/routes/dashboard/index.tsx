import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
})

function DashboardHome() {
  const { data: budgets, isPending } = useQuery(
    convexQuery(api.budgets.listMyBudgets, {}),
  )
  const createBudget = useMutation(api.budgets.createBudget)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreateBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setIsCreating(true)
    try {
      await createBudget({ name: trimmedName })
      setName('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-8">
      <section className="panel rounded-2xl p-6 sm:p-8">
        <p className="kicker mb-2">Your budgets</p>
        <h1 className="display-title mb-6 text-3xl text-[var(--text)] sm:text-4xl">
          Dashboard
        </h1>

        <form
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => void handleCreateBudget(event)}
        >
          <label className="flex flex-1 flex-col gap-1.5 text-sm font-semibold text-[var(--text)]">
            New budget
            <input
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base font-normal text-[var(--text)] outline-none focus:border-[rgba(94,174,255,0.5)]"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Household, vacation, project…"
              disabled={isCreating}
            />
          </label>
          <Button type="submit" disabled={isCreating || !name.trim()}>
            {isCreating ? 'Creating…' : 'Create budget'}
          </Button>
        </form>

        {isPending ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">Loading budgets…</p>
        ) : budgets && budgets.length > 0 ? (
          <ul className="m-0 grid list-none gap-3 p-0">
            {budgets.map((budget) => (
              <li key={budget._id}>
                <Link
                  to="/dashboard/budgets/$budgetId"
                  params={{ budgetId: budget._id }}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 no-underline transition hover:-translate-y-0.5 hover:border-[rgba(94,174,255,0.35)]"
                >
                  <span className="font-semibold text-[var(--text)]">{budget.name}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {budget.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            No budgets yet. Create one above to get started.
          </p>
        )}
      </section>
    </main>
  )
}
