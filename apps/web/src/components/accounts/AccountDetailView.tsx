import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AccountIcon } from '@/components/accounts/AccountIcon'
import { FilteredLedgerPanel } from '@/components/ledger/FilteredLedgerPanel'
import { SpendingBarChart } from '@/components/charts/chart-panels'
import { toNamedAmounts } from '@/lib/chart-colors'
import { getAccounts, getLedgerTransactions } from '@/lib/budget-types'
import { statsForEntity } from '@/lib/entity-ledger-stats'
import { formatMoney } from '@/lib/format-money'
import { buildLedgerTableContext } from '@/lib/ledger-table-context'

type AccountDetailViewProps = {
  budgetId: string
  accountId: string
  state: Record<string, unknown>
}

export default function AccountDetailView({
  budgetId,
  accountId,
  state,
}: AccountDetailViewProps) {
  const accounts = getAccounts(state.accounts)
  const account = accounts.find((candidate) => candidate.id === accountId)
  const ledger = getLedgerTransactions(state.ledgerTransactions)
  const context = buildLedgerTableContext(state)
  const filters = { accountId }

  if (!account) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">This account could not be found.</p>
        <Link
          to="/dashboard/budgets/$budgetId/accounts"
          params={{ budgetId }}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] no-underline"
        >
          <ArrowLeft className="size-4" />
          Back to accounts
        </Link>
      </div>
    )
  }

  const stats = statsForEntity(ledger, filters)
  const accountShare = toNamedAmounts(
    accounts.map((candidate) => ({
      id: candidate.id,
      amount: Math.max(0, candidate.balance),
    })),
    (id) => accounts.find((candidate) => candidate.id === id)?.name ?? 'Unknown account',
    (id) => accounts.find((candidate) => candidate.id === id)?.color,
  ).slice(0, 6)

  return (
    <div className="budget-page">
      <Link
        to="/dashboard/budgets/$budgetId/accounts"
        params={{ budgetId }}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
      >
        <ArrowLeft className="size-4" />
        All accounts
      </Link>

      <header className="budget-page-header">
        <div className="flex items-start gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)]"
            style={{ backgroundColor: `${account.color}22`, color: account.color }}
          >
            <AccountIcon icon={account.icon} />
          </span>
          <div>
            <p className="kicker mb-1">Account</p>
            <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">
              {account.name}
            </h1>
            <p className="m-0 mt-1 text-lg font-semibold text-[var(--text)]">
              {formatMoney(account.balance, account.currency)}
            </p>
            {account.description ? (
              <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">{account.description}</p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="budget-panel">
          <h2 className="m-0 text-base font-semibold text-[var(--text)]">Summary</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Genesis date
              </dt>
              <dd className="m-0 mt-1 text-[var(--text)]">{account.genesisDate}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Transactions
              </dt>
              <dd className="m-0 mt-1 font-semibold text-[var(--text)]">{stats.transactionCount}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Total in
              </dt>
              <dd className="m-0 mt-1 font-semibold text-[var(--accent)]">
                {formatMoney(stats.totalIncome)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                Total out
              </dt>
              <dd className="m-0 mt-1 font-semibold text-[#E88A8A]">
                {formatMoney(stats.totalSpent)}
              </dd>
            </div>
          </dl>
          <p className="mb-0 mt-4 text-sm">
            <Link
              to="/dashboard/budgets/$budgetId/import"
              params={{ budgetId }}
              className="font-semibold text-[var(--accent)] no-underline hover:underline"
            >
              Import CSV for this account
            </Link>
          </p>
        </section>

        <SpendingBarChart
          title="Cash across accounts"
          description="Share of positive account balances in this budget."
          rows={accountShare}
          emptyMessage="Add accounts to compare cash allocation."
        />
      </div>

      <div className="mt-4">
        <FilteredLedgerPanel
          budgetId={budgetId}
          filters={filters}
          context={context}
          description="All ledger entries posted to this account."
          emptyMessage="No transactions on this account yet."
        />
      </div>
    </div>
  )
}
