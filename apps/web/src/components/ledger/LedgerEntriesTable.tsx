import { ArrowLeftRight, Link2, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { SinkIcon } from '@/components/sinks/SinkIcon'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { CategoryOption, SinkOption, TagOption } from '@/components/transactions/types'
import type {
  BudgetInternalTransferGroup,
  BudgetLedgerTransaction,
  BudgetSplitGroup,
  BudgetVirtualSlice,
} from '@/lib/budget-types'
import { getTransferCounterpartyId, shortEntityId } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { ledgerRowId } from '@/lib/ledger-navigation'
import { cn } from '@/lib/utils'

type LedgerEntriesTableProps = {
  transactions: BudgetLedgerTransaction[]
  accountNames: Record<string, string>
  categoriesById: Record<string, CategoryOption>
  sinksById: Record<string, SinkOption>
  tagsById: Record<string, TagOption>
  ledgerById: Map<string, BudgetLedgerTransaction>
  internalTransferGroups: BudgetInternalTransferGroup[]
  splitGroups: BudgetSplitGroup[]
  highlightedId: string | null
  deletingLedgerId: string | null
  onNavigateToRaw: (rawId: string) => void
  onNavigateToLedger: (ledgerId: string) => void
  onDelete?: (ledger: BudgetLedgerTransaction) => Promise<void>
  disabled?: boolean
  readOnly?: boolean
}

const EMPTY = '\u2014'

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full border border-[var(--border)]"
      style={{ backgroundColor: color }}
    />
  )
}

function CategoryCell({
  categoryId,
  categoriesById,
}: {
  categoryId: string | null
  categoriesById: Record<string, CategoryOption>
}) {
  if (!categoryId) {
    return <td className="text-[var(--text-muted)]">{EMPTY}</td>
  }

  const category = categoriesById[categoryId]
  if (!category) {
    return <td className="text-[var(--text-muted)]">{shortEntityId(categoryId)}</td>
  }

  return (
    <td>
      <span className="inline-flex items-center gap-1.5 text-sm">
        <ColorDot color={category.color} />
        {category.name}
      </span>
    </td>
  )
}

