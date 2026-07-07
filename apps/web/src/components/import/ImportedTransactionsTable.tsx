import {
  findMatchingRule,
  minorUnitsToDecimalString,
  type MatchableRule,
  type RuleAssignment,
} from 'budget-core'
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { inputClassName } from '@/components/taxonomy/form-styles'
import type { BudgetRawTransaction } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { findInternalTransferCandidates } from '@/lib/internal-transfer'
import {
  buildInitialSplitRows,
  buildSaveImportedTransactionInput,
  createSplitRow,
  signedSliceAmountFromInput,
  splitRowsAreBalanced,
  sumSplitRowAmounts,
  type SaveImportedTransactionInput,
  type TransactionSplitRow,
} from '@/lib/transaction-split'
import { cn } from '@/lib/utils'

type CategoryOption = { id: string; name: string; color: string }
type TagOption = { id: string; name: string; color: string; kind: 'permanent' | 'temporary' }

type ImportedTransactionsTableProps = {
  transactions: BudgetRawTransaction[]
  accountNames: Record<string, string>
  categories: CategoryOption[]
  tags: TagOption[]
  rules: readonly MatchableRule[]
  rulesById: Record<string, { name: string; keywords: string[] }>
  onSave: (transaction: BudgetRawTransaction, input: SaveImportedTransactionInput) => Promise<void>
  onSaveInternalTransfer: (
    source: BudgetRawTransaction,
    counterparty: BudgetRawTransaction,
  ) => Promise<void>
  disabled?: boolean
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 shrink-0 rounded-full border border-[var(--border)]"
      style={{ backgroundColor: color }}
    />
  )
}

function TagBadge({
  name,
  color,
  selected,
  onClick,
  disabled,
}: {
  name: string
  color: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        selected
          ? 'border-[var(--accent)] bg-[rgba(196,149,106,0.15)] text-[var(--text)]'
          : 'border-[var(--border)] bg-transparent text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text)]',
      )}
    >
      <ColorSwatch color={color} />
      {name}
    </button>
  )
}

