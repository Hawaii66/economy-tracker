import { AccountIcon as AccountIconGlyph } from '@/components/accounts/AccountIcon'
import { disabledOverlayClassName } from '@/components/taxonomy/form-styles'
import { ACCOUNT_ICON_OPTIONS, type AccountIcon } from '@/lib/accounts'
import { cn } from '@/lib/utils'

export function IconField({
  value,
  onChange,
  disabled,
}: {
  value: AccountIcon
  onChange: (icon: AccountIcon) => void
  disabled?: boolean
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', disabled && disabledOverlayClassName)}>
      {ACCOUNT_ICON_OPTIONS.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition',
              isSelected
                ? 'border-[rgba(94,174,255,0.45)] bg-[rgba(94,174,255,0.12)] text-[var(--text)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[rgba(94,174,255,0.28)] hover:text-[var(--text)]',
            )}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            aria-label={option.label}
          >
            <AccountIconGlyph icon={option.value} className="size-4" />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
