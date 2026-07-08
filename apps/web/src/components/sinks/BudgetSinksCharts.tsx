import { aggregateLedgerBySink } from 'budget-core'
import { Cell, Bar, BarChart, XAxis, YAxis } from 'recharts'
import { ChartPanel, SpendingBarChart } from '@/components/charts/chart-panels'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { type BudgetSink, getLedgerTransactions } from '@/lib/budget-types'
import { chartColor, toNamedAmounts } from '@/lib/chart-colors'
import { formatMoney } from '@/lib/format-money'
import { sinkGoalAmount } from '@/lib/sinks'

type BudgetSinksChartsProps = {
  sinks: BudgetSink[]
  ledgerTransactions: unknown
}

function SinkProgressChart({ sinks }: { sinks: BudgetSink[] }) {
  const rows = sinks
    .map((sink, index) => {
      const goal = sinkGoalAmount(sink)
      if (goal <= 0) {
        return null
      }

      return {
        id: sink.id,
        label: sink.name,
        balance: Math.min(sink.balance, goal),
        remaining: Math.max(0, goal - sink.balance),
        fill: chartColor(index, sink.color),
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const chartConfig = {
    balance: { label: 'Funded', color: 'var(--chart-1)' },
    remaining: { label: 'Remaining', color: 'var(--chart-5)' },
  } satisfies ChartConfig

  return (
    <ChartPanel
      title="Sink progress"
      description="Balance toward each sink goal, cap, or bill cycle."
      emptyMessage="Create sinks with targets to see progress."
      isEmpty={rows.length === 0}
    >
      <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[320px] w-full">
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={112}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                    </span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {formatMoney(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar dataKey="balance" stackId="progress" fill="var(--color-balance)" radius={[4, 0, 0, 4]}>
            {rows.map((entry) => (
              <Cell key={`${entry.id}-balance`} fill={entry.fill} />
            ))}
          </Bar>
          <Bar
            dataKey="remaining"
            stackId="progress"
            fill="var(--color-remaining)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  )
}

export function BudgetSinksCharts({ sinks, ledgerTransactions }: BudgetSinksChartsProps) {
  const ledger = getLedgerTransactions(ledgerTransactions)
  const sinkLookup = (id: string) => sinks.find((sink) => sink.id === id)?.name ?? 'Unknown sink'
  const sinkColor = (id: string) => sinks.find((sink) => sink.id === id)?.color
  const hasLedgerData = ledger.length > 0

  const spendingBySink = toNamedAmounts(
    aggregateLedgerBySink(ledger),
    sinkLookup,
    sinkColor,
  ).slice(0, 8)

  return (
    <div className="budget-charts-grid mb-4">
      <SinkProgressChart sinks={sinks} />
      <SpendingBarChart
        title="Spending by sink"
        description="Expenses assigned to each sink."
        rows={spendingBySink}
        emptyMessage={
          hasLedgerData
            ? 'No sink-assigned spending yet.'
            : 'Import and categorize transactions to see sink spending.'
        }
      />
    </div>
  )
}
