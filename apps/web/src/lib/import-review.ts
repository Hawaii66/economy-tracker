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
  date: string
  amount: number
  description: string
  rawRow: Record<string, string>
  assignment: RuleAssignment
  matchedRuleId: string | null
  approved: boolean
  expanded: boolean
}

export function buildImportReviewRows(
  rows: ParsedCsvRow[],
  rules: readonly MatchableRule[],
): ImportReviewRow[] {
  return rows.map((row, index) => {
    const matchedRule = findMatchingRule(row.description, rules)

    return {
      id: `preview-${index}`,
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