function SinkCell({
  sinkId,
  sinksById,
}: {
  sinkId: string | null
  sinksById: Record<string, SinkOption>
}) {
  if (!sinkId) {
    return <td className="text-[var(--text-muted)]">{EMPTY}</td>
  }

  const sink = sinksById[sinkId]
  if (!sink) {
    return <td className="text-[var(--text-muted)]">{shortEntityId(sinkId)}</td>
  }

  return (
    <td>
      <span className="inline-flex items-center gap-1.5 text-sm">
        <span
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${sink.color}22`, color: sink.color }}
        >
          <SinkIcon icon={sink.icon} className="size-3.5" />
        </span>
        {sink.name}
      </span>
    </td>
  )
}

function TagsCell({
  lifestyleTagIds,
  eventTagIds,
  tagsById,
}: {
  lifestyleTagIds: string[]
  eventTagIds: string[]
  tagsById: Record<string, TagOption>
}) {
  const tagIds = [...lifestyleTagIds, ...eventTagIds]
  if (tagIds.length === 0) {
    return <td className="text-[var(--text-muted)]">{EMPTY}</td>
  }

  return (
    <td>
      <div className="flex flex-wrap gap-1">
        {tagIds.map((tagId) => {
          const tag = tagsById[tagId]
          if (!tag) {
            return (
              <span key={tagId} className="demo-pill">
                {shortEntityId(tagId)}
              </span>
            )
          }

          return (
            <span key={tagId} className="demo-pill">
              <ColorDot color={tag.color} />
              {tag.name}
            </span>
          )
        })}
      </div>
    </td>
  )
}

function RawSourceLink({
  ledger,
  onNavigateToRaw,
}: {
  ledger: BudgetLedgerTransaction
  onNavigateToRaw: (rawId: string) => void
}) {
  if (!ledger.rawTransactionId) {
    return <span className="demo-pill">Manual entry</span>
  }

  return (
    <button
      type="button"
      className="demo-pill demo-pill-button"
      onClick={() => onNavigateToRaw(ledger.rawTransactionId as string)}
    >
      <Link2 className="size-3" />
      Raw
    </button>
  )
}

function InternalTransferLink({
  ledger,
  accountNames,
  ledgerById,
  internalTransferGroups,
  onNavigateToLedger,
}: {
  ledger: BudgetLedgerTransaction
  accountNames: Record<string, string>
  ledgerById: Map<string, BudgetLedgerTransaction>
  internalTransferGroups: BudgetInternalTransferGroup[]
  onNavigateToLedger: (ledgerId: string) => void
}) {
  if (!ledger.internalTransferGroupId) {
    return null
  }

  const group = internalTransferGroups.find(
    (candidate) => candidate.id === ledger.internalTransferGroupId,
  )
  if (!group) {
    return (
      <span className="demo-pill">
        <ArrowLeftRight className="size-3" />
        Internal transfer
      </span>
    )
  }

  const counterpartyId = group.ledgerTransactionIds.find((id) => id !== ledger.id)
  const counterparty = counterpartyId ? ledgerById.get(counterpartyId) : undefined

  if (!counterparty || !counterpartyId) {
    return (
      <span className="demo-pill">
        <ArrowLeftRight className="size-3" />
        Internal transfer
      </span>
    )
  }

  return (
    <button
      type="button"
      className="demo-pill demo-pill-button"
      onClick={() => onNavigateToLedger(counterpartyId)}
    >
      <ArrowLeftRight className="size-3" />
      {accountNames[counterparty.accountId] ?? counterparty.accountId} /{' '}
      {formatMoney(counterparty.amount)}
    </button>
  )
}

function SplitGroupLink({
  ledger,
  splitGroups,
  ledgerById,
}: {
  ledger: BudgetLedgerTransaction
  splitGroups: BudgetSplitGroup[]
  ledgerById: Map<string, BudgetLedgerTransaction>
}) {
  if (!ledger.splitGroupId) {
    return null
  }

  const group = splitGroups.find((candidate) => candidate.id === ledger.splitGroupId)
  if (!group) {
    return <span className="demo-pill">Split group</span>
  }

  const isParent = group.parentLedgerTransactionId === ledger.id
  const linkedCount = group.linkedLedgerTransactionIds.length

  if (isParent) {
    return (
      <span className="demo-pill">
        Split parent / {linkedCount} linked reimbursement{linkedCount === 1 ? '' : 's'}
      </span>
    )
  }

  const parent = ledgerById.get(group.parentLedgerTransactionId)
  return (
    <span className="demo-pill">
      Split reimbursement of {parent?.description || shortEntityId(group.parentLedgerTransactionId)}
    </span>
  )
}

function SliceRow({
  slice,
  categoriesById,
  sinksById,
  tagsById,
  readOnly,
}: {
  slice: BudgetVirtualSlice
  categoriesById: Record<string, CategoryOption>
  sinksById: Record<string, SinkOption>
  tagsById: Record<string, TagOption>
  readOnly: boolean
}) {
  return (
    <tr className="border-l-2 border-l-[rgba(94,174,255,0.2)]">
      <td className="pl-6 whitespace-nowrap text-[var(--text-muted)]">{EMPTY}</td>
      <td />
      <td className="pl-6 text-sm text-[var(--text-muted)]">{slice.description || EMPTY}</td>
      <td
        className={cn(
          'px-3 py-2.5 text-right align-middle font-semibold tabular-nums whitespace-nowrap',
          slice.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
        )}
      >
        {formatMoney(slice.amount)}
      </td>
      <CategoryCell categoryId={slice.categoryId} categoriesById={categoriesById} />
      <SinkCell sinkId={slice.sinkId} sinksById={sinksById} />
      <TagsCell
        lifestyleTagIds={slice.lifestyleTagIds}
        eventTagIds={slice.eventTagIds}
        tagsById={tagsById}
      />
      <td />
      {!readOnly ? <td className="text-[var(--text-muted)]">Slice</td> : null}
    </tr>
  )
}

export default function LedgerEntriesTable({
  transactions,
  accountNames,
  categoriesById,
  sinksById,
  tagsById,
  ledgerById,
  internalTransferGroups,
  splitGroups,
  highlightedId,
  deletingLedgerId,
  onNavigateToRaw,
  onNavigateToLedger,
  onDelete,
  disabled = false,
  readOnly = false,
}: LedgerEntriesTableProps) {
  const [ledgerToDelete, setLedgerToDelete] = useState<BudgetLedgerTransaction | null>(null)

  async function confirmDelete() {
    if (!ledgerToDelete) {
      return
    }

    try {
      await onDelete?.(ledgerToDelete)
      setLedgerToDelete(null)
    } catch {
      // Error message is handled by the page.
    }
  }

  const transferCounterparty =
    ledgerToDelete && ledgerToDelete.internalTransferGroupId
      ? (() => {
          const counterpartyId = getTransferCounterpartyId(
            ledgerToDelete,
            internalTransferGroups,
          )
          return counterpartyId ? ledgerById.get(counterpartyId) : undefined
        })()
      : undefined

  if (transactions.length === 0) {
    return (
      <p className="m-0 text-sm text-[var(--text-muted)]">
        No ledger entries yet. Categorize imports on the Import page.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Sink</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2">Links</th>
              {!readOnly ? <th className="px-3 py-2 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {transactions.map((ledger) => {
              const hasVirtualSlices = ledger.virtualSlices.length > 0
              const isHighlighted = highlightedId === ledger.id
              const isDeleting = deletingLedgerId === ledger.id

              return (
                <Fragment key={ledger.id}>
                  <tr
                    id={ledgerRowId('ledger', ledger.id)}
                    className={cn(
                      'border-b border-[var(--border)]',
                      isHighlighted && 'ledger-row-highlight',
                    )}
                  >
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[var(--text-muted)]">
                      {ledger.date}
                    </td>
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                      {accountNames[ledger.accountId] ?? ledger.accountId}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div>{ledger.description || EMPTY}</div>
                      {hasVirtualSlices ? (
                        <p className="m-0 mt-1 text-xs text-[var(--text-muted)]">
                          {ledger.virtualSlices.length} virtual slice
                          {ledger.virtualSlices.length === 1 ? '' : 's'}
                        </p>
                      ) : null}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2.5 text-right align-middle font-semibold tabular-nums whitespace-nowrap',
                        ledger.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
                      )}
                    >
                      {formatMoney(ledger.amount)}
                    </td>
                    {hasVirtualSlices ? (
                      <>
                        <td className="text-[var(--text-muted)]">{EMPTY}</td>
                        <td className="text-[var(--text-muted)]">{EMPTY}</td>
                        <td className="text-[var(--text-muted)]">{EMPTY}</td>
                      </>
                    ) : (
                      <>
                        <CategoryCell categoryId={ledger.categoryId} categoriesById={categoriesById} />
                        <SinkCell sinkId={ledger.sinkId} sinksById={sinksById} />
                        <TagsCell
                          lifestyleTagIds={ledger.lifestyleTagIds}
                          eventTagIds={ledger.eventTagIds}
                          tagsById={tagsById}
                        />
                      </>
                    )}
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-wrap gap-1">
                        <RawSourceLink ledger={ledger} onNavigateToRaw={onNavigateToRaw} />
                        <InternalTransferLink
                          ledger={ledger}
                          accountNames={accountNames}
                          ledgerById={ledgerById}
                          internalTransferGroups={internalTransferGroups}
                          onNavigateToLedger={onNavigateToLedger}
                        />
                        <SplitGroupLink
                          ledger={ledger}
                          splitGroups={splitGroups}
                          ledgerById={ledgerById}
                        />
                      </div>
                    </td>
                    {!readOnly ? (
                      <td className="px-3 py-2.5 align-middle text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={disabled || isDeleting}
                          onClick={() => setLedgerToDelete(ledger)}
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                  {ledger.virtualSlices.map((slice) => (
                    <SliceRow
                      key={slice.id}
                      slice={slice}
                      categoriesById={categoriesById}
                      sinksById={sinksById}
                      tagsById={tagsById}
                      readOnly={readOnly}
                    />
                  ))}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {!readOnly ? (
        <Modal
        open={ledgerToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLedgerToDelete(null)
          }
        }}
        title="Remove ledger entry?"
        description={
          ledgerToDelete
            ? `${ledgerToDelete.date} · ${accountNames[ledgerToDelete.accountId] ?? ledgerToDelete.accountId} · ${formatMoney(ledgerToDelete.amount)}`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 text-sm text-[var(--text-muted)]">
            {ledgerToDelete?.rawTransactionId
              ? 'The bank import will return to the Import tab so you can categorize it again. Account balance will be adjusted.'
              : 'This manual ledger entry will be removed and the account balance will be adjusted.'}
          </p>
          {transferCounterparty ? (
            <p className="m-0 text-sm text-[var(--text-muted)]">
              The paired internal transfer with{' '}
              {accountNames[transferCounterparty.accountId] ?? transferCounterparty.accountId} will
              also be removed. Both bank imports will return to the Import tab.
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deletingLedgerId !== null}
              onClick={() => setLedgerToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={disabled || deletingLedgerId !== null}
              onClick={() => void confirmDelete()}
            >
              {deletingLedgerId ? 'Removing…' : 'Remove ledger entry'}
            </Button>
          </div>
        </div>
        </Modal>
      ) : null}
    </>
  )
}
