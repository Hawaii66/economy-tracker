export type BudgetAccount = {
  id: string
  name: string
  description: string
  color: string
  icon: string
  balance: number
  currency: string
  genesisDate: string
}

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
  splitGroupId: string | null
  internalTransferGroupId: string | null
  virtualSlices: BudgetVirtualSlice[]
}

export type BudgetInternalTransferGroup = {
  id: string
  ledgerTransactionIds: [string, string]
  initiatedByUserId: string
}

export type BudgetSplitGroup = {
  id: string
  parentLedgerTransactionId: string
  linkedLedgerTransactionIds: string[]
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
      splitGroupId: transaction.splitGroupId ?? null,
    }))
    .sort((left, right) => right.date.localeCompare(left.date))
}

export function getInternalTransferGroups(
  internalTransferGroups: unknown,
): BudgetInternalTransferGroup[] {
  return Object.values(asRecord<BudgetInternalTransferGroup>(internalTransferGroups))
}

export function getSplitGroups(splitGroups: unknown): BudgetSplitGroup[] {
  return Object.values(asRecord<BudgetSplitGroup>(splitGroups))
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
