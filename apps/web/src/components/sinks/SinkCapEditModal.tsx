import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { fieldHintClassName, inputClassName } from '@/components/taxonomy/form-styles'
import type { BudgetCappedReserveSink } from '@/lib/budget-types'
import {
  formatMoney,
  minorUnitsToDecimalString,
  parseDecimalStringToMinorUnits,
} from '@/lib/format-money'

export type CappedReserveEditValues = {
  cap: number
  monthlyTarget: number
}

type SinkCapEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sink?: BudgetCappedReserveSink
  onSave: (values: CappedReserveEditValues) => Promise<void>
  isSaving: boolean
}

export function SinkCapEditModal({
  open,
  onOpenChange,
  sink,
  onSave,
  isSaving,
}: SinkCapEditModalProps) {
  const [capInput, setCapInput] = useState('0,00')
  const [monthlyTargetInput, setMonthlyTargetInput] = useState('0,00')

  useEffect(() => {
    if (!open || !sink) {
      return
    }

    setCapInput(minorUnitsToDecimalString(sink.cap))
    setMonthlyTargetInput(minorUnitsToDecimalString(sink.monthlyTarget))
  }, [open, sink])

  const cap = parseDecimalStringToMinorUnits(capInput)
  const monthlyTarget = parseDecimalStringToMinorUnits(monthlyTargetInput)
  const isValid =
    cap !== null &&
    cap > 0 &&
    monthlyTarget !== null &&
    monthlyTarget > 0 &&
    Boolean(sink) &&
    (sink ? cap >= sink.balance : false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!sink || cap === null || monthlyTarget === null || cap <= 0 || monthlyTarget <= 0) {
      return
    }

    if (cap < sink.balance) {
      return
    }

    await onSave({ cap, monthlyTarget })
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit capped reserve"
      description={
        sink
          ? `Update funding settings for “${sink.name}”. The cap cannot be lower than the current balance.`
          : undefined
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        {sink ? (
          <div className="rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)] px-3 py-2.5 text-sm">
            <p className="m-0 text-[var(--text-muted)]">Current balance</p>
            <p className="m-0 mt-1 font-semibold text-[var(--text)]">{formatMoney(sink.balance)}</p>
          </div>
        ) : null}

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Monthly target (SEK)
          <input
            className={inputClassName}
            value={monthlyTargetInput}
            onChange={(event) => setMonthlyTargetInput(event.target.value)}
            inputMode="decimal"
            placeholder="500,00"
            disabled={isSaving}
            autoFocus
          />
          <p className={fieldHintClassName}>
            Suggested monthly contribution until the cap is reached.
          </p>
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Cap (SEK)
          <input
            className={inputClassName}
            value={capInput}
            onChange={(event) => setCapInput(event.target.value)}
            inputMode="decimal"
            placeholder="5 000,00"
            disabled={isSaving}
          />
          <p className={fieldHintClassName}>
            Funding pace drops to zero once the balance reaches this ceiling.
          </p>
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
          <Button type="submit" disabled={isSaving || !isValid}>
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
