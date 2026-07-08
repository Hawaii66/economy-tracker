import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import {
  activeFilterCount,
  buildLedgerSearch,
  omitLedgerFilter,
  type LedgerFilterKey,
  type LedgerFilters,
} from '@/lib/ledger-filters'

type FilterEntity = {
  label: string
  href?: string
}

type LedgerFilterBarProps = {
  budgetId: string
  filters: LedgerFilters
  entities: Partial<Record<LedgerFilterKey, FilterEntity>>
}

const filterLabels: Record<LedgerFilterKey, string> = {
  accountId: 'Account',
  categoryId: 'Category',
  sinkId: 'Sink',
  tagId: 'Tag',
  from: 'From',
  to: 'To',
}

function formatFilterValue(key: LedgerFilterKey, entity: FilterEntity | undefined, value: string) {
  if (key === 'from' || key === 'to') {
    return value
  }

  return entity?.label ?? value.slice(-6)
}

export function LedgerFilterBar({ budgetId, filters, entities }: LedgerFilterBarProps) {
  const count = activeFilterCount(filters)
  if (count === 0) {
    return null
  }

  const activeEntries = (Object.keys(filterLabels) as LedgerFilterKey[]).flatMap((key) => {
    const value = filters[key]
    if (!value) {
      return []
    }

    return [{ key, value }]
  })

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="demo-pill">{count} active filter{count === 1 ? '' : 's'}</span>
      {activeEntries.map(({ key, value }) => {
        const entity = entities[key]
        const label = formatFilterValue(key, entity, value)
        const remaining = buildLedgerSearch(omitLedgerFilter(filters, key))

        return (
          <span key={key} className="demo-pill inline-flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">{filterLabels[key]}:</span>
            {entity?.href ? (
              <Link to={entity.href} className="font-medium text-[var(--accent)] no-underline hover:underline">
                {label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--text)]">{label}</span>
            )}
            <Link
              to="/dashboard/budgets/$budgetId/ledger"
              params={{ budgetId }}
              search={remaining}
              className="inline-flex text-[var(--text-muted)] no-underline hover:text-[var(--text)]"
              aria-label={`Remove ${filterLabels[key]} filter`}
            >
              <X className="size-3.5" />
            </Link>
          </span>
        )
      })}
      <Link
        to="/dashboard/budgets/$budgetId/ledger"
        params={{ budgetId }}
        className="text-sm text-[var(--accent)] no-underline hover:underline"
      >
        Clear all
      </Link>
    </div>
  )
}
