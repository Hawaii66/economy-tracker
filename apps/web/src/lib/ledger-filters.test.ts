import { describe, expect, it } from 'vitest'
import type { BudgetLedgerTransaction } from '@/lib/budget-types'
import {
  activeFilterCount,
  buildLedgerSearch,
  filterLedgerTransactions,
  omitLedgerFilter,
  summarizeFilteredLedger,
} from '@/lib/ledger-filters'

function ledger(overrides: Partial<BudgetLedgerTransaction> = {}): BudgetLedgerTransaction {
  return {
    id: 'ledger-1',
    rawTransactionId: null,
    accountId: 'account-1',
    date: '2026-03-15',
    amount: -1000,
    description: 'Test',
    categoryId: 'category-1',
    sinkId: 'sink-1',
    lifestyleTagIds: ['tag-1'],
    eventTagIds: [],
    internalTransferGroupId: null,
    virtualSlices: [],
    ...overrides,
  }
}

describe('filterLedgerTransactions', () => {
  it('filters by account, category, sink, tag, and date range', () => {
    const parent = ledger({
      id: 'parent',
      virtualSlices: [
        {
          id: 'slice-1',
          amount: -500,
          categoryId: 'category-2',
          sinkId: 'sink-2',
          lifestyleTagIds: ['tag-2'],
          eventTagIds: [],
        },
      ],
    })
    const transactions = [
      ledger(),
      parent,
      ledger({
        id: 'transfer',
        internalTransferGroupId: 'transfer-group',
        categoryId: null,
        sinkId: null,
      }),
      ledger({ id: 'other-account', accountId: 'account-2', date: '2026-01-01' }),
    ]

    expect(filterLedgerTransactions(transactions, { accountId: 'account-1' })).toHaveLength(3)
    expect(filterLedgerTransactions(transactions, { categoryId: 'category-2' })).toEqual([parent])
    expect(filterLedgerTransactions(transactions, { sinkId: 'sink-2' })).toEqual([parent])
    expect(filterLedgerTransactions(transactions, { tagId: 'tag-2' })).toEqual([parent])
    expect(filterLedgerTransactions(transactions, { from: '2026-02-01' })).toHaveLength(3)
    expect(filterLedgerTransactions(transactions, { to: '2026-02-01' })).toHaveLength(1)
  })
})

describe('ledger filter helpers', () => {
  it('counts active filters and omits one key', () => {
    const filters = { sinkId: 'sink-1', categoryId: 'category-1' }
    expect(activeFilterCount(filters)).toBe(2)
    expect(omitLedgerFilter(filters, 'sinkId')).toEqual({ categoryId: 'category-1' })
  })

  it('builds search params without empty values', () => {
    expect(buildLedgerSearch({ sinkId: 'sink-1', accountId: undefined })).toEqual({
      sinkId: 'sink-1',
    })
  })

  it('summarizes income and spending excluding internal transfers', () => {
    const transactions = [
      ledger({ amount: -1000 }),
      ledger({ id: 'income', amount: 2500 }),
      ledger({
        id: 'transfer',
        amount: -500,
        internalTransferGroupId: 'group-1',
      }),
    ]

    expect(summarizeFilteredLedger(transactions)).toEqual({
      count: 3,
      totalIn: 2500,
      totalOut: 1000,
    })
  })
})
