import { ClientOnly } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { BudgetOverviewCharts } from '@/components/overview/BudgetOverviewCharts'

function ChartsFallback() {
  return (
    <div className="budget-charts-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <section key={index} className="budget-panel budget-chart-panel">
          <div className="mb-4 h-10 animate-pulse rounded-lg bg-[var(--border)]/60" />
          <div className="aspect-[4/3] max-h-[260px] animate-pulse rounded-xl bg-[var(--border)]/40" />
        </section>
      ))}
    </div>
  )
}

export function BudgetOverviewChartsClient(
  props: ComponentProps<typeof BudgetOverviewCharts>,
) {
  return (
    <ClientOnly fallback={<ChartsFallback />}>
      <BudgetOverviewCharts {...props} />
    </ClientOnly>
  )
}
