import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { formatMoney } from '@/lib/format-money'
import type { ImportReviewRow, TransactionAssignment } from '@/lib/import-review'
import { inputClassName } from '@/components/taxonomy/form-styles'
import { cn } from '@/lib/utils'

type CategoryOption = { id: string; name: string; color: string }
type TagOption = { id: string; name: string; color: string; kind: 'permanent' | 'temporary' }

type ImportReviewTableProps = {
  rows: ImportReviewRow[]
  categories: CategoryOption[]
  tags: TagOption[]
  rulesById: Record<string, { name: string; keywords: string[] }>
  accountName: string
  onRowsChange: (rows: ImportReviewRow[]) => void
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
          <p className="mb-2 text-right text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
            Permanent
          </p>
          <div className="flex flex-wrap justify-end gap-2">
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
          <p className="mb-2 text-right text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
            Temporary
          </p>
          <div className="flex flex-wrap justify-end gap-2">
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

function ApproveButton({
  approved,
  canApprove,
  disabled,
  onClick,
  label,
}: {
  approved: boolean
  canApprove: boolean
  disabled?: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !canApprove}
      aria-label={label}
      title={canApprove ? label : 'Select a category first'}
      className={cn(
        'flex size-8 items-center justify-center rounded-full border transition-colors',
        approved
          ? 'border-green-500/60 bg-green-500/15 text-green-400'
          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text)]',
        (!canApprove || disabled) && 'cursor-not-allowed opacity-40 hover:border-[var(--border)] hover:text-[var(--text-muted)]',
      )}
    >
      <Check className="size-4" strokeWidth={approved ? 2.5 : 2} />
    </button>
  )
}