function TagBadgeGrid({
  tags,
  lifestyleTagIds,
  eventTagIds,
  disabled,
  onToggleLifestyleTag,
  onToggleEventTag,
}: {
  tags: TagOption[]
  lifestyleTagIds: string[]
  eventTagIds: string[]
  disabled?: boolean
  onToggleLifestyleTag: (tagId: string) => void
  onToggleEventTag: (tagId: string) => void
}) {
  const permanentTags = tags.filter((tag) => tag.kind === 'permanent')
  const temporaryTags = tags.filter((tag) => tag.kind === 'temporary')

  if (tags.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--text-muted)]">
        No tags yet. Create tags under Categories & Tags.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {permanentTags.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
            Permanent
          </p>
          <div className="flex flex-wrap gap-2">
            {permanentTags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                color={tag.color}
                selected={lifestyleTagIds.includes(tag.id)}
                disabled={disabled}
                onClick={() => onToggleLifestyleTag(tag.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {temporaryTags.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
            Temporary
          </p>
          <div className="flex flex-wrap gap-2">
            {temporaryTags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
                color={tag.color}
                selected={eventTagIds.includes(tag.id)}
                disabled={disabled}
                onClick={() => onToggleEventTag(tag.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AssignmentFields({
  assignment,
  categories,
  tags,
  disabled,
  onAssignmentChange,
  align = 'right',
}: {
  assignment: RuleAssignment
  categories: CategoryOption[]
  tags: TagOption[]
  disabled?: boolean
  onAssignmentChange: (assignment: RuleAssignment) => void
  align?: 'left' | 'right'
}) {
  const textAlign = align === 'right' ? 'text-right' : 'text-left'

  function toggleLifestyleTag(tagId: string) {
    const lifestyleTagIds = assignment.lifestyleTagIds.includes(tagId)
      ? assignment.lifestyleTagIds.filter((id) => id !== tagId)
      : [...assignment.lifestyleTagIds, tagId]
    onAssignmentChange({ ...assignment, lifestyleTagIds })
  }

  function toggleEventTag(tagId: string) {
    const eventTagIds = assignment.eventTagIds.includes(tagId)
      ? assignment.eventTagIds.filter((id) => id !== tagId)
      : [...assignment.eventTagIds, tagId]
    onAssignmentChange({ ...assignment, eventTagIds })
  }

  return (
    <div className="grid w-full gap-x-2 gap-y-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      <label className={cn('flex flex-col gap-1 text-sm font-semibold text-[var(--text)]', textAlign)}>
        Category
        <select
          className={inputClassName}
          value={assignment.categoryId ?? ''}
          onChange={(event) =>
            onAssignmentChange({
              ...assignment,
              categoryId: event.target.value || null,
            })
          }
          disabled={disabled}
        >
          <option value="">None</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <div className={cn('flex flex-col gap-2', align === 'right' && 'pr-2')}>
        <p className={cn('m-0 text-sm font-semibold text-[var(--text)]', textAlign)}>Tags</p>
        <TagBadgeGrid
          tags={tags}
          lifestyleTagIds={assignment.lifestyleTagIds}
          eventTagIds={assignment.eventTagIds}
          disabled={disabled}
          onToggleLifestyleTag={toggleLifestyleTag}
          onToggleEventTag={toggleEventTag}
        />
      </div>
    </div>
  )
}

function SplitRowEditor({
  row,
  rowIndex,
  transaction,
  categories,
  tags,
  matchedRuleLabel,
  disabled,
  onAmountChange,
  onAssignmentChange,
  onRemove,
}: {
  row: TransactionSplitRow
  rowIndex: number
  transaction: BudgetRawTransaction
  categories: CategoryOption[]
  tags: TagOption[]
  matchedRuleLabel: string | null
  disabled?: boolean
  onAmountChange: (amountMinor: number) => void
  onAssignmentChange: (assignment: RuleAssignment) => void
  onRemove: () => void
}) {
  const [amountInput, setAmountInput] = useState(
    minorUnitsToDecimalString(Math.abs(row.amountMinor)),
  )

  useEffect(() => {
    setAmountInput(minorUnitsToDecimalString(Math.abs(row.amountMinor)))
  }, [row.amountMinor])

  function handleAmountBlur() {
    const parsed = signedSliceAmountFromInput(amountInput, transaction.amount)
    if (parsed === null) {
      setAmountInput(minorUnitsToDecimalString(Math.abs(row.amountMinor)))
      return
    }
    onAmountChange(parsed)
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.35)] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="m-0 text-sm font-semibold text-[var(--text)]">Split {rowIndex + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          Remove
        </button>
      </div>

      {matchedRuleLabel ? (
        <p className="mb-3 text-xs text-[var(--text-muted)]">
          Auto-applied from rule:{' '}
          <span className="text-[var(--text)]">{matchedRuleLabel}</span>
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,10rem)_1fr]">
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Amount
          <input
            className={inputClassName}
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            onBlur={handleAmountBlur}
            disabled={disabled}
          />
        </label>

        <AssignmentFields
          assignment={row.assignment}
          categories={categories}
          tags={tags}
          disabled={disabled}
          onAssignmentChange={onAssignmentChange}
          align="left"
        />
      </div>
    </div>
  )
}

function InternalTransferPanel({
  transaction,
  candidates,
  accountNames,
  selectedCounterpartyId,
  disabled,
  isSaving,
  onSelectCounterparty,
  onSave,
}: {
  transaction: BudgetRawTransaction
  candidates: BudgetRawTransaction[]
  accountNames: Record<string, string>
  selectedCounterpartyId: string | null
  disabled?: boolean
  isSaving?: boolean
  onSelectCounterparty: (counterpartyId: string) => void
  onSave: () => void
}) {
  return (
    <div className="ml-auto max-w-2xl pr-2">
      <p className="m-0 text-sm text-[var(--text-muted)]">
        Internal transfers move cash between your own accounts without affecting expense
        categories. Pick the matching transaction from another account with the opposite amount.
      </p>

      {candidates.length === 0 ? (
        <p className="mt-4 mb-0 text-sm text-[#e88a8a]">
          No matching transaction found in another account for {formatMoney(transaction.amount)}.
          Import the other side of this transfer first.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {candidates.map((candidate) => {
            const selected = selectedCounterpartyId === candidate.id

            return (
              <label
                key={candidate.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors',
                  selected
                    ? 'border-[var(--accent)] bg-[rgba(94,174,255,0.08)]'
                    : 'border-[var(--border)] hover:border-[var(--text-muted)]',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <input
                  type="radio"
                  name={`transfer-counterparty-${transaction.id}`}
                  className="mt-1"
                  checked={selected}
                  disabled={disabled || isSaving}
                  onChange={() => onSelectCounterparty(candidate.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--text)]">
                    {accountNames[candidate.accountId] ?? candidate.accountId}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-[var(--text-muted)]">
                    {candidate.date} · {candidate.description || '—'}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-[var(--text)]">
                    {formatMoney(candidate.amount)}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          disabled={disabled || isSaving || !selectedCounterpartyId || candidates.length === 0}
          onClick={onSave}
        >
          {isSaving ? 'Saving…' : 'Save internal transfer'}
        </Button>
      </div>
    </div>
  )
}

function ExpandedTransactionPanel({
  transaction,
  splitRows,
  categories,
  tags,
  rules,
  matchedRuleLabel,
  transferCandidates,
  accountNames,
  isInternalTransfer,
  selectedCounterpartyId,
  disabled,
  isSaving,
  onInternalTransferChange,
  onSelectCounterparty,
  onSplitRowsChange,
  onSave,
  onSaveInternalTransfer,
}: {
  transaction: BudgetRawTransaction
  splitRows: TransactionSplitRow[]
  categories: CategoryOption[]
  tags: TagOption[]
  rules: readonly MatchableRule[]
  matchedRuleLabel: string | null
  transferCandidates: BudgetRawTransaction[]
  accountNames: Record<string, string>
  isInternalTransfer: boolean
  selectedCounterpartyId: string | null
  disabled?: boolean
  isSaving?: boolean
  onInternalTransferChange: (enabled: boolean) => void
  onSelectCounterparty: (counterpartyId: string) => void
  onSplitRowsChange: (rows: TransactionSplitRow[]) => void
  onSave: () => void
  onSaveInternalTransfer: () => void
}) {
  const allocated = sumSplitRowAmounts(splitRows)
  const remaining = transaction.amount - allocated
  const isBalanced = splitRowsAreBalanced(transaction.amount, splitRows)
  const isSplit = splitRows.length > 1
  const singleRow = splitRows[0]

  function updateRow(rowId: string, patch: Partial<TransactionSplitRow>) {
    onSplitRowsChange(
      splitRows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    )
  }

  function addRow() {
    onSplitRowsChange([...splitRows, createSplitRow(transaction, rules, 0)])
  }

  function removeRow(rowId: string) {
    if (splitRows.length <= 1) {
      return
    }

    const next = splitRows.filter((row) => row.id !== rowId)
    if (next.length === 1 && next[0]) {
      next[0] = { ...next[0], amountMinor: transaction.amount }
    }

    onSplitRowsChange(next)
  }

  return (
    <div
      className="border-t border-[var(--border)] bg-[rgba(27,24,23,0.45)] py-4 pl-4 pr-10"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-2">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <input
            type="checkbox"
            checked={isInternalTransfer}
            disabled={disabled || isSaving}
            onChange={(event) => onInternalTransferChange(event.target.checked)}
          />
          Internal transfer
        </label>

        {!isInternalTransfer ? (
          <Button type="button" variant="outline" size="sm" disabled={disabled || isSaving} onClick={addRow}>
            <Plus />
            Add split
          </Button>
        ) : null}
      </div>

      {isInternalTransfer ? (
        <InternalTransferPanel
          transaction={transaction}
          candidates={transferCandidates}
          accountNames={accountNames}
          selectedCounterpartyId={selectedCounterpartyId}
          disabled={disabled}
          isSaving={isSaving}
          onSelectCounterparty={onSelectCounterparty}
          onSave={onSaveInternalTransfer}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-2">
            {isSplit ? (
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Split across categories</p>
                <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                  Total {formatMoney(transaction.amount)}
                  {' '}
                  · Allocated {formatMoney(allocated)}
                  {' '}
                  · Remaining{' '}
                  <span className={remaining === 0 ? 'text-green-400' : 'text-[#e88a8a]'}>
                    {formatMoney(remaining)}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex flex-1 justify-end">
                {matchedRuleLabel ? (
                  <p className="m-0 text-right text-xs text-[var(--text-muted)]">
                    Auto-applied from rule:{' '}
                    <span className="text-[var(--text)]">{matchedRuleLabel}</span>
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {isSplit ? (
            <div className="flex flex-col gap-3 pr-2">
              {splitRows.map((row, index) => (
                <SplitRowEditor
                  key={row.id}
                  row={row}
                  rowIndex={index}
                  transaction={transaction}
                  categories={categories}
                  tags={tags}
                  matchedRuleLabel={matchedRuleLabel}
                  disabled={disabled || isSaving}
                  onAmountChange={(amountMinor) => updateRow(row.id, { amountMinor })}
                  onAssignmentChange={(assignment) => updateRow(row.id, { assignment })}
                  onRemove={() => removeRow(row.id)}
                />
              ))}
            </div>
          ) : singleRow ? (
            <div className="ml-auto max-w-2xl pr-2">
              <AssignmentFields
                assignment={singleRow.assignment}
                categories={categories}
                tags={tags}
                disabled={disabled || isSaving}
                onAssignmentChange={(assignment) => updateRow(singleRow.id, { assignment })}
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 pr-2">
            {isSplit && !isBalanced ? (
              <p className="m-0 text-sm text-[#e88a8a]">
                Split amounts must add up to {formatMoney(transaction.amount)}.
              </p>
            ) : null}
            <Button
              type="button"
              disabled={disabled || isSaving || (isSplit && !isBalanced)}
              onClick={onSave}
            >
              {isSaving ? 'Saving…' : isSplit ? 'Save splits to ledger' : 'Save to ledger'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function buildSplitRowsForTransactions(
  transactions: readonly BudgetRawTransaction[],
  rules: readonly MatchableRule[],
  current: Record<string, TransactionSplitRow[]>,
): Record<string, TransactionSplitRow[]> {
  const next: Record<string, TransactionSplitRow[]> = {}

  for (const transaction of transactions) {
    next[transaction.id] =
      current[transaction.id] ?? buildInitialSplitRows(transaction, rules)
  }

  return next
}

export default function ImportedTransactionsTable({
  transactions,
  accountNames,
  categories,
  tags,
  rules,
  rulesById,
  onSave,
  onSaveInternalTransfer,
  disabled = false,
}: ImportedTransactionsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [splitRowsByTransactionId, setSplitRowsByTransactionId] = useState<
    Record<string, TransactionSplitRow[]>
  >({})
  const [internalTransferByTransactionId, setInternalTransferByTransactionId] = useState<
    Record<string, boolean>
  >({})
  const [counterpartyByTransactionId, setCounterpartyByTransactionId] = useState<
    Record<string, string>
  >({})
  const [savingTransactionId, setSavingTransactionId] = useState<string | null>(null)
  const columnCount = 5

  const reservedCounterpartyIds = new Set(Object.values(counterpartyByTransactionId))

  useEffect(() => {
    setSplitRowsByTransactionId((current) =>
      buildSplitRowsForTransactions(transactions, rules, current),
    )
  }, [transactions, rules])

  useEffect(() => {
    setExpandedIds((current) => {
      const validIds = new Set(transactions.map((transaction) => transaction.id))
      const stillExpanded = [...current].filter((id) => validIds.has(id))
      if (stillExpanded.length > 0) {
        return new Set(stillExpanded)
      }

      const first = transactions[0]
      return first ? new Set([first.id]) : new Set()
    })
  }, [transactions])

  function expandFirstTransaction(remaining: readonly BudgetRawTransaction[]) {
    const first = remaining[0]
    setExpandedIds(first ? new Set([first.id]) : new Set())
  }

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

  async function handleSave(transaction: BudgetRawTransaction) {
    const splitRows = splitRowsByTransactionId[transaction.id]
    if (!splitRows || splitRows.length === 0) {
      return
    }

    if (splitRows.length > 1 && !splitRowsAreBalanced(transaction.amount, splitRows)) {
      return
    }

    setSavingTransactionId(transaction.id)

    try {
      await onSave(transaction, buildSaveImportedTransactionInput(splitRows))
      expandFirstTransaction(transactions.filter((item) => item.id !== transaction.id))
    } finally {
      setSavingTransactionId(null)
    }
  }

  async function handleSaveInternalTransfer(transaction: BudgetRawTransaction) {
    const counterpartyId = counterpartyByTransactionId[transaction.id]
    const counterparty = transactions.find((item) => item.id === counterpartyId)
    if (!counterparty) {
      return
    }

    setSavingTransactionId(transaction.id)

    try {
      await onSaveInternalTransfer(transaction, counterparty)
      setInternalTransferByTransactionId((current) => {
        const next = { ...current }
        delete next[transaction.id]
        delete next[counterparty.id]
        return next
      })
      setCounterpartyByTransactionId((current) => {
        const next = { ...current }
        delete next[transaction.id]
        return next
      })
      expandFirstTransaction(
        transactions.filter(
          (item) => item.id !== transaction.id && item.id !== counterparty.id,
        ),
      )
    } finally {
      setSavingTransactionId(null)
    }
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
            const splitRows =
              splitRowsByTransactionId[transaction.id] ??
              buildInitialSplitRows(transaction, rules)
            const matchedRule = findMatchingRule(transaction.description, rules)
            const matchedRuleMeta = matchedRule ? rulesById[matchedRule.id] : undefined
            const matchedRuleLabel = matchedRuleMeta
              ? matchedRuleMeta.keywords.join(', ') || matchedRuleMeta.name
              : null
            const isReservedCounterparty = reservedCounterpartyIds.has(transaction.id)
            const reservedByTransaction = transactions.find(
              (item) => counterpartyByTransactionId[item.id] === transaction.id,
            )
            const selectedCounterpartyId = counterpartyByTransactionId[transaction.id] ?? null
            const transferCandidates = findInternalTransferCandidates(
              transaction,
              transactions.filter((candidate) => {
                if (candidate.id === transaction.id) {
                  return false
                }

                // Keep the selected match visible even though it is reserved for this pair.
                if (candidate.id === selectedCounterpartyId) {
                  return true
                }

                return !reservedCounterpartyIds.has(candidate.id)
              }),
            )
            const isInternalTransfer = internalTransferByTransactionId[transaction.id] ?? false

            return (
              <Fragment key={transaction.id}>
                <tr
                  className={cn(
                    'border-b border-[var(--border)] transition-colors',
                    isReservedCounterparty
                      ? 'bg-[rgba(94,174,255,0.06)]'
                      : 'cursor-pointer hover:bg-[rgba(27,24,23,0.35)]',
                    expanded && 'border-b-0',
                  )}
                  onClick={() => {
                    if (!isReservedCounterparty) {
                      toggleExpanded(transaction.id)
                    }
                  }}
                  aria-expanded={expanded}
                >
                  <td className="px-2 py-2.5 align-middle">
                    {isReservedCounterparty ? (
                      <span className="inline-block size-4" aria-hidden="true" />
                    ) : expanded ? (
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
                    {isReservedCounterparty && reservedByTransaction ? (
                      <span className="mt-0.5 block truncate text-xs text-[var(--accent)]">
                        Paired with {reservedByTransaction.description || 'transfer'}
                      </span>
                    ) : null}
                    {matchedRuleLabel ? (
                      <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                        Rule: {matchedRuleLabel}
                      </span>
                    ) : null}
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
                {expanded && !isReservedCounterparty ? (
                  <tr className="border-b border-[var(--border)]">
                    <td colSpan={columnCount} className="p-0">
                      <ExpandedTransactionPanel
                        transaction={transaction}
                        splitRows={splitRows}
                        categories={categories}
                        tags={tags}
                        rules={rules}
                        matchedRuleLabel={matchedRuleLabel}
                        transferCandidates={transferCandidates}
                        accountNames={accountNames}
                        isInternalTransfer={isInternalTransfer}
                        selectedCounterpartyId={selectedCounterpartyId}
                        disabled={disabled}
                        isSaving={savingTransactionId === transaction.id}
                        onInternalTransferChange={(enabled) => {
                          setInternalTransferByTransactionId((current) => ({
                            ...current,
                            [transaction.id]: enabled,
                          }))
                          if (!enabled) {
                            setCounterpartyByTransactionId((current) => {
                              const next = { ...current }
                              delete next[transaction.id]
                              return next
                            })
                          }
                        }}
                        onSelectCounterparty={(counterpartyId) =>
                          setCounterpartyByTransactionId((current) => ({
                            ...current,
                            [transaction.id]: counterpartyId,
                          }))
                        }
                        onSplitRowsChange={(rows) =>
                          setSplitRowsByTransactionId((current) => ({
                            ...current,
                            [transaction.id]: rows,
                          }))
                        }
                        onSave={() => void handleSave(transaction)}
                        onSaveInternalTransfer={() => void handleSaveInternalTransfer(transaction)}
                      />
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
