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
  verificationNumber: string
  saldo: string
  rawRow: Record<string, string>
  assignment: RuleAssignment
  matchedRuleId: string | null
  approved: boolean
  expanded: boolean
}

export type TransactionDedupeFields = {
  accountId: string
  date: string
  description: string
  amount: number
  verificationNumber: string
  saldo: string
}

export type ImportReviewBatch = {
  id: string
  accountId: string
  fileName: string
  delimiter: string
  rowCount: number
  skippedRowCount: number
  genesisSkippedRowCount: number
  duplicateSkippedRowCount: number
  batchOrder: number
  rows: ImportReviewRow[]
}

export type CsvParsePreview = {
  rowCount: number
  skippedRowCount: number
  delimiter: string
  eligibleRowCount: number
  genesisSkippedRowCount: number
  duplicateSkippedRowCount: number
}

export function isOnOrAfterGenesisDate(date: string, genesisDate: string): boolean {
  return date >= genesisDate
}

export function filterParsedRowsByGenesisDate<T extends { date: string }>(
  rows: readonly T[],
  genesisDate: string,
): { rows: Array<T & { sourceRowIndex: number }>; genesisSkippedCount: number } {
  const filtered: Array<T & { sourceRowIndex: number }> = []
  let genesisSkippedCount = 0

  for (const [index, row] of rows.entries()) {
    if (isOnOrAfterGenesisDate(row.date, genesisDate)) {
      filtered.push({ ...row, sourceRowIndex: index })
    } else {
      genesisSkippedCount += 1
    }
  }

  return { rows: filtered, genesisSkippedCount }
}

export function buildParsePreview(
  parsed: { rows: readonly { date: string }[]; skippedRowCount: number; delimiter: string },
  genesisDate: string | null,
): CsvParsePreview {
  if (!genesisDate) {
    return {
      rowCount: parsed.rows.length,
      skippedRowCount: parsed.skippedRowCount,
      delimiter: parsed.delimiter,
      eligibleRowCount: parsed.rows.length,
      genesisSkippedRowCount: 0,
      duplicateSkippedRowCount: 0,
    }
  }

  const { rows, genesisSkippedCount } = filterParsedRowsByGenesisDate(parsed.rows, genesisDate)

  return {
    rowCount: parsed.rows.length,
    skippedRowCount: parsed.skippedRowCount,
    delimiter: parsed.delimiter,
    eligibleRowCount: rows.length,
    genesisSkippedRowCount: genesisSkippedCount,
    duplicateSkippedRowCount: 0,
  }
}

export function buildTransactionDedupeKey(row: TransactionDedupeFields): string {
  return [
    row.accountId,
    row.date,
    row.description,
    String(row.amount),
    row.verificationNumber,
    row.saldo,
  ].join('\u0001')
}

export function collectTransactionDedupeKeys(
  rows: readonly TransactionDedupeFields[],
): Set<string> {
  return new Set(rows.map((row) => buildTransactionDedupeKey(row)))
}

export function dedupeReviewRows<T extends TransactionDedupeFields>(
  rows: readonly T[],
  existingKeys: ReadonlySet<string>,
): { rows: T[]; duplicateSkippedCount: number } {
  const kept: T[] = []
  const keys = new Set(existingKeys)
  let duplicateSkippedCount = 0

  for (const row of rows) {
    const key = buildTransactionDedupeKey(row)
    if (keys.has(key)) {
      duplicateSkippedCount += 1
      continue
    }

    keys.add(key)
    kept.push(row)
  }

  return { rows: kept, duplicateSkippedCount }
}

export function buildImportReviewRows(
  rows: Array<ParsedCsvRow & { sourceRowIndex?: number }>,
  rules: readonly MatchableRule[],
  batchId: string,
  accountId: string,
  batchOrder: number,
): ImportReviewRow[] {
  return rows.map((row, index) => {
    const matchedRule = findMatchingRule(row.description, rules)

    return {
      id: `${batchId}-${row.sourceRowIndex ?? index}`,
      batchId,
      accountId,
      sourceRowIndex: row.sourceRowIndex ?? index,
      batchOrder,
      date: row.date,
      amount: row.amount,
      description: row.description,
      verificationNumber: row.verificationNumber,
      saldo: row.saldo,
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
  genesisDatesByAccountId: Readonly<Record<string, string>>,
): Map<string, ImportReviewRow[]> {
  const grouped = new Map<string, ImportReviewRow[]>()

  for (const row of flattenReviewRows(batches)) {
    if (!row.approved) {
      continue
    }

    const genesisDate = genesisDatesByAccountId[row.accountId]
    if (genesisDate && !isOnOrAfterGenesisDate(row.date, genesisDate)) {
      continue
    }

    const accountRows = grouped.get(row.accountId) ?? []
    accountRows.push(row)
    grouped.set(row.accountId, accountRows)
  }

  return grouped
}
