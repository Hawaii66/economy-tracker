import type { CategoryOption, SinkOption, TagOption } from '@/components/transactions/types'
import {
  buildLedgerById,
  getAccounts,
  getInternalTransferGroups,
  getLedgerTransactions,
  getSinks,
  getSplitGroups,
  type BudgetLedgerTransaction,
} from '@/lib/budget-types'

type Category = { id: string; name: string; color: string }
type LifestyleTag = { id: string; name: string; color: string }
type EventTag = { id: string; name: string; color: string; archived: boolean }

export type LedgerTableContext = {
  accountNames: Record<string, string>
  categoriesById: Record<string, CategoryOption>
  sinksById: Record<string, SinkOption>
  tagsById: Record<string, TagOption>
  ledgerById: Map<string, BudgetLedgerTransaction>
  internalTransferGroups: ReturnType<typeof getInternalTransferGroups>
  splitGroups: ReturnType<typeof getSplitGroups>
  allLedgerTransactions: BudgetLedgerTransaction[]
}

export function buildLedgerTableContext(state: Record<string, unknown>): LedgerTableContext {
  const accounts = getAccounts(state.accounts)
  const accountNames = Object.fromEntries(accounts.map((account) => [account.id, account.name]))
  const allLedgerTransactions = getLedgerTransactions(state.ledgerTransactions)

  const categoriesById = Object.fromEntries(
    (Object.values(state.categories ?? {}) as Category[]).map((category) => [
      category.id,
      category,
    ]),
  )

  const lifestyleTags = Object.values(state.lifestyleTags ?? {}) as LifestyleTag[]
  const eventTags = Object.values(state.eventTags ?? {}) as EventTag[]

  const tagsById = Object.fromEntries([
    ...lifestyleTags.map((tag) => [
      tag.id,
      { id: tag.id, name: tag.name, color: tag.color, kind: 'permanent' as const },
    ]),
    ...eventTags.map((tag) => [
      tag.id,
      { id: tag.id, name: tag.name, color: tag.color, kind: 'temporary' as const },
    ]),
  ])

  const sinksById = Object.fromEntries(
    getSinks(state.sinks).map((sink) => [
      sink.id,
      { id: sink.id, name: sink.name, color: sink.color, icon: sink.icon },
    ]),
  )

  return {
    accountNames,
    categoriesById,
    sinksById,
    tagsById,
    ledgerById: buildLedgerById(allLedgerTransactions),
    internalTransferGroups: getInternalTransferGroups(state.internalTransferGroups),
    splitGroups: getSplitGroups(state.splitGroups),
    allLedgerTransactions,
  }
}
