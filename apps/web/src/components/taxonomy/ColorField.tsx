import { TAXONOMY_COLOR_PRESETS } from '@/lib/taxonomy'
import { disabledOverlayClassName } from '@/components/taxonomy/form-styles'
import { cn } from '@/lib/utils'

export function ColorField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}) {
  return (
    <div className={cn('flex items-center gap-2', disabled && disabledOverlayClassName)}>
      <input
        type="color"
        className="size-8 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-transparent p-0.5 disabled:cursor-not-allowed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label="Color"
      />
      <div className="flex flex-wrap gap-1">
        {TAXONOMY_COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="size-5 rounded-full border border-[var(--border)] transition hover:scale-110 disabled:cursor-not-allowed"
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
            disabled={disabled}
            aria-label={`Use color ${preset}`}
          />
        ))}
      </div>
      {disabled ? (
        <span className="text-xs text-[var(--text-muted)]">Locked while saving</span>
      ) : null}
    </div>
  )
}
