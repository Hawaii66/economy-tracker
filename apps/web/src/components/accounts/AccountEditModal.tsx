import { useEffect, useState } from 'react'
import { AccountIcon as AccountIconGlyph } from '@/components/accounts/AccountIcon'
import { IconField } from '@/components/accounts/IconField'
import { ColorField } from '@/components/taxonomy/ColorField'
import { fieldHintClassName, inputClassName } from '@/components/taxonomy/form-styles'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import {
  minorUnitsToDecimalString,
  parseDecimalStringToMinorUnits,
} from '@/lib/format-money'
import { DEFAULT_ACCOUNT_ICON, todayIsoDate, type AccountIcon } from '@/lib/accounts'
import { DEFAULT_ENTITY_COLOR } from '@/lib/taxonomy'

export type AccountFormValues = {
  name: string
  description: string
  color: string
  icon: AccountIcon
  openingBalance: number
  genesisDate: string
}

export type BudgetAccountRecord = {
  id: string
  name: string
  description: string
  color: string
  icon: AccountIcon
  balance: number
  currency: string
  genesisDate: string
}

type AccountEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: BudgetAccountRecord
  onSave: (values: AccountFormValues) => Promise<void>
  isSaving: boolean
}

export function AccountEditModal({
  open,
  onOpenChange,
  account,
  onSave,
  isSaving,
}: AccountEditModalProps) {
  const isCreate = account === undefined
  const [name, setName] = useState(account?.name ?? '')
  const [description, setDescription] = useState(account?.description ?? '')
  const [color, setColor] = useState(account?.color ?? DEFAULT_ENTITY_COLOR)
  const [icon, setIcon] = useState<AccountIcon>(account?.icon ?? DEFAULT_ACCOUNT_ICON)
  const [balanceInput, setBalanceInput] = useState(
    account ? minorUnitsToDecimalString(account.balance) : '0,00',
  )
  const [genesisDate, setGenesisDate] = useState(account?.genesisDate ?? todayIsoDate())

  useEffect(() => {
    if (!open) {
      return
    }

    setName(account?.name ?? '')
    setDescription(account?.description ?? '')
    setColor(account?.color ?? DEFAULT_ENTITY_COLOR)
    setIcon(account?.icon ?? DEFAULT_ACCOUNT_ICON)
    setBalanceInput(account ? minorUnitsToDecimalString(account.balance) : '0,00')
    setGenesisDate(account?.genesisDate ?? todayIsoDate())
  }, [open, account])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const openingBalance = parseDecimalStringToMinorUnits(balanceInput)
    if (!trimmedName || openingBalance === null || !genesisDate) {
      return
    }

    await onSave({
      name: trimmedName,
      description: description.trim(),
      color,
      icon,
      openingBalance,
      genesisDate,
    })
    onOpenChange(false)
  }

  const parsedBalance = parseDecimalStringToMinorUnits(balanceInput)
  const isValid = Boolean(name.trim()) && parsedBalance !== null && genesisDate

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isCreate ? 'Add account' : 'Edit account'}
      description={
        isCreate
          ? 'Set up a physical bank account with its genesis opening balance and day-zero date.'
          : 'Update this account’s name, description, color, icon, and balance.'
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Name
          <input
            className={inputClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Balancing Account, Maestro Card…"
            disabled={isSaving}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Description
          <textarea
            className={`${inputClassName} min-h-20 resize-y`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this physical account is used for…"
            disabled={isSaving}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Icon
          <IconField value={icon} onChange={setIcon} disabled={isSaving} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Color
          <ColorField value={color} onChange={setColor} disabled={isSaving} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          {isCreate ? 'Opening balance (SEK)' : 'Current balance (SEK)'}
          <input
            className={inputClassName}
            value={balanceInput}
            onChange={(event) => setBalanceInput(event.target.value)}
            inputMode="decimal"
            placeholder="1 250,50"
            disabled={isSaving}
          />
          <p className={fieldHintClassName}>
            {isCreate
              ? 'Recorded as the account balance on the genesis date below.'
              : 'Updates the stored account balance directly.'}
          </p>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Genesis date
          <input
            className={inputClassName}
            type="date"
            value={genesisDate}
            onChange={(event) => setGenesisDate(event.target.value)}
            disabled={isSaving || !isCreate}
          />
          <p className={fieldHintClassName}>
            Day-zero onboarding date. CSV imports ignore rows before this date.
          </p>
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)] px-3 py-2.5">
          <div
            className="flex size-10 items-center justify-center rounded-xl border border-[var(--border)]"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <AccountIconGlyph icon={icon} />
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">
              {name.trim() || 'Account preview'}
            </p>
            <p className="m-0 truncate text-xs text-[var(--text-muted)]">
              {description.trim() || 'Description preview'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !isValid}>
            {isSaving ? 'Saving…' : isCreate ? 'Add account' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
