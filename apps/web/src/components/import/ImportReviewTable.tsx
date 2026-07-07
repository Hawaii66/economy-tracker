import { Check } from 'lucide-react'
import { formatMoney } from '@/lib/format-money'
import type { ImportReviewRow } from '@/lib/import-review'
import { cn } from '@/lib/utils'

type ImportReviewTableProps = {
  rows: ImportReviewRow[]
  rulesById: Record<string, { name: string; keywords: string[] }>
  accountNames: Record<string, string>
  onRowsChange: (rows: ImportReviewRow[]) => void
  disabled?: boolean
}

function ApproveButton({
  approved,
  disabled,
  onClick,
  label,
}: {
  approved: boolean
  disabled?: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-8 items-center justify-center rounded-full border transition-colors',
        approved
          ? 'border-green-500/60 bg-green-500/15 text-green-400'
          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text)]',
        disabled && 'cursor-not-allowed opacity-40 hover:border-[var(--border)] hover:text-[var(--text-muted)]',
      )}
    >
      <Check className="size-4" strokeWidth={approved ? 2.5 : 2} />
    </button>
  )
}

export default function ImportReviewTable({
  rows,
  rulesById,
  accountNames,
  onRowsChange,
  disabled = false,
}: ImportReviewTableProps) {
  const approvedCount = rows.filter((row) => row.approved).length

  function updateRow(rowId: string, patch: Partial<ImportReviewRow>) {
    onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
  }

  function toggleApproved(row: ImportReviewRow) {
    updateRow(row.id, { approved: !row.approved })
  }

  function setAllApproved(approved: boolean) {
    onRowsChange(rows.map((row) => ({ ...row, approved })))
  }

  if (rows.length === 0) {
    return <p className="m-0 text-sm text-[var(--text-muted)]">No rows to review.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-sm text-[var(--text-muted)]">
          {approvedCount} of {rows.length} row{rows.length === 1 ? '' : 's'} approved
        </p>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            className="text-[var(--accent)] hover:underline disabled:opacity-50"
            onClick={() => setAllApproved(true)}
            disabled={disabled}
          >
            Approve all
          </button>
          <button
            type="button"
            className="text-[var(--text-muted)] hover:underline disabled:opacity-50"
            onClick={() => setAllApproved(false)}
            disabled={disabled}
          >
            Disapprove all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[52rem] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[5.75rem]" />
            <col className="w-[7.5rem]" />
            <col />
            <col className="w-[10rem]" />
            <col className="w-[7rem]" />
            <col className="w-12" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Verification</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-2 py-2" aria-label="Approve" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const matchedRule = row.matchedRuleId ? rulesById[row.matchedRuleId] : undefined
              const matchedRuleLabel = matchedRule
                ? matchedRule.keywords.join(', ') || matchedRule.name
                : null

              return (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-[var(--border)]',
                    row.approved && 'bg-[rgba(34,197,94,0.06)]',
                  )}
                >
                  <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[var(--text-muted)]">
                    {row.date}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle text-[var(--text-muted)]">
                    {accountNames[row.accountId] ?? row.accountId}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle text-[var(--text)]">
                    {row.description || '—'}
                    {matchedRuleLabel ? (
                      <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                        Rule: {matchedRuleLabel}
                      </span>
                    ) : null}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle tabular-nums text-[var(--text-muted)]">
                    {row.verificationNumber || '—'}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right align-middle font-semibold tabular-nums whitespace-nowrap',
                      row.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
                    )}
                  >
                    {formatMoney(row.amount)}
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    <ApproveButton
                      approved={row.approved}
                      disabled={disabled}
                      onClick={() => toggleApproved(row)}
                      label={
                        row.approved
                          ? `Disapprove ${row.description || 'transaction'}`
                          : `Approve ${row.description || 'transaction'}`
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
