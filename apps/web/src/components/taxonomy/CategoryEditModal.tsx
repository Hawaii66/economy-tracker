import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ColorField } from '@/components/taxonomy/ColorField'
import { inputClassName } from '@/components/taxonomy/form-styles'
import { DEFAULT_ENTITY_COLOR } from '@/lib/taxonomy'

export type CategoryFormValues = {
  name: string
  color: string
}

type CategoryEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: { id: string; name: string; color: string }
  onSave: (values: CategoryFormValues) => Promise<void>
  isSaving: boolean
}

export function CategoryEditModal({
  open,
  onOpenChange,
  category,
  onSave,
  isSaving,
}: CategoryEditModalProps) {
  const isCreate = category === undefined
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState(category?.color ?? DEFAULT_ENTITY_COLOR)

  useEffect(() => {
    if (!open) {
      return
    }

    setName(category?.name ?? '')
    setColor(category?.color ?? DEFAULT_ENTITY_COLOR)
  }, [open, category])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    await onSave({ name: trimmedName, color })
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'Add category' : 'Edit category'}
      description={
        isCreate
          ? 'Create a category with a name and color.'
          : 'Update this category’s name and color.'
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Name
          <input
            className={inputClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Groceries, rent, transport…"
            disabled={isSaving}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Color
          <ColorField value={color} onChange={setColor} disabled={isSaving} />
        </label>

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
            {isSaving ? 'Saving…' : isCreate ? 'Add category' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
