import { useEffect, useState } from 'react'
import type { RuleType } from 'budget-core'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { fieldHintClassName, inputClassName } from '@/components/taxonomy/form-styles'

export type RuleFormValues = {
  subtext: string
  ruleType: RuleType
  categoryId: string | null
  sinkId: string | null
  lifestyleTagIds: string[]
  eventTagIds: string[]
}

type CategoryOption = { id: string; name: string; color: string }
type SinkOption = { id: string; name: string }
type TagOption = { id: string; name: string; color: string; kind: 'permanent' | 'temporary' }

type RuleEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: {
    id: string
    keywords: string[]
    ruleType?: RuleType
    categoryId: string | null
    sinkId: string | null
    lifestyleTagIds: string[]
    eventTagIds: string[]
  }
  categories: CategoryOption[]
  sinks: SinkOption[]
  tags: TagOption[]
  onSave: (values: RuleFormValues) => Promise<void>
  isSaving: boolean
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-full border border-[var(--border)]"
      style={{ backgroundColor: color }}
    />
  )
}

export function RuleEditModal({
  open,
  onOpenChange,
  rule,
  categories,
  sinks,
  tags,
  onSave,
  isSaving,
}: RuleEditModalProps) {
  const isCreate = rule === undefined
  const [subtext, setSubtext] = useState(rule?.keywords[0] ?? '')
  const [ruleType, setRuleType] = useState<RuleType>(rule?.ruleType ?? 'categorize')
  const [categoryId, setCategoryId] = useState<string | null>(rule?.categoryId ?? null)
  const [sinkId, setSinkId] = useState<string | null>(rule?.sinkId ?? null)
  const [selectedLifestyleTagIds, setSelectedLifestyleTagIds] = useState<string[]>(
    rule?.lifestyleTagIds ?? [],
  )
  const [selectedEventTagIds, setSelectedEventTagIds] = useState<string[]>(
    rule?.eventTagIds ?? [],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    setSubtext(rule?.keywords[0] ?? '')
    setRuleType(rule?.ruleType ?? 'categorize')
    setCategoryId(rule?.categoryId ?? null)
    setSinkId(rule?.sinkId ?? null)
    setSelectedLifestyleTagIds(rule?.lifestyleTagIds ?? [])
    setSelectedEventTagIds(rule?.eventTagIds ?? [])
  }, [open, rule])

  const isInternalTransfer = ruleType === 'internal_transfer'
  const permanentTags = tags.filter((tag) => tag.kind === 'permanent')
  const temporaryTags = tags.filter((tag) => tag.kind === 'temporary')

  function toggleLifestyleTag(tagId: string) {
    setSelectedLifestyleTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    )
  }

  function toggleEventTag(tagId: string) {
    setSelectedEventTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedSubtext = subtext.trim()
    if (!trimmedSubtext) {
      return
    }

    await onSave({
      subtext: trimmedSubtext,
      ruleType,
      categoryId: isInternalTransfer ? null : categoryId,
      sinkId: isInternalTransfer ? null : sinkId,
      lifestyleTagIds: isInternalTransfer ? [] : selectedLifestyleTagIds,
      eventTagIds: isInternalTransfer ? [] : selectedEventTagIds,
    })
    onOpenChange(false)
  }

  const hasActions =
    isInternalTransfer ||
    categoryId !== null ||
    sinkId !== null ||
    selectedLifestyleTagIds.length > 0 ||
    selectedEventTagIds.length > 0

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'Add import rule' : 'Edit import rule'}
      description={
        isInternalTransfer
          ? 'When imported transaction text contains this subtext, the transaction is pre-marked as an internal transfer.'
          : 'When imported transaction text contains this subtext, the selected category and tags are applied automatically.'
      }
      className="w-[min(36rem,calc(100vw-2rem))]"
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Rule type
          <select
            className={inputClassName}
            value={ruleType}
            onChange={(event) => setRuleType(event.target.value as RuleType)}
            disabled={isSaving}
          >
            <option value="categorize">Categorize &amp; tag</option>
            <option value="internal_transfer">Internal transfer</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Matching subtext
          <input
            className={inputClassName}
            value={subtext}
            onChange={(event) => setSubtext(event.target.value)}
            placeholder="ICA, Netflix, Swish…"
            disabled={isSaving}
            autoFocus
          />
          <p className={fieldHintClassName}>
            Case-insensitive substring match against imported transaction descriptions.
          </p>
        </label>

        {isInternalTransfer ? (
          <p className={`${fieldHintClassName} rounded-xl border border-dashed border-[var(--border)] p-3`}>
            Matching transactions will have &ldquo;Internal transfer&rdquo; preselected when you
            categorize them after import. You still pick the counterparty transaction manually.
          </p>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Category
              <select
                className={inputClassName}
                value={categoryId ?? ''}
                onChange={(event) => setCategoryId(event.target.value || null)}
                disabled={isSaving}
              >
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Sink
              <select
                className={inputClassName}
                value={sinkId ?? ''}
                onChange={(event) => setSinkId(event.target.value || null)}
                disabled={isSaving}
              >
                <option value="">None</option>
                {sinks.map((sink) => (
                  <option key={sink.id} value={sink.id}>
                    {sink.name}
                  </option>
                ))}
              </select>
              <p className={fieldHintClassName}>
                Optionally route matching expenses to a virtual sink on import.
              </p>
            </label>

            {tags.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="m-0 text-sm font-semibold text-[var(--text)]">Tags</p>

                {permanentTags.length > 0 ? (
                  <fieldset className="m-0 flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3">
                    <legend className="px-1 text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                      Permanent
                    </legend>
                    {permanentTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLifestyleTagIds.includes(tag.id)}
                          onChange={() => toggleLifestyleTag(tag.id)}
                          disabled={isSaving}
                        />
                        <ColorSwatch color={tag.color} />
                        {tag.name}
                      </label>
                    ))}
                  </fieldset>
                ) : null}

                {temporaryTags.length > 0 ? (
                  <fieldset className="m-0 flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3">
                    <legend className="px-1 text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                      Temporary
                    </legend>
                    {temporaryTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEventTagIds.includes(tag.id)}
                          onChange={() => toggleEventTag(tag.id)}
                          disabled={isSaving}
                        />
                        <ColorSwatch color={tag.color} />
                        {tag.name}
                      </label>
                    ))}
                  </fieldset>
                ) : null}
              </div>
            ) : (
              <p className={`${fieldHintClassName} rounded-xl border border-dashed border-[var(--border)] p-3`}>
                No tags yet. Create tags under Categories & Tags to assign them here.
              </p>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !subtext.trim() || !hasActions}>
            {isSaving ? 'Saving…' : isCreate ? 'Add rule' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
