import type { ReactNode } from 'react'
import { Cell, Bar, BarChart, XAxis, YAxis } from 'recharts'
import { formatMoney } from '@/lib/format-money'
import { buildChartConfig, type NamedAmount } from '@/lib/chart-colors'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

export function ChartPanel({
  title,
  description,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string
  description: string
  children: ReactNode
  emptyMessage: string
  isEmpty: boolean
}) {
  return (
    <section className="budget-panel budget-chart-panel">
      <div className="mb-4">
        <h2 className="m-0 text-base font-semibold text-[var(--text)]">{title}</h2>
        <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {isEmpty ? (
        <p className="m-0 py-8 text-center text-sm text-[var(--text-muted)]">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  )
}

export function SpendingBarChart({
  title,
  description,
  rows,
  emptyMessage,
}: {
  title: string
  description: string
  rows: NamedAmount[]
  emptyMessage: string
}) {
  const chartConfig = buildChartConfig(rows) satisfies ChartConfig

  return (
    <ChartPanel
      title={title}
      description={description}
      emptyMessage={emptyMessage}
      isEmpty={rows.length === 0}
    >
      <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[280px] w-full">
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={96}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value) => formatMoney(Number(value))}
              />
            }
          />
          <Bar dataKey="amount" radius={4}>
            {rows.map((entry) => (
              <Cell key={entry.id} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  )
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}
