import { ClientOnly } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { BudgetSinksCharts } from '@/components/sinks/BudgetSinksCharts'

function ChartsFallback() {
  return (
    <div className="budget-charts-grid mb-4">
      {Array.from({ length: 2 }, (_, index) => (
        <section key={index} className="budget-panel budget-chart-panel">
          <div className="mb-4 h-10 animate-pulse rounded-lg bg-[var(--border)]/60" />
          <div className="aspect-[4/3] max-h-[280px] animate-pulse rounded-xl bg-[var(--border)]/40" />
        </section>
      ))}
    </div>
  )
}

export function BudgetSinksChartsClient(props: ComponentProps<typeof BudgetSinksCharts>) {
  return (
    <ClientOnly fallback={<ChartsFallback />}>
      <BudgetSinksCharts {...props} />
    </ClientOnly>
  )
}
