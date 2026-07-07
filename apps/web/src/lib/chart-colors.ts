export const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

export function chartColor(index: number, entityColor?: string): string {
  return entityColor ?? CHART_PALETTE[index % CHART_PALETTE.length]!
}

export type NamedAmount = {
  id: string
  label: string
  amount: number
  fill: string
}

export function toNamedAmounts(
  rows: ReadonlyArray<{ id: string; amount: number }>,
  labelForId: (id: string) => string,
  colorForId?: (id: string, index: number) => string | undefined,
): NamedAmount[] {
  return rows
    .filter((row) => row.amount > 0)
    .map((row, index) => ({
      id: row.id,
      label: labelForId(row.id),
      amount: row.amount,
      fill: chartColor(index, colorForId?.(row.id, index)),
    }))
}

export function buildChartConfig(
  rows: ReadonlyArray<Pick<NamedAmount, "id" | "label" | "fill">>,
): Record<string, { label: string; color: string }> {
  return Object.fromEntries(
    rows.map((row) => [row.id, { label: row.label, color: row.fill }]),
  )
}
