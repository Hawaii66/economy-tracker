import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { fieldHintClassName, inputClassName } from '@/components/taxonomy/form-styles'
import type { BudgetSink } from '@/lib/budget-types'
import {
  formatMoney,
  minorUnitsToDecimalString,
  parseDecimalStringToMinorUnits,
} from '@/lib/format-money'

export type SinkFundMode = 'fund' | 'withdraw'

type SinkFundModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sink?: BudgetSink
  mode: SinkFundMode
  maxFundableAmount: number
  onSave: (amount: number) => Promise<void>
  isSaving: boolean
  errorMessage?: string | null
  prefillAmount?: number
  catchUpMonths?: number
}

export function SinkFundModal({
  open,
  onOpenChange,
  sink,
  mode,
  maxFundableAmount,
  onSave,
  isSaving,
  errorMessage,
  prefillAmount,
  catchUpMonths,
}: SinkFundModalProps) {
  const [amountInput, setAmountInput] = useState('0,00')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setAmountInput(
      mode === 'fund' && prefillAmount !== undefined && prefillAmount > 0
        ? minorUnitsToDecimalString(prefillAmount)
        : '0,00',
    )
    setLocalError(null)
  }, [open, mode, sink?.id, prefillAmount])

  const amount = parseDecimalStringToMinorUnits(amountInput)
  const isFund = mode === 'fund'

  const isValid = (() => {
    if (amount === null || amount <= 0 || !sink) {
      return false
    }

    if (isFund && amount > maxFundableAmount) {
      return false
    }

    if (!isFund && amount > sink.balance) {
      return false
    }

    return true
  })()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sink || amount === null || amount <= 0) {
      return
    }

    if (isFund && amount > maxFundableAmount) {
      setLocalError(
        `Cannot fund more than ${formatMoney(maxFundableAmount)} — that is your remaining headroom.`,
      )
      return
    }

    if (!isFund && amount > sink.balance) {
      setLocalError(`Cannot withdraw more than the current balance of ${formatMoney(sink.balance)}.`)
      return
    }

    setLocalError(null)
    await onSave(amount)
    onOpenChange(false)
  }

  const displayError = localError ?? errorMessage
  const isCatchUp = isFund && catchUpMonths !== undefined && catchUpMonths > 0

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isFund ? (isCatchUp ? 'Catch up funding' : 'Fund sink') : 'Withdraw from sink'}
      description={
        sink
          ? isFund && isCatchUp
            ? `“${sink.name}” is ${catchUpMonths === 1 ? 'due for this month' : `${catchUpMonths} months behind`}. Suggested catch-up: ${formatMoney(prefillAmount ?? 0)}.`
            : `${isFund ? 'Allocate virtual funds to' : 'Remove virtual funds from'} “${sink.name}”. Physical account balances are unchanged.`
          : undefined
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        {sink ? (
          <div className="rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)] px-3 py-2.5 text-sm">
            <p className="m-0 text-[var(--text-muted)]">Current balance</p>
            <p className="m-0 mt-1 font-semibold text-[var(--text)]">{formatMoney(sink.balance)}</p>
            {sink.lastFundedOn ? (
              <p className="m-0 mt-2 text-xs text-[var(--text-muted)]">
                Last funded: {sink.lastFundedOn}
              </p>
            ) : (
              <p className="m-0 mt-2 text-xs text-[var(--text-muted)]">Never funded</p>
            )}
            {isFund ? (
              <p className="m-0 mt-2 text-xs text-[var(--text-muted)]">
                Available headroom: {formatMoney(maxFundableAmount)}
              </p>
            ) : null}
          </div>
        ) : null}

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Amount (SEK)
          <input
            className={inputClassName}
            value={amountInput}
            onChange={(event) => {
              setAmountInput(event.target.value)
              setLocalError(null)
            }}
            inputMode="decimal"
            placeholder="500,00"
            disabled={isSaving}
            autoFocus
          />
          <p className={fieldHintClassName}>
            {isFund
              ? 'Funding is blocked when total virtual sink balances would exceed account cash.'
              : 'Withdrawals reduce the virtual envelope balance only.'}
          </p>
        </label>

        {displayError ? (
          <p className="m-0 rounded-lg border border-[rgba(232,138,138,0.35)] bg-[rgba(232,138,138,0.08)] px-3 py-2 text-sm text-[#E88A8A]">
            {displayError}
          </p>
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
          <Button type="submit" disabled={isSaving || !isValid}>
            {isSaving ? 'Saving…' : isFund ? 'Fund sink' : 'Withdraw'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
