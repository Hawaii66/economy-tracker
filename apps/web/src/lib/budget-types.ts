import { normalizeSinkIcon } from 'budget-core'
import { type AccountIcon } from '@/lib/accounts'
import { DEFAULT_SINK_ICON, type SinkIcon } from '@/lib/sink-icons'
import { DEFAULT_ENTITY_COLOR } from '@/lib/taxonomy'

export type BudgetAccount = {
  id: string
  name: string
  description: string
  color: string
  icon: AccountIcon
  balance: number
  currency: string
  genesisDate: string
}

export type BudgetTargetDateSink = {
  id: string
  name: string
  color: string
  icon: SinkIcon
  balance: number
  lastFundedOn: string | null
  sinkType: 'target_date'
  targetAmount: number
  targetDate: string
}

export type BudgetRecurringBillSink = {
  id: string
  name: string
  color: string
  icon: SinkIcon
  balance: number
  lastFundedOn: string | null
  sinkType: 'recurring_bill'
  billAmount: number
  periodMonths: number
}

export type BudgetCappedReserveSink = {
  id: string
  name: string
  color: string
  icon: SinkIcon
  balance: number
  lastFundedOn: string | null
  sinkType: 'capped_reserve'
  monthlyTarget: number
  cap: number
}

export type BudgetSink =
  | BudgetTargetDateSink
  | BudgetRecurringBillSink
  | BudgetCappedReserveSink

export type BudgetRawTransaction = {
  id: string
  accountId: string
  importBatchId: string
  date: string
  amount: number
  description: string
  rawRow: Record<string, string>
}

export type BudgetVirtualSlice = {
  id: string
  amount: number
  description?: string
  categoryId: string | null
  sinkId: string | null
  lifestyleTagIds: string[]
  eventTagIds: string[]
}

export type BudgetLedgerTransaction = {
  id: string
  rawTransactionId: string | null
  accountId: string
  date: string
  amount: number
  description: string
  categoryId: string | null
  sinkId: string | null
  lifestyleTagIds: string[]
  eventTagIds: string[]
  internalTransferGroupId: string | null
  virtualSlices: BudgetVirtualSlice[]
}

export type BudgetInternalTransferGroup = {
  id: string
  ledgerTransactionIds: [string, string]
  initiatedByUserId: string
}

function asRecord<T>(value: unknown): Record<string, T> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, T>
  }
  return {}
}

export function getAccounts(accounts: unknown): BudgetAccount[] {
  return Object.values(asRecord<BudgetAccount>(accounts))
}

export function getSinks(sinks: unknown): BudgetSink[] {
  return Object.values(asRecord<BudgetSink>(sinks))
    .map((sink) => ({
      ...sink,
      lastFundedOn: sink.lastFundedOn ?? null,
      color: sink.color ?? DEFAULT_ENTITY_COLOR,
      icon: normalizeSinkIcon(sink.icon ?? DEFAULT_SINK_ICON) as SinkIcon,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function getRawTransactions(rawTransactions: unknown): BudgetRawTransaction[] {
  return Object.values(asRecord<BudgetRawTransaction>(rawTransactions)).sort((left, right) =>
    right.date.localeCompare(left.date),
  )
}

export function getLedgerTransactions(
  ledgerTransactions: unknown,
): BudgetLedgerTransaction[] {
  return Object.values(asRecord<BudgetLedgerTransaction>(ledgerTransactions))
    .map((transaction) => ({
      ...transaction,
      lifestyleTagIds: transaction.lifestyleTagIds ?? [],
      eventTagIds: transaction.eventTagIds ?? [],
      virtualSlices: transaction.virtualSlices ?? [],
      internalTransferGroupId: transaction.internalTransferGroupId ?? null,
    }))
    .sort((left, right) => right.date.localeCompare(left.date))
}

export function getInternalTransferGroups(
  internalTransferGroups: unknown,
): BudgetInternalTransferGroup[] {
  return Object.values(asRecord<BudgetInternalTransferGroup>(internalTransferGroups))
}

export function buildLedgerByRawId(
  ledgerTransactions: readonly BudgetLedgerTransaction[],
): Map<string, BudgetLedgerTransaction> {
  const ledgerByRawId = new Map<string, BudgetLedgerTransaction>()

  for (const ledger of ledgerTransactions) {
    if (ledger.rawTransactionId) {
      ledgerByRawId.set(ledger.rawTransactionId, ledger)
    }
  }

  return ledgerByRawId
}

export function buildLedgerById(
  ledgerTransactions: readonly BudgetLedgerTransaction[],
): Map<string, BudgetLedgerTransaction> {
  return new Map(ledgerTransactions.map((ledger) => [ledger.id, ledger]))
}

export function getUnlinkedRawTransactions(
  rawTransactions: unknown,
  ledgerTransactions: unknown,
): BudgetRawTransaction[] {
  const linkedRawIds = new Set(
    getLedgerTransactions(ledgerTransactions)
      .map((transaction) => transaction.rawTransactionId)
      .filter((rawTransactionId): rawTransactionId is string => rawTransactionId !== null),
  )

  return getRawTransactions(rawTransactions).filter(
    (transaction) => !linkedRawIds.has(transaction.id),
  )
}

export function shortEntityId(id: string): string {
  return id.slice(-6)
}

export function getTransferCounterpartyId(
  ledger: BudgetLedgerTransaction,
  internalTransferGroups: readonly BudgetInternalTransferGroup[],
): string | null {
  if (!ledger.internalTransferGroupId) {
    return null
  }

  const group = internalTransferGroups.find(
    (candidate) => candidate.id === ledger.internalTransferGroupId,
  )
  if (!group) {
    return null
  }

  return group.ledgerTransactionIds.find((id) => id !== ledger.id) ?? null
}
