import type { Sink } from 'budget-core'
import {
  guardRailFromState,
  isGuardRailHealthy,
  maxFundableAmount,
  missedFundingMonths,
  sinkCatchUpAmount,
  sinkFundingPromptLabel,
  sinkFundingStatus,
  sinkMonthlyPace,
  totalAccountCash,
  totalSinkBalance,
} from 'budget-core'
import { todayIsoDate } from '@/lib/accounts'
import { DEFAULT_SINK_ICON } from '@/lib/sink-icons'

export {
  guardRailFromState,
  isGuardRailHealthy,
  maxFundableAmount,
  missedFundingMonths,
  sinkCatchUpAmount,
  sinkFundingPromptLabel,
  sinkFundingStatus,
  sinkMonthlyPace,
  totalAccountCash,
  totalSinkBalance,
}
export type { SinkFundingStatus } from 'budget-core'

export type SinkType = Sink['sinkType']

export const SINK_TYPE_OPTIONS = [
  {
    value: 'target_date' as const,
    label: 'Target date',
    description: 'Save toward a goal by a specific date',
  },
  {
    value: 'recurring_bill' as const,
    label: 'Recurring bill',
    description: 'Amortize quarterly or yearly bills monthly',
  },
  {
    value: 'capped_reserve' as const,
    label: 'Capped reserve',
    description: 'Fund monthly until a safety ceiling is reached',
  },
] satisfies ReadonlyArray<{
  value: SinkType
  label: string
  description: string
}>

export function sinkTypeLabel(sink: Pick<Sink, 'sinkType'>): string {
  return SINK_TYPE_OPTIONS.find((option) => option.value === sink.sinkType)?.label ?? sink.sinkType
}

export function sinkProgressPercent(sink: Sink): number {
  switch (sink.sinkType) {
    case 'target_date':
      return sink.targetAmount > 0
        ? Math.min(100, Math.round((sink.balance / sink.targetAmount) * 100))
        : 0
    case 'recurring_bill':
      return sink.billAmount > 0
        ? Math.min(100, Math.round((sink.balance / sink.billAmount) * 100))
        : 0
    case 'capped_reserve':
      return sink.cap > 0 ? Math.min(100, Math.round((sink.balance / sink.cap) * 100)) : 0
  }
}

export function sinkProgressLabel(sink: Sink): string {
  switch (sink.sinkType) {
    case 'target_date':
      return 'Toward target'
    case 'recurring_bill':
      return 'Bill cycle funded'
    case 'capped_reserve':
      return 'Toward cap'
  }
}

export { todayIsoDate, DEFAULT_SINK_ICON }
