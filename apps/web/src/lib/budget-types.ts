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

export type BudgetLedgerTransaction = {
  id: string
  rawTransactionId: string | null
  accountId: string
  date: string
  amount: number
  description: string
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
  return Object.values(asRecord<BudgetLedgerTransaction>(ledgerTransactions)).sort(
    (left, right) => right.date.localeCompare(left.date),
  )
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
