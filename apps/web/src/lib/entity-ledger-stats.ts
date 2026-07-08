import {
  aggregateLedgerByCategory,
  aggregateLedgerBySink,
  aggregateLedgerByTag,
  type LedgerAggregationRow,
} from 'budget-core'
import type { BudgetLedgerTransaction } from '@/lib/budget-types'
import { filterLedgerTransactions, type LedgerFilters } from '@/lib/ledger-filters'

export type EntityLedgerStats = {
  transactionCount: number
  totalSpent: number
  totalIncome: number
}

export function statsForEntity(
  transactions: readonly BudgetLedgerTransaction[],
  filters: LedgerFilters,
): EntityLedgerStats {
  const filtered = filterLedgerTransactions(transactions, filters)
  let totalSpent = 0
  let totalIncome = 0

  for (const transaction of filtered) {
    if (transaction.internalTransferGroupId) {
      continue
    }

    if (transaction.virtualSlices.length > 0) {
      for (const slice of transaction.virtualSlices) {
        if (slice.amount < 0) {
          totalSpent += Math.abs(slice.amount)
        } else if (slice.amount > 0) {
          totalIncome += slice.amount
        }
      }
      continue
    }

    if (transaction.amount < 0) {
      totalSpent += Math.abs(transaction.amount)
    } else if (transaction.amount > 0) {
      totalIncome += transaction.amount
    }
  }

  return {
    transactionCount: filtered.length,
    totalSpent,
    totalIncome,
  }
}

function spendingAmount(rows: LedgerAggregationRow[], entityId: string): number {
  return rows.find((row) => row.id === entityId)?.amount ?? 0
}

export function categorySpendingAmount(
  transactions: readonly BudgetLedgerTransaction[],
  categoryId: string,
): number {
  return spendingAmount(aggregateLedgerByCategory(transactions), categoryId)
}

export function sinkSpendingAmount(
  transactions: readonly BudgetLedgerTransaction[],
  sinkId: string,
): number {
  return spendingAmount(aggregateLedgerBySink(transactions), sinkId)
}

export function tagSpendingAmount(
  transactions: readonly BudgetLedgerTransaction[],
  tagId: string,
): number {
  return spendingAmount(aggregateLedgerByTag(transactions), tagId)
}

export function categoryTransactionCount(
  transactions: readonly BudgetLedgerTransaction[],
  categoryId: string,
): number {
  return filterLedgerTransactions(transactions, { categoryId }).length
}

export function tagTransactionCount(
  transactions: readonly BudgetLedgerTransaction[],
  tagId: string,
): number {
  return filterLedgerTransactions(transactions, { tagId }).length
}

export function accountTransactionCount(
  transactions: readonly BudgetLedgerTransaction[],
  accountId: string,
): number {
  return filterLedgerTransactions(transactions, { accountId }).length
}
