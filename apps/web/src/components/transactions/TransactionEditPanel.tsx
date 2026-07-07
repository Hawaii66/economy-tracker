import {
  assignmentsHaveSinks,
  minorUnitsToDecimalString,
  type MatchableRule,
  type RuleAssignment,
} from 'budget-core'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { inputClassName } from '@/components/taxonomy/form-styles'
import type { CategoryOption, EditableTransaction, SinkOption, TagOption } from '@/components/transactions/types'
import { formatMoney } from '@/lib/format-money'
import {
  createSplitRow,
  signedSliceAmountFromInput,
  splitRowsAreBalanced,
  sumSplitRowAmounts,
  type TransactionSplitRow,
} from '@/lib/transaction-split'
import { cn } from '@/lib/utils'

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
  sinks,
  tags,
  disabled,
  onAssignmentChange,
  align = 'right',
}: {
  assignment: RuleAssignment
  categories: CategoryOption[]
  sinks: SinkOption[]
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
    <div className="grid w-full gap-x-2 gap-y-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_minmax(0,1fr)]">
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

      <label className={cn('flex flex-col gap-1 text-sm font-semibold text-[var(--text)]', textAlign)}>
        Sink
        <select
          className={inputClassName}
          value={assignment.sinkId ?? ''}
          onChange={(event) =>
            onAssignmentChange({
              ...assignment,
              sinkId: event.target.value || null,
            })
          }
          disabled={disabled}
          required
        >
          <option value="">Select sink…</option>
          {sinks.map((sink) => (
            <option key={sink.id} value={sink.id}>
              {sink.name}
            </option>
          ))}
        </select>
        {sinks.length === 0 ? (
          <p className="m-0 text-xs font-normal text-[var(--text-muted)]">
            No sinks yet. Create sinks under Sinks.
          </p>
        ) : null}
      </label>

      <div className={cn('flex flex-col gap-2 sm:col-span-1', align === 'right' && 'pr-2')}>
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
  sinks,
  tags,
  matchedRuleLabel,
  disabled,
  onAmountChange,
  onAssignmentChange,
  onRemove,
}: {
  row: TransactionSplitRow
  rowIndex: number
  transaction: EditableTransaction
  categories: CategoryOption[]
  sinks: SinkOption[]
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
          sinks={sinks}
          tags={tags}
          disabled={disabled}
          onAssignmentChange={onAssignmentChange}
          align="left"
        />
      </div>
    </div>
  )
}

function InternalTransferPanel<T extends EditableTransaction>({
  transaction,
  candidates,
  accountNames,
  selectedCounterpartyId,
  disabled,
  isSaving,
  emptyMessage,
  saveTransferLabel = 'Save internal transfer',
  onSelectCounterparty,
  onSave,
}: {
  transaction: T
  candidates: readonly T[]
  accountNames: Record<string, string>
  selectedCounterpartyId: string | null
  disabled?: boolean
  isSaving?: boolean
  emptyMessage?: string
  saveTransferLabel?: string
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
          {emptyMessage ??
            `No matching transaction found in another account for ${formatMoney(transaction.amount)}.`}
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
                    {candidate.date} · {candidate.description || '\u2014'}
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
          {isSaving ? 'Saving…' : saveTransferLabel}
        </Button>
      </div>
    </div>
  )
}

export type TransactionEditPanelProps = {
  transaction: EditableTransaction
  splitRows: TransactionSplitRow[]
  categories: CategoryOption[]
  sinks: SinkOption[]
  tags: TagOption[]
  rules: readonly MatchableRule[]
  matchedRuleLabel: string | null
  transferCandidates: readonly EditableTransaction[]
  accountNames: Record<string, string>
  isInternalTransfer: boolean
  selectedCounterpartyId: string | null
  disabled?: boolean
  isSaving?: boolean
  transferEmptyMessage?: string
  saveLabel?: string
  saveSplitLabel?: string
  saveTransferLabel?: string
  embedded?: boolean
  onUnlinkInternalTransfer?: () => void
  onInternalTransferChange: (enabled: boolean) => void
  onSelectCounterparty: (counterpartyId: string) => void
  onSplitRowsChange: (rows: TransactionSplitRow[]) => void
  onSave: () => void
  onSaveInternalTransfer: () => void
}

export default function TransactionEditPanel({
  transaction,
  splitRows,
  categories,
  sinks,
  tags,
  rules,
  matchedRuleLabel,
  transferCandidates,
  accountNames,
  isInternalTransfer,
  selectedCounterpartyId,
  disabled,
  isSaving,
  transferEmptyMessage,
  saveLabel = 'Save to ledger',
  saveSplitLabel = 'Save splits to ledger',
  saveTransferLabel = 'Save internal transfer',
  embedded = true,
  onUnlinkInternalTransfer,
  onInternalTransferChange,
  onSelectCounterparty,
  onSplitRowsChange,
  onSave,
  onSaveInternalTransfer,
}: TransactionEditPanelProps) {
  const allocated = sumSplitRowAmounts(splitRows)
  const remaining = transaction.amount - allocated
  const isBalanced = splitRowsAreBalanced(transaction.amount, splitRows)
  const hasRequiredSinks = assignmentsHaveSinks(splitRows.map((row) => row.assignment))
  const isSplit = splitRows.length > 1
  const singleRow = splitRows[0]

  function updateRow(rowId: string, patch: Partial<TransactionSplitRow>) {
    onSplitRowsChange(splitRows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
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
      className={cn(
        embedded &&
          'border-t border-[var(--border)] bg-[rgba(27,24,23,0.45)] py-4 pl-4 pr-10',
      )}
      onClick={embedded ? (event) => event.stopPropagation() : undefined}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-2">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <input
            type="checkbox"
            checked={isInternalTransfer}
            disabled={disabled || isSaving || Boolean(onUnlinkInternalTransfer)}
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
        <>
          <InternalTransferPanel
            transaction={transaction}
            candidates={transferCandidates}
            accountNames={accountNames}
            selectedCounterpartyId={selectedCounterpartyId}
            disabled={disabled}
            isSaving={isSaving}
            emptyMessage={transferEmptyMessage}
            saveTransferLabel={saveTransferLabel}
            onSelectCounterparty={onSelectCounterparty}
            onSave={onSaveInternalTransfer}
          />
          {onUnlinkInternalTransfer ? (
            <div className="mt-4 flex justify-end pr-2">
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isSaving}
                onClick={onUnlinkInternalTransfer}
              >
                Unlink transfer
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pr-2">
            {isSplit ? (
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Split across categories</p>
                <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                  Total {formatMoney(transaction.amount)}
                  {' · '}
                  Allocated {formatMoney(allocated)}
                  {' · '}
                  Remaining{' '}
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
                  sinks={sinks}
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
                sinks={sinks}
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
            {!hasRequiredSinks ? (
              <p className="m-0 text-sm text-[#e88a8a]">
                {isSplit
                  ? 'Each split must be connected to a sink.'
                  : 'Select a sink before saving to the ledger.'}
              </p>
            ) : null}
            <Button
              type="button"
              disabled={disabled || isSaving || (isSplit && !isBalanced) || !hasRequiredSinks}
              onClick={onSave}
            >
              {isSaving ? 'Saving…' : isSplit ? saveSplitLabel : saveLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
