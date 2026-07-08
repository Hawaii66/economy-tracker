import { ArrowDownCircle, ArrowLeft, ArrowUpCircle, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { SinkCapEditModal, type CappedReserveEditValues } from '@/components/sinks/SinkCapEditModal'
import { SinkFundModal, type SinkFundMode } from '@/components/sinks/SinkFundModal'
import { SinkIcon } from '@/components/sinks/SinkIcon'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useAppendBudgetEvents } from '@/hooks/use-append-budget-events'
import type { Id } from '@economy-tracker/convex/dataModel'
import {
  getAccounts,
  getLedgerTransactions,
  getSinks,
  type BudgetSink,
} from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import {
  aggregateSinkSpendingByMonth,
  buildSinkActivityTimeline,
  collectSinkLedgerEntries,
  sinkActivityLabel,
  totalSinkSpending,
  type SinkActivityEvent,
} from '@/lib/sink-history'
import {
  maxFundableAmount,
  sinkMonthlyPace,
  sinkProgressLabel,
  sinkProgressPercent,
  sinkTypeLabel,
  todayIsoDate,
} from '@/lib/sinks'

type SinkDetailViewProps = {
  budgetId: Id<'budgets'>
  sinkId: string
  state: Record<string, unknown>
  activityEvents: SinkActivityEvent[]
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

function MonthlySpendingChart({
  rows,
  sinkColor,
}: {
  rows: Array<{ id: string; amount: number }>
  sinkColor: string
}) {
  const chartConfig = {
    spending: { label: 'Spending', color: sinkColor },
  } satisfies ChartConfig

  const chartData = rows.map((row) => ({
    month: row.id,
    spending: row.amount,
  }))

  if (rows.length === 0) {
    return (
      <p className="m-0 py-8 text-center text-sm text-[var(--text-muted)]">
        No spending recorded for this sink yet.
      </p>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-[5/2] max-h-[220px] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
        />
        <YAxis hide />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {formatMoney(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="spending" fill="var(--color-spending)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

function activityAmountClass(kind: string): string {
  if (kind === 'funded') {
    return 'text-[var(--accent)]'
  }
  if (kind === 'withdrawn' || kind === 'spent') {
    return 'text-[#E88A8A]'
  }
  return 'text-[var(--text-muted)]'
}

export default function SinkDetailView({
  budgetId,
  sinkId,
  state,
  activityEvents,
}: SinkDetailViewProps) {
  const navigate = useNavigate()
  const submitEvents = useAppendBudgetEvents(budgetId)

  const [isSaving, setIsSaving] = useState(false)
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const [capModalOpen, setCapModalOpen] = useState(false)
  const [fundMode, setFundMode] = useState<SinkFundMode>('fund')
  const [mutationError, setMutationError] = useState<string | null>(null)

  const today = todayIsoDate()
  const accounts = getAccounts(state.accounts)
  const sinks = getSinks(state.sinks)
  const sink = sinks.find((candidate) => candidate.id === sinkId)
  const ledgerTransactions = getLedgerTransactions(state.ledgerTransactions)

  const accountsRecord = Object.fromEntries(accounts.map((account) => [account.id, account]))
  const sinksRecord = Object.fromEntries(sinks.map((candidate) => [candidate.id, candidate]))
  const headroom = maxFundableAmount(accountsRecord, sinksRecord)

  if (!sink) {
    return (
      <div className="budget-page">
        <p className="m-0 text-sm text-[var(--text-muted)]">This sink could not be found.</p>
        <Link
          to="/dashboard/budgets/$budgetId/sinks"
          params={{ budgetId }}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] no-underline"
        >
          <ArrowLeft className="size-4" />
          Back to sinks
        </Link>
      </div>
    )
  }

  const activeSink = sink
  const progress = sinkProgressPercent(activeSink)
  const monthlySpending = aggregateSinkSpendingByMonth(ledgerTransactions, sinkId)
  const ledgerEntries = collectSinkLedgerEntries(ledgerTransactions, sinkId)
  const spentTotal = totalSinkSpending(ledgerTransactions, sinkId)
  const activity = buildSinkActivityTimeline(activityEvents, ledgerTransactions, sinkId)
  const accountNames = Object.fromEntries(accounts.map((account) => [account.id, account.name]))

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

  const handleFundSave = async (amount: number) => {
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

  const handleCapSave = async (values: CappedReserveEditValues) => {
    if (activeSink.sinkType !== 'capped_reserve') {
      return
    }

    const events: Array<{ eventType: string; payload: Record<string, unknown> }> = []

    if (values.cap !== activeSink.cap) {
      events.push({
        eventType: 'SINK_CAP_UPDATED',
        payload: { sinkId: activeSink.id, cap: values.cap },
      })
    }

    if (values.monthlyTarget !== activeSink.monthlyTarget) {
      events.push({
        eventType: 'SINK_MONTHLY_TARGET_UPDATED',
        payload: { sinkId: activeSink.id, monthlyTarget: values.monthlyTarget },
      })
    }

    if (events.length === 0) {
      return
    }

    await runMutation(() => submitEvents(events))
    setCapModalOpen(false)
  }

  function openFund() {
    setFundMode('fund')
    setMutationError(null)
    setFundModalOpen(true)
  }

  function openWithdraw() {
    setFundMode('withdraw')
    setMutationError(null)
    setFundModalOpen(true)
  }

  return (
    <>
      <div className="budget-page">
        <Link
          to="/dashboard/budgets/$budgetId/sinks"
          params={{ budgetId }}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
        >
          <ArrowLeft className="size-4" />
          All sinks
        </Link>

        <header className="budget-page-header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${activeSink.color}22`, color: activeSink.color }}
              >
                <SinkIcon icon={activeSink.icon} className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="kicker mb-1">{sinkTypeLabel(activeSink)}</p>
                <h1 className="display-title m-0 text-2xl text-[var(--text)] sm:text-3xl">
                  {activeSink.name}
                </h1>
                <p className="m-0 mt-1 text-lg font-semibold text-[var(--text)]">
                  {formatMoney(activeSink.balance)}
                </p>
                {activeSink.lastFundedOn ? (
                  <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">
                    Last funded {activeSink.lastFundedOn}
                  </p>
                ) : (
                  <p className="m-0 mt-1 text-sm text-[var(--text-muted)]">Never funded</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={openFund}>
                <ArrowUpCircle />
                Fund
              </Button>
              <Button size="sm" variant="outline" onClick={openWithdraw}>
                <ArrowDownCircle />
                Withdraw
              </Button>
              {activeSink.sinkType === 'capped_reserve' ? (
                <Button size="sm" variant="outline" onClick={() => setCapModalOpen(true)}>
                  <Pencil />
                  Edit
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="budget-panel">
            <h2 className="m-0 text-base font-semibold text-[var(--text)]">Progress</h2>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{sinkProgressLabel(activeSink)}</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar percent={progress} />
            </div>
            <SinkMetadata sink={activeSink} today={today} />

            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
              <div>
                <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                  Total spent
                </dt>
                <dd className="m-0 mt-1 font-semibold text-[var(--text)]">
                  {formatMoney(spentTotal)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                  Transactions
                </dt>
                <dd className="m-0 mt-1 font-semibold text-[var(--text)]">
                  {ledgerEntries.filter((entry) => entry.amount < 0).length}
                </dd>
              </div>
            </dl>
          </section>

          <section className="budget-panel">
            <h2 className="m-0 text-base font-semibold text-[var(--text)]">Monthly spending</h2>
            <p className="mt-1 mb-4 text-sm text-[var(--text-muted)]">
              Expenses assigned to this sink, grouped by month.
            </p>
            <MonthlySpendingChart rows={monthlySpending} sinkColor={activeSink.color} />
          </section>
        </div>

        <section className="budget-panel mt-4">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-base font-semibold text-[var(--text)]">Activity</h2>
              <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                Funding, withdrawals, and expenses over time.
              </p>
            </div>
            <Link
              to="/dashboard/budgets/$budgetId/ledger"
              params={{ budgetId }}
              search={{ sinkId }}
              className="text-sm text-[var(--accent)] no-underline hover:underline"
            >
              View in ledger
            </Link>
          </div>

          {activity.length > 0 ? (
            <ul className="m-0 list-none divide-y divide-[var(--border)] p-0">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-medium text-[var(--text)]">
                      {sinkActivityLabel(item)}
                    </p>
                    <p className="m-0 mt-0.5 text-xs text-[var(--text-muted)]">{item.date}</p>
                    {item.kind === 'spent' && item.ledgerId ? (
                      <button
                        type="button"
                        className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-xs text-[var(--accent)] hover:underline"
                        onClick={() =>
                          navigate({
                            to: '/dashboard/budgets/$budgetId/ledger',
                            params: { budgetId },
                            search: { sinkId },
                          })
                        }
                      >
                        View in ledger
                      </button>
                    ) : null}
                  </div>
                  {item.amount !== undefined ? (
                    <span
                      className={`shrink-0 text-sm font-semibold tabular-nums ${activityAmountClass(item.kind)}`}
                    >
                      {item.kind === 'funded'
                        ? '+'
                        : item.kind === 'withdrawn' || item.kind === 'spent'
                          ? '−'
                          : ''}
                      {formatMoney(item.amount)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 py-6 text-center text-sm text-[var(--text-muted)]">
              No activity yet. Fund this sink or categorize expenses to it.
            </p>
          )}
        </section>

        {ledgerEntries.length > 0 ? (
          <section className="budget-panel mt-4">
            <h2 className="m-0 text-base font-semibold text-[var(--text)]">Transactions</h2>
            <p className="mt-1 mb-4 text-sm text-[var(--text-muted)]">
              Ledger entries assigned to this sink.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
                    <th className="pb-2 pr-4 font-bold">Date</th>
                    <th className="pb-2 pr-4 font-bold">Description</th>
                    <th className="pb-2 pr-4 font-bold">Account</th>
                    <th className="pb-2 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-[var(--border)]">
                      <td className="py-2.5 pr-4 text-[var(--text-muted)]">{entry.date}</td>
                      <td className="py-2.5 pr-4 text-[var(--text)]">{entry.description || '—'}</td>
                      <td className="py-2.5 pr-4 text-[var(--text-muted)]">
                        {accountNames[entry.accountId] ?? entry.accountId.slice(-6)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-medium tabular-nums ${
                          entry.amount < 0 ? 'text-[#E88A8A]' : 'text-[var(--accent)]'
                        }`}
                      >
                        {formatMoney(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>

      <SinkFundModal
        open={fundModalOpen}
        onOpenChange={setFundModalOpen}
        sink={activeSink}
        mode={fundMode}
        maxFundableAmount={headroom}
        onSave={handleFundSave}
        isSaving={isSaving}
        errorMessage={mutationError}
      />

      <SinkCapEditModal
        open={capModalOpen}
        onOpenChange={setCapModalOpen}
        sink={activeSink.sinkType === 'capped_reserve' ? activeSink : undefined}
        onSave={handleCapSave}
        isSaving={isSaving}
      />
    </>
  )
}
