import {
  assignmentFromRule,
  findMatchingCategorizeRule,
  parseDecimalStringToMinorUnits,
  type MatchableRule,
  type RuleAssignment,
} from 'budget-core'

export type SplittableTransaction = {
  description: string
  amount: number
}

export type TransactionSplitRow = {
  id: string
  amountMinor: number
  assignment: RuleAssignment
}

export type SaveImportedTransactionInput =
  | { mode: 'single'; assignment: RuleAssignment }
  | {
      mode: 'split'
      slices: Array<{ amount: number; assignment: RuleAssignment }>
    }

export function createSplitRow(
  transaction: SplittableTransaction,
  rules: readonly MatchableRule[],
  amountMinor: number,
): TransactionSplitRow {
  return {
    id: crypto.randomUUID(),
    amountMinor,
    assignment: assignmentFromRule(findMatchingCategorizeRule(transaction.description, rules)),
  }
}

export function buildInitialSplitRows(
  transaction: SplittableTransaction,
  rules: readonly MatchableRule[],
): TransactionSplitRow[] {
  return [createSplitRow(transaction, rules, transaction.amount)]
}

export function signedSliceAmountFromInput(
  input: string,
  parentAmount: number,
): number | null {
  if (input.trim() === '') {
    return 0
  }

  const parsed = parseDecimalStringToMinorUnits(input)
  if (parsed === null) {
    return null
  }

  const sign = parentAmount < 0 ? -1 : 1
  return sign * Math.abs(parsed)
}

export function sumSplitRowAmounts(rows: readonly TransactionSplitRow[]): number {
  return rows.reduce((total, row) => total + row.amountMinor, 0)
}

export function splitRowsAreBalanced(
  transactionAmount: number,
  rows: readonly TransactionSplitRow[],
): boolean {
  return sumSplitRowAmounts(rows) === transactionAmount
}

export function buildSaveImportedTransactionInput(
  rows: readonly TransactionSplitRow[],
): SaveImportedTransactionInput {
  if (rows.length === 1) {
    const row = rows[0]
    if (!row) {
      throw new Error('At least one split row is required.')
    }
    return { mode: 'single', assignment: row.assignment }
  }

  return {
    mode: 'split',
    slices: rows.map((row) => ({
      amount: row.amountMinor,
      assignment: row.assignment,
    })),
  }
}
