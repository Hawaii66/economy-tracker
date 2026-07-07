import { Link2 } from 'lucide-react'
import type { BudgetLedgerTransaction, BudgetRawTransaction } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { cn } from '@/lib/utils'
import { ledgerRowId } from '@/lib/ledger-navigation'

type RawImportsTableProps = {
  transactions: BudgetRawTransaction[]
  ledgerByRawId: Map<string, BudgetLedgerTransaction>
  accountNames: Record<string, string>
  highlightedId: string | null
  onNavigateToLedger: (ledgerId: string) => void
}

export default function RawImportsTable({
  transactions,
  ledgerByRawId,
  accountNames,
  highlightedId,
  onNavigateToLedger,
}: RawImportsTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--text-muted)]">
        No bank imports yet. Upload a CSV on the Import page.
      </p>
    )
  }

  return (
    <div className="demo-table-shell">
      <table className="demo-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Account</th>
            <th>Description</th>
            <th className="text-right">Amount</th>
            <th>Ledger link</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const linkedLedger = ledgerByRawId.get(transaction.id)
            const isHighlighted = highlightedId === transaction.id

            return (
              <tr
                key={transaction.id}
                id={ledgerRowId('raw', transaction.id)}
                className={cn(isHighlighted && 'ledger-row-highlight')}
              >
                <td className="whitespace-nowrap text-[var(--text-muted)]">{transaction.date}</td>
                <td className="whitespace-nowrap">
                  {accountNames[transaction.accountId] ?? transaction.accountId}
                </td>
                <td>{transaction.description || '\u2014'}</td>
                <td
                  className={cn(
                    'text-right font-semibold whitespace-nowrap',
                    transaction.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
                  )}
                >
                  {formatMoney(transaction.amount)}
                </td>
                <td>
                  {linkedLedger ? (
                    <button
                      type="button"
                      className="demo-pill demo-pill-button"
                      onClick={() => onNavigateToLedger(linkedLedger.id)}
                    >
                      <Link2 className="size-3" />
                      Ledger
                    </button>
                  ) : (
                    <span className="demo-pill">Awaiting categorization</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
