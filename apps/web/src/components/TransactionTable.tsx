import { formatMoney } from '@/lib/format-money'

type TransactionRow = {
  id: string
  accountId: string
  date: string
  amount: number
  description: string
}

type TransactionTableProps = {
  transactions: TransactionRow[]
  accountNames: Record<string, string>
}

export default function TransactionTable({
  transactions,
  accountNames,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--text-muted)]">
        No transactions imported yet. Upload a CSV on the Import page.
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
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="whitespace-nowrap text-[var(--text-muted)]">{transaction.date}</td>
              <td className="whitespace-nowrap">
                {accountNames[transaction.accountId] ?? transaction.accountId}
              </td>
              <td>{transaction.description || '—'}</td>
              <td
                className={`text-right font-semibold whitespace-nowrap ${
                  transaction.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]'
                }`}
              >
                {formatMoney(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
