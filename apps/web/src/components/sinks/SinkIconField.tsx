import { SinkIcon as SinkIconGlyph } from '@/components/sinks/SinkIcon'
import { disabledOverlayClassName } from '@/components/taxonomy/form-styles'
import { SINK_ICON_OPTIONS, type SinkIcon as SinkIconName } from '@/lib/sink-icons'
import { cn } from '@/lib/utils'

export function SinkIconField({
  value,
  onChange,
  disabled,
}: {
  value: SinkIconName
  onChange: (icon: SinkIconName) => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-6 gap-2 sm:grid-cols-9',
        disabled && disabledOverlayClassName,
      )}
    >
      {SINK_ICON_OPTIONS.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-lg border transition',
              isSelected
                ? 'border-[rgba(94,174,255,0.45)] bg-[rgba(94,174,255,0.12)] text-[var(--text)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[rgba(94,174,255,0.28)] hover:text-[var(--text)]',
            )}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={option.label}
            title={option.label}
          >
            <SinkIconGlyph icon={option.value} className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
