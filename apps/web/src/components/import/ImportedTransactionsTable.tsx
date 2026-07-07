import { ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useState } from 'react'
import type { BudgetRawTransaction } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { cn } from '@/lib/utils'

type ImportedTransactionsTableProps = {
  transactions: BudgetRawTransaction[]
  accountNames: Record<string, string>
}

function ExpandedTransactionPanel({ transaction }: { transaction: BudgetRawTransaction }) {
  return (
    <div
      className="border-t border-[var(--border)] bg-[rgba(27,24,23,0.45)] py-4 pl-4 pr-10"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="m-0 text-sm text-[var(--text-muted)]">
        Categorization, tags, and split controls for{' '}
        <span className="text-[var(--text)]">{transaction.description || 'this transaction'}</span>{' '}
        will appear here.
      </p>
    </div>
  )
}

export default function ImportedTransactionsTable({
  transactions,
  accountNames,
}: ImportedTransactionsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const columnCount = 5

  function toggleExpanded(transactionId: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(transactionId)) {
        next.delete(transactionId)
      } else {
        next.add(transactionId)
      }
      return next
    })
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full min-w-[40rem] table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-8" />
          <col className="w-[5.75rem]" />
          <col className="w-[7.5rem]" />
          <col />
          <col className="w-[7rem]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
            <th className="px-2 py-2" aria-hidden="true" />
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Account</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const expanded = expandedIds.has(transaction.id)

            return (
              <Fragment key={transaction.id}>
                <tr
                  className={cn(
                    'cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[rgba(27,24,23,0.35)]',
                    expanded && 'border-b-0',
                  )}
                  onClick={() => toggleExpanded(transaction.id)}
                  aria-expanded={expanded}
                >
                  <td className="px-2 py-2.5 align-middle">
                    {expanded ? (
                      <ChevronDown className="size-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronRight className="size-4 text-[var(--text-muted)]" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[var(--text-muted)]">
                    {transaction.date}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle text-[var(--text-muted)]">
                    {accountNames[transaction.accountId] ?? transaction.accountId}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle text-[var(--text)]">
                    {transaction.description || '—'}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right align-middle font-semibold tabular-nums whitespace-nowrap',
                      transaction.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
                    )}
                  >
                    {formatMoney(transaction.amount)}
                  </td>
                </tr>
                {expanded ? (
                  <tr className="border-b border-[var(--border)]">
                    <td colSpan={columnCount} className="p-0">
                      <ExpandedTransactionPanel transaction={transaction} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
