import {
  aggregateIncomeAndExpenses,
  aggregateLedgerByCategory,
  aggregateLedgerBySink,
  aggregateLedgerByTag,
  aggregateMonthlyTrend,
} from 'budget-core'
import { useNavigate } from '@tanstack/react-router'
import { Cell, Label, Pie, PieChart, Bar, BarChart, XAxis, YAxis } from 'recharts'
import {
  type BudgetAccount,
  type BudgetSink,
  getLedgerTransactions,
} from '@/lib/budget-types'
import { ChartPanel, formatMonthLabel, SpendingBarChart } from '@/components/charts/chart-panels'
import { buildChartConfig, toNamedAmounts } from '@/lib/chart-colors'
import { formatMoney } from '@/lib/format-money'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type CategoryRecord = Record<string, { name: string; color: string }>
type TagRecord = Record<string, { name: string; color: string }>

type BudgetOverviewChartsProps = {
  budgetId: string
  accounts: BudgetAccount[]
  sinks: BudgetSink[]
  categories: CategoryRecord
  tags: TagRecord
  ledgerTransactions: unknown
  guardRail: {
    cash: number
    sinkTotal: number
    headroom: number
    healthy: boolean
  }
}

function BalancePieChart({
  title,
  description,
  rows,
  emptyMessage,
  onItemClick,
}: {
  title: string
  description: string
  rows: ReturnType<typeof toNamedAmounts>
  emptyMessage: string
  onItemClick?: (id: string) => void
}) {
  const chartConfig = buildChartConfig(rows) satisfies ChartConfig
  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const clickable = Boolean(onItemClick)

  return (
    <ChartPanel
      title={title}
      description={description}
      emptyMessage={emptyMessage}
      isEmpty={rows.length === 0}
    >
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[260px]">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">{item.payload.label}</span>
                    <span className="font-mono font-medium text-foreground tabular-nums">
                      {formatMoney(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={rows}
            dataKey="amount"
            nameKey="label"
            innerRadius={58}
            outerRadius={92}
            strokeWidth={2}
            stroke="var(--border)"
            className={clickable ? 'cursor-pointer' : undefined}
            onClick={
              onItemClick
                ? (slice) => {
                    const payload = slice?.payload as { id?: string } | undefined
                    if (payload?.id) {
                      onItemClick(payload.id)
                    }
                  }
                : undefined
            }
          >
            {rows.map((entry) => (
              <Cell key={entry.id} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                  return null
                }

                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-[var(--text)] text-lg font-semibold"
                    >
                      {formatMoney(total)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 18}
                      className="fill-[var(--text-muted)] text-xs"
                    >
                      Total
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </ChartPanel>
  )
}

function GuardRailChart({
  guardRail,
}: {
  guardRail: BudgetOverviewChartsProps['guardRail']
}) {
  const chartConfig = {
    sinks: { label: 'Sink balances', color: 'var(--chart-2)' },
    headroom: {
      label: guardRail.headroom >= 0 ? 'Free headroom' : 'Over-allocated',
      color: guardRail.headroom >= 0 ? 'var(--chart-1)' : '#E88A8A',
    },
  } satisfies ChartConfig

  const chartData = [
    {
      label: 'Allocation',
      sinks: guardRail.sinkTotal,
      headroom: Math.max(0, guardRail.headroom),
    },
  ]

  return (
    <ChartPanel
      title="Guard-rail allocation"
      description="How account cash is split between virtual sinks and free headroom."
      emptyMessage="Add accounts to see guard-rail allocation."
      isEmpty={guardRail.cash <= 0 && guardRail.sinkTotal <= 0}
    >
      <ChartContainer config={chartConfig} className="aspect-[5/2] max-h-[220px] w-full">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 8 }}>
          <XAxis
            type="number"
            hide
            domain={[0, Math.max(guardRail.cash, guardRail.sinkTotal, 1)]}
          />
          <YAxis type="category" dataKey="label" hide width={0} />
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
          <Bar dataKey="sinks" stackId="guard" fill="var(--color-sinks)" radius={[4, 0, 0, 4]} />
          <Bar
            dataKey="headroom"
            stackId="guard"
            fill="var(--color-headroom)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
      {!guardRail.healthy ? (
        <p className="mb-0 mt-3 text-sm text-[#E88A8A]">
          Sinks exceed cash by {formatMoney(Math.abs(guardRail.headroom))}.
        </p>
      ) : null}
    </ChartPanel>
  )
}

function IncomeExpenseChart({
  income,
  expenses,
}: {
  income: number
  expenses: number
}) {
  const chartConfig = {
    income: { label: 'Income', color: 'var(--chart-1)' },
    expenses: { label: 'Expenses', color: 'var(--chart-4)' },
  } satisfies ChartConfig

  const chartData = [{ label: 'Totals', income, expenses }]

  return (
    <ChartPanel
      title="Income vs expenses"
      description="Ledger totals excluding internal transfers."
      emptyMessage="Import and categorize transactions to see income and spending."
      isEmpty={income === 0 && expenses === 0}
    >
      <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[260px] w-full">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <YAxis hide />
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
          <Bar dataKey="income" fill="var(--color-income)" radius={4} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  )
}

function MonthlyTrendChart({
  rows,
}: {
  rows: ReturnType<typeof aggregateMonthlyTrend>
}) {
  const chartConfig = {
    income: { label: 'Income', color: 'var(--chart-1)' },
    expenses: { label: 'Expenses', color: 'var(--chart-4)' },
  } satisfies ChartConfig

  const chartData = rows.map((row) => ({
    label: formatMonthLabel(row.id),
    income: row.income,
    expenses: row.expenses,
  }))

  const isEmpty = rows.every((row) => row.income === 0 && row.expenses === 0)

  return (
    <ChartPanel
      title="Monthly trend"
      description="Income and expenses over time, excluding internal transfers."
      emptyMessage="Import and categorize transactions to see monthly trends."
      isEmpty={isEmpty}
    >
      <ChartContainer config={chartConfig} className="aspect-[5/2] max-h-[280px] w-full">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis hide />
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
          <Bar dataKey="income" fill="var(--color-income)" radius={4} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  )
}

export function BudgetOverviewCharts({
  budgetId,
  accounts,
  sinks,
  categories,
  tags,
  ledgerTransactions,
  guardRail,
}: BudgetOverviewChartsProps) {
  const navigate = useNavigate()
  const ledger = getLedgerTransactions(ledgerTransactions)
  const categoryLookup = (id: string) => categories[id]?.name ?? 'Uncategorized'
  const categoryColor = (id: string) => categories[id]?.color
  const tagLookup = (id: string) => tags[id]?.name ?? 'Unknown tag'
  const tagColor = (id: string) => tags[id]?.color
  const sinkLookup = (id: string) => sinks.find((sink) => sink.id === id)?.name ?? 'Unknown sink'
  const sinkColor = (id: string) => sinks.find((sink) => sink.id === id)?.color
  const accountLookup = (id: string) =>
    accounts.find((account) => account.id === id)?.name ?? 'Unknown account'
  const accountColor = (id: string) => accounts.find((account) => account.id === id)?.color

  const accountRows = toNamedAmounts(
    accounts.map((account) => ({ id: account.id, amount: Math.max(0, account.balance) })),
    accountLookup,
    accountColor,
  )

  const sinkRows = toNamedAmounts(
    sinks.map((sink) => ({ id: sink.id, amount: Math.max(0, sink.balance) })),
    sinkLookup,
    sinkColor,
  )

  const spendingByCategory = toNamedAmounts(
    aggregateLedgerByCategory(ledger),
    categoryLookup,
    categoryColor,
  ).slice(0, 8)

  const spendingBySink = toNamedAmounts(
    aggregateLedgerBySink(ledger),
    sinkLookup,
    sinkColor,
  ).slice(0, 8)

  const spendingByTag = toNamedAmounts(
    aggregateLedgerByTag(ledger),
    tagLookup,
    tagColor,
  ).slice(0, 8)

  const monthlyTrend = aggregateMonthlyTrend(ledger)
  const { income, expenses } = aggregateIncomeAndExpenses(ledger)
  const hasLedgerData = ledger.length > 0

  function openLedgerFilter(search: {
    accountId?: string
    categoryId?: string
    sinkId?: string
    tagId?: string
  }) {
    navigate({
      to: '/dashboard/budgets/$budgetId/ledger',
      params: { budgetId },
      search,
    })
  }

  return (
    <div className="budget-charts-grid">
      <BalancePieChart
        title="Account cash"
        description="Physical cash held across accounts. Click a slice to filter the ledger."
        rows={accountRows}
        emptyMessage="Add an account to see cash breakdown."
        onItemClick={(accountId) => openLedgerFilter({ accountId })}
      />
      <BalancePieChart
        title="Sink allocation"
        description="Virtual funds reserved in sinks. Click a slice to filter the ledger."
        rows={sinkRows}
        emptyMessage="Create sinks to see virtual allocation."
        onItemClick={(sinkId) => openLedgerFilter({ sinkId })}
      />
      <GuardRailChart guardRail={guardRail} />
      <IncomeExpenseChart income={income} expenses={expenses} />
      <SpendingBarChart
        title="Spending by category"
        description="Categorized expenses from the ledger. Click a bar to filter the ledger."
        rows={spendingByCategory}
        emptyMessage={
          hasLedgerData
            ? 'No categorized spending yet.'
            : 'Import and categorize transactions to see spending breakdown.'
        }
        onItemClick={(categoryId) => openLedgerFilter({ categoryId })}
      />
      <SpendingBarChart
        title="Spending by sink"
        description="Expenses assigned to each sink. Click a bar to filter the ledger."
        rows={spendingBySink}
        emptyMessage={
          hasLedgerData
            ? 'No sink-assigned spending yet.'
            : 'Import and categorize transactions to see sink spending.'
        }
        onItemClick={(sinkId) => openLedgerFilter({ sinkId })}
      />
      <SpendingBarChart
        title="Spending by tag"
        description="Expenses tagged with lifestyle or event labels. Click a bar to filter the ledger."
        rows={spendingByTag}
        emptyMessage={
          hasLedgerData
            ? 'No tagged spending yet.'
            : 'Import and categorize transactions to see tag spending.'
        }
        onItemClick={(tagId) => openLedgerFilter({ tagId })}
      />
      <MonthlyTrendChart rows={monthlyTrend} />
    </div>
  )
}
