import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import {
  AccountEditModal,
  type AccountFormValues,
  type BudgetAccountRecord,
} from '@/components/accounts/AccountEditModal'
import { AccountIcon } from '@/components/accounts/AccountIcon'
import { Button } from '@/components/ui/button'
import { useAppendBudgetEvents } from '@/hooks/use-append-budget-events'
import { formatMoney } from '@/lib/format-money'
import { generateEntityId } from '@/lib/taxonomy'

type AccountsManagerProps = {
  budgetId: Id<'budgets'>
}

function asAccounts(value: unknown): BudgetAccountRecord[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return []
  }

  return Object.values(value as Record<string, BudgetAccountRecord>).sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

export default function AccountsManager({ budgetId }: AccountsManagerProps) {
  const submitEvents = useAppendBudgetEvents(budgetId)
  const { data, isPending } = useQuery(convexQuery(api.budgets.getBudgetState, { budgetId }))

  const [isSaving, setIsSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BudgetAccountRecord | undefined>()

  if (isPending || !data) {
    return (
      <section className="budget-panel">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading accounts…</p>
      </section>
    )
  }

  const accounts = asAccounts(data.state.accounts)

  async function runMutation(task: () => Promise<void>) {
    setIsSaving(true)
    try {
      await task()
    } finally {
      setIsSaving(false)
    }
  }

  function openCreateAccount() {
    setEditingAccount(undefined)
    setModalOpen(true)
  }

  function openEditAccount(account: BudgetAccountRecord) {
    setEditingAccount(account)
    setModalOpen(true)
  }

  async function handleSaveAccount(values: AccountFormValues) {
    if (editingAccount) {
      const events: Array<{ eventType: string; payload: Record<string, unknown> }> = [
        {
          eventType: 'ACCOUNT_UPDATED',
          payload: {
            accountId: editingAccount.id,
            name: values.name,
            description: values.description,
            color: values.color,
            icon: values.icon,
          },
        },
      ]

      if (values.openingBalance !== editingAccount.balance) {
        events.push({
          eventType: 'ACCOUNT_BALANCE_ADJUSTED',
          payload: {
            accountId: editingAccount.id,
            newBalance: values.openingBalance,
            reason: 'Manual balance update',
          },
        })
      }

      await runMutation(() => submitEvents(events))
      return
    }

    const accountId = generateEntityId()
    await runMutation(() =>
      submitEvents([
        {
          eventType: 'ACCOUNT_ADDED',
          payload: {
            accountId,
            name: values.name,
            description: values.description,
            color: values.color,
            icon: values.icon,
            openingBalance: values.openingBalance,
            currency: 'SEK',
            genesisDate: values.genesisDate,
          },
        },
      ]),
    )
  }

  return (
    <>
      <section className="budget-panel">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Your accounts</h2>
            <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
              Physical bank accounts with genesis opening balances. Internal transfers and CSV
              imports build on top of these day-zero baselines.
            </p>
          </div>
          <Button onClick={openCreateAccount}>
            <Plus />
            Add account
          </Button>
        </div>

        {accounts.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {accounts.map((account) => (
                <article
                  key={account.id}
                  className="rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)]"
                        style={{ backgroundColor: `${account.color}22`, color: account.color }}
                      >
                        <AccountIcon icon={account.icon} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="m-0 truncate text-base font-semibold text-[var(--text)]">
                          {account.name}
                        </h3>
                        <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">
                          {account.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openEditAccount(account)}>
                      <Pencil />
                      Edit
                    </Button>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                        Balance
                      </dt>
                      <dd className="m-0 mt-1 font-semibold text-[var(--text)]">
                        {formatMoney(account.balance, account.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                        Genesis date
                      </dt>
                      <dd className="m-0 mt-1 text-[var(--text)]">{account.genesisDate}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">No accounts yet.</p>
        )}
      </section>

      <AccountEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        account={editingAccount}
        onSave={handleSaveAccount}
        isSaving={isSaving}
      />
    </>
  )
}
