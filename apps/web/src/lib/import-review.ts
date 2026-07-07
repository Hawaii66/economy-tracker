import {
  assignmentFromRule,
  findMatchingRule,
  type MatchableRule,
  type RuleAssignment,
} from 'budget-core'
import type { ParsedCsvRow } from '@/lib/csv-import'

export type { RuleAssignment as TransactionAssignment }

export type ImportReviewRow = {
  id: string
  batchId: string
  accountId: string
  sourceRowIndex: number
  batchOrder: number
  date: string
  amount: number
  description: string
  rawRow: Record<string, string>
  assignment: RuleAssignment
  matchedRuleId: string | null
  approved: boolean
  expanded: boolean
}

export type ImportReviewBatch = {
  id: string
  accountId: string
  fileName: string
  delimiter: string
  rowCount: number
  skippedRowCount: number
  batchOrder: number
  rows: ImportReviewRow[]
}

export type CsvParsePreview = {
  rowCount: number
  skippedRowCount: number
  delimiter: string
}

export function buildImportReviewRows(
  rows: ParsedCsvRow[],
  rules: readonly MatchableRule[],
  batchId: string,
  accountId: string,
  batchOrder: number,
): ImportReviewRow[] {
  return rows.map((row, index) => {
    const matchedRule = findMatchingRule(row.description, rules)

    return {
      id: `${batchId}-${index}`,
      batchId,
      accountId,
      sourceRowIndex: index,
      batchOrder,
      date: row.date,
      amount: row.amount,
      description: row.description,
      rawRow: row.rawRow,
      assignment: assignmentFromRule(matchedRule),
      matchedRuleId: matchedRule?.id ?? null,
      approved: false,
      expanded: false,
    }
  })
}

export function sortReviewRowsByDate(rows: readonly ImportReviewRow[]): ImportReviewRow[] {
  return [...rows].sort((left, right) => {
    const dateCompare = right.date.localeCompare(left.date)
    if (dateCompare !== 0) {
      return dateCompare
    }

    if (left.batchOrder !== right.batchOrder) {
      return left.batchOrder - right.batchOrder
    }

    return left.sourceRowIndex - right.sourceRowIndex
  })
}

export function flattenReviewRows(batches: readonly ImportReviewBatch[]): ImportReviewRow[] {
  return sortReviewRowsByDate(batches.flatMap((batch) => batch.rows))
}

export function applyReviewRowUpdates(
  batches: ImportReviewBatch[],
  updatedRows: readonly ImportReviewRow[],
): ImportReviewBatch[] {
  const rowsById = new Map(updatedRows.map((row) => [row.id, row]))

  return batches.map((batch) => ({
    ...batch,
    rows: batch.rows.map((row) => rowsById.get(row.id) ?? row),
  }))
}

export function groupApprovedRowsByAccount(
  batches: readonly ImportReviewBatch[],
): Map<string, ImportReviewRow[]> {
  const grouped = new Map<string, ImportReviewRow[]>()

  for (const row of flattenReviewRows(batches)) {
    if (!row.approved) {
      continue
    }

    const accountRows = grouped.get(row.accountId) ?? []
    accountRows.push(row)
    grouped.set(row.accountId, accountRows)
  }

  return grouped
}
