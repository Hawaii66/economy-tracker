import type { BudgetLedgerTransaction } from '@/lib/budget-types'

export type LedgerFilters = {
  accountId?: string
  categoryId?: string
  sinkId?: string
  tagId?: string
  from?: string
  to?: string
}

export type LedgerFilterKey = keyof LedgerFilters

export function activeFilterCount(filters: LedgerFilters): number {
  return Object.values(filters).filter(Boolean).length
}

export function buildLedgerSearch(filters: LedgerFilters): LedgerFilters {
  const search: LedgerFilters = {}

  if (filters.accountId) {
    search.accountId = filters.accountId
  }
  if (filters.categoryId) {
    search.categoryId = filters.categoryId
  }
  if (filters.sinkId) {
    search.sinkId = filters.sinkId
  }
  if (filters.tagId) {
    search.tagId = filters.tagId
  }
  if (filters.from) {
    search.from = filters.from
  }
  if (filters.to) {
    search.to = filters.to
  }

  return search
}

export function omitLedgerFilter(
  filters: LedgerFilters,
  key: LedgerFilterKey,
): LedgerFilters {
  const next = { ...filters }
  delete next[key]
  return next
}

export function summarizeFilteredLedger(
  transactions: readonly BudgetLedgerTransaction[],
): { count: number; totalIn: number; totalOut: number } {
  let totalIn = 0
  let totalOut = 0

  for (const transaction of transactions) {
    if (transaction.internalTransferGroupId) {
      continue
    }

    if (transaction.virtualSlices.length > 0) {
      for (const slice of transaction.virtualSlices) {
        if (slice.amount > 0) {
          totalIn += slice.amount
        } else if (slice.amount < 0) {
          totalOut += Math.abs(slice.amount)
        }
      }
      continue
    }

    if (transaction.amount > 0) {
      totalIn += transaction.amount
    } else if (transaction.amount < 0) {
      totalOut += Math.abs(transaction.amount)
    }
  }

  return { count: transactions.length, totalIn, totalOut }
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
