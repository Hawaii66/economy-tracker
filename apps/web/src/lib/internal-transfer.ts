import type { BudgetRawTransaction } from '@/lib/budget-types'

export type TransferMatchableTransaction = Pick<
  BudgetRawTransaction,
  'id' | 'accountId' | 'date' | 'amount' | 'description'
>

export function isInternalTransferPair(
  left: TransferMatchableTransaction,
  right: TransferMatchableTransaction,
): boolean {
  if (left.id === right.id) {
    return false
  }

  if (left.accountId === right.accountId) {
    return false
  }

  return left.amount + right.amount === 0
}

function dateDistance(left: string, right: string): number {
  const leftMs = Date.parse(left)
  const rightMs = Date.parse(right)
  if (Number.isNaN(leftMs) || Number.isNaN(rightMs)) {
    return Number.MAX_SAFE_INTEGER
  }
  return Math.abs(leftMs - rightMs)
}

export function findInternalTransferCandidates<T extends TransferMatchableTransaction>(
  source: T,
  transactions: readonly T[],
): T[] {
  return transactions
    .filter((candidate) => isInternalTransferPair(source, candidate))
    .sort((left, right) => {
      const leftDateDistance = dateDistance(left.date, source.date)
      const rightDateDistance = dateDistance(right.date, source.date)
      if (leftDateDistance !== rightDateDistance) {
        return leftDateDistance - rightDateDistance
      }

      return left.description.localeCompare(right.description)
    })
}
