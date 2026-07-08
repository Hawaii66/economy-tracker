import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { BudgetSink } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import type { DueSinkFundingPlan } from '@/lib/sinks'
import { sinkFundingPromptLabel } from '@/lib/sinks'

type FundDueSinksModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: DueSinkFundingPlan
  sinksById: Map<string, BudgetSink>
  onConfirm: () => Promise<void>
  isSaving: boolean
  errorMessage?: string | null
}

export function FundDueSinksModal({
  open,
  onOpenChange,
  plan,
  sinksById,
  onConfirm,
  isSaving,
  errorMessage,
}: FundDueSinksModalProps) {
  const dueCount = plan.entries.length + plan.skipped.length
  const canFund = plan.entries.length > 0

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Fund due sinks"
      description={
        dueCount === 1
          ? 'One sink needs catch-up funding. Review the amount before confirming.'
          : `${dueCount} sinks need catch-up funding. Review the amounts before confirming.`
      }
      className="w-[min(36rem,calc(100vw-2rem))]"
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)] px-3 py-2.5 text-sm">
          <p className="m-0 text-[var(--text-muted)]">Available headroom</p>
          <p className="m-0 mt-1 font-semibold text-[var(--text)]">{formatMoney(plan.headroom)}</p>
        </div>

        {plan.entries.length > 0 ? (
          <div>
            <p className="m-0 text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Will fund
            </p>
            <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
              {plan.entries.map((entry) => {
                const sink = sinksById.get(entry.sinkId)
                return (
                  <li
                    key={entry.sinkId}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.35)] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="m-0 truncate font-semibold text-[var(--text)]">
                        {sink?.name ?? entry.sinkId}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-[var(--text-muted)]">
                        {sinkFundingPromptLabel(entry.missedMonths)}
                        {entry.missedMonths > 1
                          ? ` · ${entry.missedMonths}× ${formatMoney(entry.monthlyPace)}`
                          : null}
                      </p>
                    </div>
                    <p className="m-0 shrink-0 font-semibold text-[var(--text)]">
                      {formatMoney(entry.amount)}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {plan.skipped.length > 0 ? (
          <div>
            <p className="m-0 text-xs font-bold tracking-wide text-[#E88A8A] uppercase">
              Cannot fund — insufficient headroom
            </p>
            <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
              {plan.skipped.map((entry) => {
                const sink = sinksById.get(entry.sinkId)
                return (
                  <li
                    key={entry.sinkId}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[rgba(232,138,138,0.25)] bg-[rgba(232,138,138,0.06)] px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="m-0 truncate font-semibold text-[var(--text)]">
                        {sink?.name ?? entry.sinkId}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-[var(--text-muted)]">
                        Needs {formatMoney(entry.suggestedAmount)}
                      </p>
                    </div>
                    <p className="m-0 shrink-0 text-sm text-[var(--text-muted)]">Skipped</p>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-xl border border-[rgba(94,174,255,0.35)] bg-[rgba(94,174,255,0.08)] px-3 py-2.5 text-sm">
          <span className="font-semibold text-[var(--text)]">Total to fund</span>
          <span className="font-semibold text-[var(--accent)]">
            {formatMoney(plan.totalFundable)}
          </span>
        </div>

        {plan.skipped.length > 0 && plan.entries.length > 0 ? (
          <p className="m-0 text-sm text-[var(--text-muted)]">
            Funding {plan.entries.length} of {dueCount} due sinks. Sinks with the most missed
            months are funded first when headroom is limited.
          </p>
        ) : null}

        {!canFund ? (
          <p className="m-0 rounded-lg border border-[rgba(232,138,138,0.35)] bg-[rgba(232,138,138,0.08)] px-3 py-2 text-sm text-[#E88A8A]">
            No headroom available to fund due sinks. Free up cash or withdraw from other sinks
            first.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="m-0 rounded-lg border border-[rgba(232,138,138,0.35)] bg-[rgba(232,138,138,0.08)] px-3 py-2 text-sm text-[#E88A8A]">
            {errorMessage}
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
          <Button type="button" disabled={isSaving || !canFund} onClick={() => void onConfirm()}>
            {isSaving
              ? 'Funding…'
              : plan.entries.length === 1
                ? 'Fund sink'
                : `Fund ${plan.entries.length} sinks`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