function RowAssignmentPanel({
  row,
  categories,
  tags,
  matchedRuleLabel,
  disabled,
  onAssignmentChange,
}: {
  row: ImportReviewRow
  categories: CategoryOption[]
  tags: TagOption[]
  matchedRuleLabel: string | null
  disabled?: boolean
  onAssignmentChange: (assignment: TransactionAssignment) => void
}) {
  function toggleLifestyleTag(tagId: string) {
    const lifestyleTagIds = row.assignment.lifestyleTagIds.includes(tagId)
      ? row.assignment.lifestyleTagIds.filter((id: string) => id !== tagId)
      : [...row.assignment.lifestyleTagIds, tagId]
    onAssignmentChange({ ...row.assignment, lifestyleTagIds })
  }

  function toggleEventTag(tagId: string) {
    const eventTagIds = row.assignment.eventTagIds.includes(tagId)
      ? row.assignment.eventTagIds.filter((id: string) => id !== tagId)
      : [...row.assignment.eventTagIds, tagId]
    onAssignmentChange({ ...row.assignment, eventTagIds })
  }

  return (
    <div
      className="flex justify-end border-t border-[var(--border)] bg-[rgba(27,24,23,0.45)] py-4 pl-4 pr-10"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="ml-auto grid w-full max-w-2xl gap-x-2 gap-y-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3 sm:col-start-1">
          {matchedRuleLabel ? (
            <p className="m-0 text-right text-xs text-[var(--text-muted)]">
              Auto-applied from rule:{' '}
              <span className="text-[var(--text)]">{matchedRuleLabel}</span>
            </p>
          ) : null}

          <label className="flex flex-col gap-1 text-right text-sm font-semibold text-[var(--text)]">
            Category
            <select
              className={inputClassName}
              value={row.assignment.categoryId ?? ''}
              onChange={(event) =>
                onAssignmentChange({
                  ...row.assignment,
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
        </div>

        <div className="flex flex-col gap-2 pr-2 sm:col-start-2">
          <p className="m-0 text-right text-sm font-semibold text-[var(--text)]">Tags</p>
          <TagBadgeGrid
            tags={tags}
            lifestyleTagIds={row.assignment.lifestyleTagIds}
            eventTagIds={row.assignment.eventTagIds}
            disabled={disabled}
            onToggleLifestyleTag={toggleLifestyleTag}
            onToggleEventTag={toggleEventTag}
          />
        </div>
      </div>
    </div>
  )
}

export default function ImportReviewTable({
  rows,
  categories,
  tags,
  rulesById,
  accountName,
  onRowsChange,
  disabled = false,
}: ImportReviewTableProps) {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const tagsById = new Map(tags.map((tag) => [tag.id, tag]))
  const approvedCount = rows.filter((row) => row.approved).length
  const columnCount = 8

  function updateRow(rowId: string, patch: Partial<ImportReviewRow>) {
    onRowsChange(rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)))
  }

  function toggleApproved(row: ImportReviewRow) {
    if (!row.assignment.categoryId) {
      return
    }
    updateRow(row.id, { approved: !row.approved })
  }

  function setAllApproved(approved: boolean) {
    if (approved) {
      onRowsChange(
        rows.map((row) => ({
          ...row,
          approved: row.assignment.categoryId !== null,
        })),
      )
      return
    }
    onRowsChange(rows.map((row) => ({ ...row, approved: false })))
  }

  function handleAssignmentChange(row: ImportReviewRow, assignment: TransactionAssignment) {
    const patch: Partial<ImportReviewRow> = { assignment }
    if (!assignment.categoryId && row.approved) {
      patch.approved = false
    }
    updateRow(row.id, patch)
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
            Clear all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[58rem] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-8" />
            <col className="w-[5.75rem]" />
            <col className="w-[7.5rem]" />
            <col />
            <col className="w-[7.5rem]" />
            <col className="w-[8.5rem]" />
            <col className="w-[9.5rem]" />
            <col className="w-12" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              <th className="px-2 py-2" aria-hidden="true" />
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-2 py-2" aria-label="Approve" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const matchedRule = row.matchedRuleId ? rulesById[row.matchedRuleId] : undefined
              const matchedRuleLabel = matchedRule
                ? matchedRule.keywords.join(', ') || matchedRule.name
                : null

              const category = row.assignment.categoryId
                ? categoriesById.get(row.assignment.categoryId)
                : undefined
              const selectedTags = [...row.assignment.lifestyleTagIds, ...row.assignment.eventTagIds]
                .map((tagId) => tagsById.get(tagId))
                .filter((tag): tag is TagOption => tag !== undefined)
              const canApprove = row.assignment.categoryId !== null

              return (
                <Fragment key={row.id}>
                  <tr
                    className={cn(
                      'cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[rgba(27,24,23,0.35)]',
                      row.approved && 'bg-[rgba(34,197,94,0.06)]',
                      row.expanded && 'border-b-0',
                    )}
                    onClick={() => updateRow(row.id, { expanded: !row.expanded })}
                    aria-expanded={row.expanded}
                  >
                    <td className="px-2 py-2.5 align-middle">
                      {row.expanded ? (
                        <ChevronDown className="size-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronRight className="size-4 text-[var(--text-muted)]" />
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[var(--text-muted)]">
                      {row.date}
                    </td>
                    <td className="truncate px-3 py-2.5 align-middle text-[var(--text-muted)]">
                      {accountName}
                    </td>
                    <td className="truncate px-3 py-2.5 align-middle text-[var(--text)]">
                      {row.description || '—'}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2.5 text-right align-middle font-semibold tabular-nums whitespace-nowrap',
                        row.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
                      )}
                    >
                      {formatMoney(row.amount)}
                    </td>
                    <td className="truncate px-3 py-2.5 align-middle">
                      {category ? (
                        <span className="inline-flex max-w-full items-center gap-1.5 truncate text-[var(--text)]">
                          <ColorSwatch color={category.color} />
                          <span className="truncate">{category.name}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      {selectedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-[var(--border)] bg-[rgba(27,24,23,0.6)] px-2 py-0.5 text-xs text-[var(--text)]"
                            >
                              <ColorSwatch color={tag.color} />
                              <span className="truncate">{tag.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td
                      className="px-2 py-2.5 align-middle"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ApproveButton
                        approved={row.approved}
                        canApprove={canApprove}
                        disabled={disabled}
                        onClick={() => toggleApproved(row)}
                        label={
                          row.approved
                            ? `Unapprove ${row.description || 'transaction'}`
                            : `Approve ${row.description || 'transaction'}`
                        }
                      />
                    </td>
                  </tr>
                  {row.expanded ? (
                    <tr className="border-b border-[var(--border)]">
                      <td colSpan={columnCount} className="p-0">
                        <RowAssignmentPanel
                          row={row}
                          categories={categories}
                          tags={tags}
                          matchedRuleLabel={matchedRuleLabel}
                          disabled={disabled}
                          onAssignmentChange={(assignment) =>
                            handleAssignmentChange(row, assignment)
                          }
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
    </div>
  )
}
