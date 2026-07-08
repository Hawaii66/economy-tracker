import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowDownCircle, ArrowUpCircle, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '@economy-tracker/convex/api'
import type { Id } from '@economy-tracker/convex/dataModel'
import { SinkIcon } from '@/components/sinks/SinkIcon'
import { SinkCapEditModal, type CappedReserveEditValues } from '@/components/sinks/SinkCapEditModal'
import {
  SinkEditModal,
  type SinkCreateFormValues,
} from '@/components/sinks/SinkEditModal'
import { SinkFundModal, type SinkFundMode } from '@/components/sinks/SinkFundModal'
import { Button } from '@/components/ui/button'
import { useAppendBudgetEvents } from '@/hooks/use-append-budget-events'
import {
  getAccounts,
  getSinks,
  type BudgetCappedReserveSink,
  type BudgetSink,
} from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import {
  guardRailFromState,
  maxFundableAmount,
  sinkFundingPromptLabel,
  sinkFundingStatus,
  sinkMonthlyPace,
  sinkProgressLabel,
  sinkProgressPercent,
  sinkTypeLabel,
  todayIsoDate,
} from '@/lib/sinks'
import { generateEntityId } from '@/lib/taxonomy'

type SinksManagerProps = {
  budgetId: Id<'budgets'>
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[rgba(38,34,32,0.9)]">
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function SinkMetadata({ sink, today }: { sink: BudgetSink; today: string }) {
  const pace = sinkMonthlyPace(sink, today)

  switch (sink.sinkType) {
    case 'target_date':
      return (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Target
            </dt>
            <dd className="m-0 mt-1 text-[var(--text)]">{formatMoney(sink.targetAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Target date
            </dt>
            <dd className="m-0 mt-1 text-[var(--text)]">{sink.targetDate}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Monthly pace
            </dt>
            <dd className="m-0 mt-1 font-semibold text-[var(--text)]">{formatMoney(pace)}</dd>
          </div>
        </dl>
      )
    case 'recurring_bill':
      return (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Bill amount
            </dt>
            <dd className="m-0 mt-1 text-[var(--text)]">{formatMoney(sink.billAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Period
            </dt>
            <dd className="m-0 mt-1 text-[var(--text)]">{sink.periodMonths} months</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Monthly amortized
            </dt>
            <dd className="m-0 mt-1 font-semibold text-[var(--text)]">{formatMoney(pace)}</dd>
          </div>
        </dl>
      )
    case 'capped_reserve':
      return (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Monthly target
            </dt>
            <dd className="m-0 mt-1 text-[var(--text)]">{formatMoney(sink.monthlyTarget)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Cap
            </dt>
            <dd className="m-0 mt-1 text-[var(--text)]">{formatMoney(sink.cap)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Suggested pace
            </dt>
            <dd className="m-0 mt-1 font-semibold text-[var(--text)]">{formatMoney(pace)}</dd>
          </div>
        </dl>
      )
  }
}

export default function SinksManager({ budgetId }: SinksManagerProps) {
  const submitEvents = useAppendBudgetEvents(budgetId)
  const { data, isPending } = useQuery(convexQuery(api.budgets.getBudgetState, { budgetId }))

  const [isSaving, setIsSaving] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const [capModalOpen, setCapModalOpen] = useState(false)
  const [activeSink, setActiveSink] = useState<BudgetSink | undefined>()
  const [fundMode, setFundMode] = useState<SinkFundMode>('fund')
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [prefillAmount, setPrefillAmount] = useState<number | undefined>()
  const [catchUpMonths, setCatchUpMonths] = useState<number | undefined>()

  if (isPending || !data) {
    return (
      <section className="budget-panel">
        <p className="m-0 text-sm text-[var(--text-muted)]">Loading sinks…</p>
      </section>
    )
  }

  const today = todayIsoDate()
  const accounts = getAccounts(data.state.accounts)
  const sinks = getSinks(data.state.sinks)
  const accountsRecord = Object.fromEntries(accounts.map((account) => [account.id, account]))
  const sinksRecord = Object.fromEntries(sinks.map((sink) => [sink.id, sink]))
  const guardRail = guardRailFromState({ accounts: accountsRecord, sinks: sinksRecord })
  const headroom = maxFundableAmount(accountsRecord, sinksRecord)

  async function runMutation(task: () => Promise<void>) {
    setIsSaving(true)
    setMutationError(null)
    try {
      await task()
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'Something went wrong.')
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  function openCreateSink() {
    setCreateModalOpen(true)
  }

  function openFundSink(sink: BudgetSink, options?: { prefillAmount?: number; catchUpMonths?: number }) {
    setActiveSink(sink)
    setFundMode('fund')
    setMutationError(null)
    setPrefillAmount(options?.prefillAmount)
    setCatchUpMonths(options?.catchUpMonths)
    setFundModalOpen(true)
  }

  function openWithdrawSink(sink: BudgetSink) {
    setActiveSink(sink)
    setFundMode('withdraw')
    setMutationError(null)
    setPrefillAmount(undefined)
    setCatchUpMonths(undefined)
    setFundModalOpen(true)
  }

  function openCapEdit(sink: BudgetCappedReserveSink) {
    setActiveSink(sink)
    setCapModalOpen(true)
  }

  async function handleCreateSink(values: SinkCreateFormValues) {
    const sinkId = generateEntityId()
    const base = { sinkId, name: values.name, color: values.color, icon: values.icon }

    const payload =
      values.sinkType === 'target_date'
        ? {
            ...base,
            sinkType: values.sinkType,
            targetAmount: values.targetAmount,
            targetDate: values.targetDate,
          }
        : values.sinkType === 'recurring_bill'
          ? {
              ...base,
              sinkType: values.sinkType,
              billAmount: values.billAmount,
              periodMonths: values.periodMonths,
            }
          : {
              ...base,
              sinkType: values.sinkType,
              monthlyTarget: values.monthlyTarget,
              cap: values.cap,
            }

    await runMutation(() =>
      submitEvents([
        {
          eventType: 'SINK_CREATED',
          payload,
        },
      ]),
    )
  }

  async function handleFundSave(amount: number) {
    if (!activeSink) {
      return
    }

    const eventType = fundMode === 'fund' ? 'SINK_FUNDED' : 'SINK_WITHDRAWN'

    try {
      await runMutation(() =>
        submitEvents([
          {
            eventType,
            payload: {
              sinkId: activeSink.id,
              amount,
              ledgerTransactionId: null,
            },
          },
        ]),
      )
      setFundModalOpen(false)
    } catch {
      // Keep modal open so the user can see the error.
    }
  }

  async function handleCapSave(values: CappedReserveEditValues) {
    if (!activeSink || activeSink.sinkType !== 'capped_reserve') {
      return
    }

    const events: Array<{ eventType: string; payload: Record<string, unknown> }> = []

    if (values.cap !== activeSink.cap) {
      events.push({
        eventType: 'SINK_CAP_UPDATED',
        payload: {
          sinkId: activeSink.id,
          cap: values.cap,
        },
      })
    }

    if (values.monthlyTarget !== activeSink.monthlyTarget) {
      events.push({
        eventType: 'SINK_MONTHLY_TARGET_UPDATED',
        payload: {
          sinkId: activeSink.id,
          monthlyTarget: values.monthlyTarget,
        },
      })
    }

    if (events.length === 0) {
      return
    }

    await runMutation(() => submitEvents(events))
  }

  return (
    <>
      <section
        className={`budget-panel mb-4 border ${
          guardRail.healthy
            ? 'border-[rgba(94,174,255,0.35)]'
            : 'border-[rgba(232,138,138,0.45)]'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Budget guard-rail</h2>
            <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
              Total account cash must cover total virtual sink balances.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${
              guardRail.healthy
                ? 'bg-[rgba(94,174,255,0.15)] text-[var(--accent)]'
                : 'bg-[rgba(232,138,138,0.15)] text-[#E88A8A]'
            }`}
          >
            {guardRail.healthy ? 'Healthy' : 'Over-allocated'}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Account cash
            </dt>
            <dd className="m-0 mt-1 text-lg font-semibold text-[var(--text)]">
              {formatMoney(guardRail.cash)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Sink balances
            </dt>
            <dd className="m-0 mt-1 text-lg font-semibold text-[var(--text)]">
              {formatMoney(guardRail.sinkTotal)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
              Headroom
            </dt>
            <dd
              className={`m-0 mt-1 text-lg font-semibold ${
                guardRail.headroom >= 0 ? 'text-[var(--text)]' : 'text-[#E88A8A]'
              }`}
            >
              {formatMoney(guardRail.headroom)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="budget-panel">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-[var(--text)]">Your sinks</h2>
            <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
              Virtual envelopes for goals, bills, and reserves. Sinks track intent — cash stays in
              whichever account you choose.
            </p>
          </div>
          <Button onClick={openCreateSink}>
            <Plus />
            Add sink
          </Button>
        </div>

        {sinks.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {sinks.map((sink) => {
              const progress = sinkProgressPercent(sink)
              const fundingStatus = sinkFundingStatus(sink, today)

              return (
                <div
                  key={sink.id}
                  className="rounded-xl border border-[var(--border)] bg-[rgba(27,24,23,0.55)]"
                >
                  {fundingStatus.needsFunding ? (
                    <button
                      type="button"
                      className="w-full cursor-pointer rounded-t-xl border-0 border-b border-[rgba(94,174,255,0.45)] bg-[rgba(94,174,255,0.12)] px-4 py-3 text-left transition hover:bg-[rgba(94,174,255,0.2)]"
                      onClick={() =>
                        openFundSink(sink, {
                          prefillAmount: fundingStatus.suggestedAmount,
                          catchUpMonths: fundingStatus.missedMonths,
                        })
                      }
                    >
                      <p className="m-0 text-sm font-bold tracking-wide text-[var(--accent)] uppercase">
                        {sinkFundingPromptLabel(fundingStatus.missedMonths)}
                      </p>
                      <p className="m-0 mt-1 text-base font-semibold text-[var(--text)]">
                        Fund {formatMoney(fundingStatus.suggestedAmount)}
                        {fundingStatus.missedMonths > 1
                          ? ` (${fundingStatus.missedMonths}× ${formatMoney(fundingStatus.monthlyPace)})`
                          : null}
                      </p>
                      {sink.lastFundedOn ? (
                        <p className="m-0 mt-1 text-xs text-[var(--text-muted)]">
                          Last funded {sink.lastFundedOn}
                        </p>
                      ) : (
                        <p className="m-0 mt-1 text-xs text-[var(--text-muted)]">Never funded</p>
                      )}
                    </button>
                  ) : null}
                  <Link
                    to="/dashboard/budgets/$budgetId/sinks/$sinkId"
                    params={{ budgetId, sinkId: sink.id }}
                    className="block p-4 text-[var(--text)] no-underline transition hover:bg-[rgba(27,24,23,0.75)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${sink.color}22`, color: sink.color }}
                        >
                          <SinkIcon icon={sink.icon} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="m-0 truncate text-base font-semibold text-[var(--text)]">
                              {sink.name}
                            </h3>
                            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                              {sinkTypeLabel(sink)}
                            </span>
                          </div>
                          <p className="m-0 mt-1 text-sm font-semibold text-[var(--text)]">
                            {formatMoney(sink.balance)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>{sinkProgressLabel(sink)}</span>
                        <span>{progress}%</span>
                      </div>
                      <ProgressBar percent={progress} />
                    </div>

                    <SinkMetadata sink={sink} today={today} />
                  </Link>
                  <div className="flex flex-wrap gap-1 border-t border-[var(--border)] px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => openFundSink(sink)}>
                      <ArrowUpCircle />
                      Fund
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openWithdrawSink(sink)}>
                      <ArrowDownCircle />
                      Withdraw
                    </Button>
                    {sink.sinkType === 'capped_reserve' ? (
                      <Button size="sm" variant="outline" onClick={() => openCapEdit(sink)}>
                        <Pencil />
                        Edit
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-muted)]">No sinks yet.</p>
        )}
      </section>

      <SinkEditModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSave={handleCreateSink}
        isSaving={isSaving}
      />

      <SinkFundModal
        open={fundModalOpen}
        onOpenChange={setFundModalOpen}
        sink={activeSink}
        mode={fundMode}
        maxFundableAmount={headroom}
        onSave={handleFundSave}
        isSaving={isSaving}
        errorMessage={mutationError}
        prefillAmount={prefillAmount}
        catchUpMonths={catchUpMonths}
      />

      <SinkCapEditModal
        open={capModalOpen}
        onOpenChange={setCapModalOpen}
        sink={activeSink?.sinkType === 'capped_reserve' ? activeSink : undefined}
        onSave={handleCapSave}
        isSaving={isSaving}
      />
    </>
  )
}
