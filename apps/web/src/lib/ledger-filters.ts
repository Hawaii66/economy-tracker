import type { BudgetLedgerTransaction } from '@/lib/budget-types'

export type LedgerFilters = {
  accountId?: string
  categoryId?: string
  sinkId?: string
  tagId?: string
  from?: string
  to?: string
}

function transactionMatchesSink(
  transaction: BudgetLedgerTransaction,
  sinkId: string,
): boolean {
  if (transaction.sinkId === sinkId) {
    return true
  }

  return transaction.virtualSlices.some((slice) => slice.sinkId === sinkId)
}

function transactionMatchesCategory(
  transaction: BudgetLedgerTransaction,
  categoryId: string,
): boolean {
  if (transaction.categoryId === categoryId) {
    return true
  }

  return transaction.virtualSlices.some((slice) => slice.categoryId === categoryId)
}

function transactionMatchesTag(
  transaction: BudgetLedgerTransaction,
  tagId: string,
): boolean {
  const tagIds = [...transaction.lifestyleTagIds, ...transaction.eventTagIds]
  if (tagIds.includes(tagId)) {
    return true
  }

  return transaction.virtualSlices.some(
    (slice) => slice.lifestyleTagIds.includes(tagId) || slice.eventTagIds.includes(tagId),
  )
}

export function filterLedgerTransactions(
  transactions: readonly BudgetLedgerTransaction[],
  filters: LedgerFilters,
): BudgetLedgerTransaction[] {
  return transactions.filter((transaction) => {
    if (filters.accountId && transaction.accountId !== filters.accountId) {
      return false
    }

    if (filters.from && transaction.date < filters.from) {
      return false
    }

    if (filters.to && transaction.date > filters.to) {
      return false
    }

    if (filters.sinkId && !transactionMatchesSink(transaction, filters.sinkId)) {
      return false
    }

    if (filters.categoryId && !transactionMatchesCategory(transaction, filters.categoryId)) {
      return false
    }

    if (filters.tagId && !transactionMatchesTag(transaction, filters.tagId)) {
      return false
    }

    return true
  })
}
