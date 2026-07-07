import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
    }

    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 m-0 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop:bg-black/60',
        className,
      )}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onOpenChange(false)
        }
      }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div>
          <h2 className="m-0 text-lg font-semibold text-[var(--text)]">{title}</h2>
          {description ? (
            <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X />
        </Button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  )
}
