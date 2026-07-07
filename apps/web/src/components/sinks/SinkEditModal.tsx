import { useEffect, useState } from 'react'
import { SinkIcon as SinkIconGlyph } from '@/components/sinks/SinkIcon'
import { SinkIconField } from '@/components/sinks/SinkIconField'
import { ColorField } from '@/components/taxonomy/ColorField'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { fieldHintClassName, inputClassName } from '@/components/taxonomy/form-styles'
import { parseDecimalStringToMinorUnits } from '@/lib/format-money'
import { DEFAULT_SINK_ICON, type SinkIcon } from '@/lib/sink-icons'
import { SINK_TYPE_OPTIONS, type SinkType } from '@/lib/sinks'
import { DEFAULT_ENTITY_COLOR } from '@/lib/taxonomy'

type SinkAppearance = {
  color: string
  icon: SinkIcon
}

export type SinkCreateFormValues =
  | ({
      name: string
      sinkType: 'target_date'
      targetAmount: number
      targetDate: string
    } & SinkAppearance)
  | ({
      name: string
      sinkType: 'recurring_bill'
      billAmount: number
      periodMonths: number
    } & SinkAppearance)
  | ({
      name: string
      sinkType: 'capped_reserve'
      monthlyTarget: number
      cap: number
    } & SinkAppearance)

type SinkEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: SinkCreateFormValues) => Promise<void>
  isSaving: boolean
}

export function SinkEditModal({ open, onOpenChange, onSave, isSaving }: SinkEditModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_ENTITY_COLOR)
  const [icon, setIcon] = useState<SinkIcon>(DEFAULT_SINK_ICON)
  const [sinkType, setSinkType] = useState<SinkType>('target_date')
  const [targetAmountInput, setTargetAmountInput] = useState('2 000,00')
  const [targetDate, setTargetDate] = useState('')
  const [billAmountInput, setBillAmountInput] = useState('1 200,00')
  const [periodMonthsInput, setPeriodMonthsInput] = useState('12')
  const [monthlyTargetInput, setMonthlyTargetInput] = useState('500,00')
  const [capInput, setCapInput] = useState('5 000,00')

  useEffect(() => {
    if (!open) {
      return
    }

    setName('')
    setColor(DEFAULT_ENTITY_COLOR)
    setIcon(DEFAULT_SINK_ICON)
    setSinkType('target_date')
    setTargetAmountInput('2 000,00')
    setTargetDate('')
    setBillAmountInput('1 200,00')
    setPeriodMonthsInput('12')
    setMonthlyTargetInput('500,00')
    setCapInput('5 000,00')
  }, [open])

  const targetAmount = parseDecimalStringToMinorUnits(targetAmountInput)
  const billAmount = parseDecimalStringToMinorUnits(billAmountInput)
  const monthlyTarget = parseDecimalStringToMinorUnits(monthlyTargetInput)
  const cap = parseDecimalStringToMinorUnits(capInput)
  const periodMonths = Number.parseInt(periodMonthsInput, 10)

  const isValid = (() => {
    if (!name.trim()) {
      return false
    }

    switch (sinkType) {
      case 'target_date':
        return targetAmount !== null && targetAmount > 0 && Boolean(targetDate)
      case 'recurring_bill':
        return billAmount !== null && billAmount > 0 && periodMonths > 0
      case 'capped_reserve':
        return monthlyTarget !== null && cap !== null && monthlyTarget > 0 && cap > 0
    }
  })()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || !isValid) {
      return
    }

    if (sinkType === 'target_date' && targetAmount !== null && targetDate) {
      await onSave({
        name: trimmedName,
        color,
        icon,
        sinkType,
        targetAmount,
        targetDate,
      })
    } else if (sinkType === 'recurring_bill' && billAmount !== null && periodMonths > 0) {
      await onSave({
        name: trimmedName,
        color,
        icon,
        sinkType,
        billAmount,
        periodMonths,
      })
    } else if (sinkType === 'capped_reserve' && monthlyTarget !== null && cap !== null) {
      await onSave({
        name: trimmedName,
        color,
        icon,
        sinkType,
        monthlyTarget,
        cap,
      })
    } else {
      return
    }

    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add sink"
      description="Virtual envelopes stay decoupled from physical accounts. Names and targets cannot be changed after creation."
    >
      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Name
          <input
            className={inputClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Vacation, Car repairs, Netflix…"
            disabled={isSaving}
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Icon
          <SinkIconField value={icon} onChange={setIcon} disabled={isSaving} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
          Color
          <ColorField value={color} onChange={setColor} disabled={isSaving} />
        </label>

        <div
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5"
          style={{ backgroundColor: `${color}22` }}
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}33`, color }}
          >
            <SinkIconGlyph icon={icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-semibold text-[var(--text)]">
              {name.trim() || 'Sink preview'}
            </p>
            <p className="m-0 text-xs text-[var(--text-muted)]">Preview</p>
          </div>
        </div>

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-1 text-sm font-semibold text-[var(--text)]">Sink type</legend>
          {SINK_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)] px-3 py-2.5"
            >
              <input
                type="radio"
                name="sinkType"
                value={option.value}
                checked={sinkType === option.value}
                onChange={() => setSinkType(option.value)}
                disabled={isSaving}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-[var(--text)]">{option.label}</span>
                <span className="block text-xs text-[var(--text-muted)]">{option.description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {sinkType === 'target_date' ? (
          <>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Target amount (SEK)
              <input
                className={inputClassName}
                value={targetAmountInput}
                onChange={(event) => setTargetAmountInput(event.target.value)}
                inputMode="decimal"
                placeholder="2 000,00"
                disabled={isSaving}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Target date
              <input
                className={inputClassName}
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                disabled={isSaving}
              />
              <p className={fieldHintClassName}>
                Monthly pace is calculated from today until this date.
              </p>
            </label>
          </>
        ) : null}

        {sinkType === 'recurring_bill' ? (
          <>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Bill amount (SEK)
              <input
                className={inputClassName}
                value={billAmountInput}
                onChange={(event) => setBillAmountInput(event.target.value)}
                inputMode="decimal"
                placeholder="1 200,00"
                disabled={isSaving}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Billing period (months)
              <input
                className={inputClassName}
                value={periodMonthsInput}
                onChange={(event) => setPeriodMonthsInput(event.target.value)}
                inputMode="numeric"
                placeholder="12"
                disabled={isSaving}
              />
              <p className={fieldHintClassName}>
                For example, 12 for an annual subscription or 3 for a quarterly bill.
              </p>
            </label>
          </>
        ) : null}

        {sinkType === 'capped_reserve' ? (
          <>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[var(--text)]">
              Monthly target (SEK)
              <input
                className={inputClassName}
                value={monthlyTargetInput}
                onChange={(event) => setMonthlyTargetInput(event.target.value)}
                inputMode="decimal"
                placeholder="500,00"
                disabled={isSaving}
              />
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
          </>
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
            {isSaving ? 'Saving…' : 'Add sink'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
