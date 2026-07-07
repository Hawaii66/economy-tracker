import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ColorField } from '@/components/taxonomy/ColorField'
import {
  fieldHintClassName,
  inputClassName,
  readOnlyFieldClassName,
} from '@/components/taxonomy/form-styles'
import { DEFAULT_ENTITY_COLOR } from '@/lib/taxonomy'

export type TagKind = 'permanent' | 'temporary'

export type TagFormValues = {
  name: string
  color: string
  kind: TagKind
  archived: boolean
}

type TagEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: {
    id: string
    name: string
    color: string
    kind: TagKind
    archived: boolean
  }
  onSave: (values: TagFormValues) => Promise<void>
  isSaving: boolean
}

export function TagEditModal({
  open,
  onOpenChange,
  tag,
  onSave,
  isSaving,
}: TagEditModalProps) {
  const isCreate = tag === undefined
  const [name, setName] = useState(tag?.name ?? '')
  const [color, setColor] = useState(tag?.color ?? DEFAULT_ENTITY_COLOR)
  const [kind, setKind] = useState<TagKind>(tag?.kind ?? 'permanent')
  const [archived, setArchived] = useState(tag?.archived ?? false)

  useEffect(() => {
    if (!open) {
      return
    }

    setName(tag?.name ?? '')
    setColor(tag?.color ?? DEFAULT_ENTITY_COLOR)
    setKind(tag?.kind ?? 'permanent')
    setArchived(tag?.archived ?? false)
  }, [open, tag])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    await onSave({ name: trimmedName, color, kind, archived })
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'Add tag' : 'Edit tag'}
      description={
        isCreate
          ? 'Create a permanent or temporary tag with a name and color.'
          : 'Update this tag’s details.'
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Name
          <input
            className={inputClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Vacation 2026, business meals…"
            disabled={isSaving}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Color
          <ColorField value={color} onChange={setColor} disabled={isSaving} />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-[var(--text)]">Type</span>
          {isCreate ? (
            <select
              className={inputClassName}
              value={kind}
              onChange={(event) => setKind(event.target.value as TagKind)}
              disabled={isSaving}
            >
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
            </select>
          ) : (
            <>
              <div className={readOnlyFieldClassName}>
                {kind === 'permanent' ? 'Permanent' : 'Temporary'}
              </div>
              <p className={fieldHintClassName}>
                Tag type is fixed after creation. Create a new tag if you need a different type.
              </p>
            </>
          )}
        </div>

        {kind === 'temporary' ? (
          <label className="flex flex-col gap-1.5 text-sm text-[var(--text)]">
            <span className="font-semibold">Archive status</span>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 has-disabled:cursor-not-allowed has-disabled:border-dashed has-disabled:border-[rgba(140,132,126,0.45)] has-disabled:bg-[rgba(27,24,23,0.45)] has-disabled:opacity-70">
              <input
                type="checkbox"
                className="disabled:cursor-not-allowed"
                checked={archived}
                onChange={(event) => setArchived(event.target.checked)}
                disabled={isSaving}
              />
              <span className={archived ? 'text-[var(--text-muted)]' : 'text-[var(--text)]'}>
                {archived ? 'Archived — hidden from active lists' : 'Active — visible in lists'}
              </span>
            </label>
          </label>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving…' : isCreate ? 'Add tag' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
