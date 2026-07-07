import { findMatchingRule, type MatchableRule } from 'budget-core'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import TransactionEditPanel from '@/components/transactions/TransactionEditPanel'
import type { CategoryOption, TagOption } from '@/components/transactions/types'
import type { BudgetRawTransaction } from '@/lib/budget-types'
import { formatMoney } from '@/lib/format-money'
import { findInternalTransferCandidates } from '@/lib/internal-transfer'
import {
  buildInitialSplitRows,
  buildSaveImportedTransactionInput,
  splitRowsAreBalanced,
  type SaveImportedTransactionInput,
  type TransactionSplitRow,
} from '@/lib/transaction-split'
import { cn } from '@/lib/utils'

type ImportedTransactionsTableProps = {
  transactions: BudgetRawTransaction[]
  accountNames: Record<string, string>
  categories: CategoryOption[]
  tags: TagOption[]
  rules: readonly MatchableRule[]
  rulesById: Record<string, { name: string; keywords: string[] }>
  onSave: (transaction: BudgetRawTransaction, input: SaveImportedTransactionInput) => Promise<void>
  onSaveInternalTransfer: (
    source: BudgetRawTransaction,
    counterparty: BudgetRawTransaction,
  ) => Promise<void>
  disabled?: boolean
}

function buildSplitRowsForTransactions(
  transactions: readonly BudgetRawTransaction[],
  rules: readonly MatchableRule[],
  current: Record<string, TransactionSplitRow[]>,
): Record<string, TransactionSplitRow[]> {
  const next: Record<string, TransactionSplitRow[]> = {}

  for (const transaction of transactions) {
    next[transaction.id] =
      current[transaction.id] ?? buildInitialSplitRows(transaction, rules)
  }

  return next
}

export default function ImportedTransactionsTable({
  transactions,
  accountNames,
  categories,
  tags,
  rules,
  rulesById,
  onSave,
  onSaveInternalTransfer,
  disabled = false,
}: ImportedTransactionsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [splitRowsByTransactionId, setSplitRowsByTransactionId] = useState<
    Record<string, TransactionSplitRow[]>
  >({})
  const [internalTransferByTransactionId, setInternalTransferByTransactionId] = useState<
    Record<string, boolean>
  >({})
  const [counterpartyByTransactionId, setCounterpartyByTransactionId] = useState<
    Record<string, string>
  >({})
  const [savingTransactionId, setSavingTransactionId] = useState<string | null>(null)
  const columnCount = 5

  const reservedCounterpartyIds = new Set(Object.values(counterpartyByTransactionId))

  useEffect(() => {
    setSplitRowsByTransactionId((current) =>
      buildSplitRowsForTransactions(transactions, rules, current),
    )
  }, [transactions, rules])

  useEffect(() => {
    setExpandedIds((current) => {
      const validIds = new Set(transactions.map((transaction) => transaction.id))
      const stillExpanded = [...current].filter((id) => validIds.has(id))
      if (stillExpanded.length > 0) {
        return new Set(stillExpanded)
      }

      const first = transactions[0]
      return first ? new Set([first.id]) : new Set()
    })
  }, [transactions])

  function expandFirstTransaction(remaining: readonly BudgetRawTransaction[]) {
    const first = remaining[0]
    setExpandedIds(first ? new Set([first.id]) : new Set())
  }

  function toggleExpanded(transactionId: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(transactionId)) {
        next.delete(transactionId)
      } else {
        next.add(transactionId)
      }
      return next
    })
  }

  async function handleSave(transaction: BudgetRawTransaction) {
    const splitRows = splitRowsByTransactionId[transaction.id]
    if (!splitRows || splitRows.length === 0) {
      return
    }

    if (splitRows.length > 1 && !splitRowsAreBalanced(transaction.amount, splitRows)) {
      return
    }

    setSavingTransactionId(transaction.id)

    try {
      await onSave(transaction, buildSaveImportedTransactionInput(splitRows))
      expandFirstTransaction(transactions.filter((item) => item.id !== transaction.id))
    } finally {
      setSavingTransactionId(null)
    }
  }

  async function handleSaveInternalTransfer(transaction: BudgetRawTransaction) {
    const counterpartyId = counterpartyByTransactionId[transaction.id]
    const counterparty = transactions.find((item) => item.id === counterpartyId)
    if (!counterparty) {
      return
    }

    setSavingTransactionId(transaction.id)

    try {
      await onSaveInternalTransfer(transaction, counterparty)
      setInternalTransferByTransactionId((current) => {
        const next = { ...current }
        delete next[transaction.id]
        delete next[counterparty.id]
        return next
      })
      setCounterpartyByTransactionId((current) => {
        const next = { ...current }
        delete next[transaction.id]
        return next
      })
      expandFirstTransaction(
        transactions.filter(
          (item) => item.id !== transaction.id && item.id !== counterparty.id,
        ),
      )
    } finally {
      setSavingTransactionId(null)
    }
  }

  if (transactions.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full min-w-[40rem] table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-8" />
          <col className="w-[5.75rem]" />
          <col className="w-[7.5rem]" />
          <col />
          <col className="w-[7rem]" />
        </colgroup>
        <thead>
          <tr className="border-b border-[var(--border)] bg-[rgba(27,24,23,0.9)] text-left text-xs font-bold tracking-wide text-[var(--text-muted)] uppercase">
            <th className="px-2 py-2" aria-hidden="true" />
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Account</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const expanded = expandedIds.has(transaction.id)
            const splitRows =
              splitRowsByTransactionId[transaction.id] ??
              buildInitialSplitRows(transaction, rules)
            const matchedRule = findMatchingRule(transaction.description, rules)
            const matchedRuleMeta = matchedRule ? rulesById[matchedRule.id] : undefined
            const matchedRuleLabel = matchedRuleMeta
              ? matchedRuleMeta.keywords.join(', ') || matchedRuleMeta.name
              : null
            const isReservedCounterparty = reservedCounterpartyIds.has(transaction.id)
            const reservedByTransaction = transactions.find(
              (item) => counterpartyByTransactionId[item.id] === transaction.id,
            )
            const selectedCounterpartyId = counterpartyByTransactionId[transaction.id] ?? null
            const transferCandidates = findInternalTransferCandidates(
              transaction,
              transactions.filter((candidate) => {
                if (candidate.id === transaction.id) {
                  return false
                }

                if (candidate.id === selectedCounterpartyId) {
                  return true
                }

                return !reservedCounterpartyIds.has(candidate.id)
              }),
            )
            const isInternalTransfer = internalTransferByTransactionId[transaction.id] ?? false

            return (
              <Fragment key={transaction.id}>
                <tr
                  className={cn(
                    'border-b border-[var(--border)] transition-colors',
                    isReservedCounterparty
                      ? 'bg-[rgba(94,174,255,0.06)]'
                      : 'cursor-pointer hover:bg-[rgba(27,24,23,0.35)]',
                    expanded && 'border-b-0',
                  )}
                  onClick={() => {
                    if (!isReservedCounterparty) {
                      toggleExpanded(transaction.id)
                    }
                  }}
                  aria-expanded={expanded}
                >
                  <td className="px-2 py-2.5 align-middle">
                    {isReservedCounterparty ? (
                      <span className="inline-block size-4" aria-hidden="true" />
                    ) : expanded ? (
                      <ChevronDown className="size-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronRight className="size-4 text-[var(--text-muted)]" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-middle whitespace-nowrap text-[var(--text-muted)]">
                    {transaction.date}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle text-[var(--text-muted)]">
                    {accountNames[transaction.accountId] ?? transaction.accountId}
                  </td>
                  <td className="truncate px-3 py-2.5 align-middle text-[var(--text)]">
                    {transaction.description || '\u2014'}
                    {isReservedCounterparty && reservedByTransaction ? (
                      <span className="mt-0.5 block truncate text-xs text-[var(--accent)]">
                        Paired with {reservedByTransaction.description || 'transfer'}
                      </span>
                    ) : null}
                    {matchedRuleLabel ? (
                      <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                        Rule: {matchedRuleLabel}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2.5 text-right align-middle font-semibold tabular-nums whitespace-nowrap',
                      transaction.amount < 0 ? 'text-[#e88a8a]' : 'text-[var(--text)]',
                    )}
                  >
                    {formatMoney(transaction.amount)}
                  </td>
                </tr>
                {expanded && !isReservedCounterparty ? (
                  <tr className="border-b border-[var(--border)]">
                    <td colSpan={columnCount} className="p-0">
                      <TransactionEditPanel
                        transaction={transaction}
                        splitRows={splitRows}
                        categories={categories}
                        tags={tags}
                        rules={rules}
                        matchedRuleLabel={matchedRuleLabel}
                        transferCandidates={transferCandidates}
                        accountNames={accountNames}
                        isInternalTransfer={isInternalTransfer}
                        selectedCounterpartyId={selectedCounterpartyId}
                        disabled={disabled}
                        isSaving={savingTransactionId === transaction.id}
                        onInternalTransferChange={(enabled) => {
                          setInternalTransferByTransactionId((current) => ({
                            ...current,
                            [transaction.id]: enabled,
                          }))
                          if (!enabled) {
                            setCounterpartyByTransactionId((current) => {
                              const next = { ...current }
                              delete next[transaction.id]
                              return next
                            })
                          }
                        }}
                        onSelectCounterparty={(counterpartyId) =>
                          setCounterpartyByTransactionId((current) => ({
                            ...current,
                            [transaction.id]: counterpartyId,
                          }))
                        }
                        onSplitRowsChange={(rows) =>
                          setSplitRowsByTransactionId((current) => ({
                            ...current,
                            [transaction.id]: rows,
                          }))
                        }
                        onSave={() => void handleSave(transaction)}
                        onSaveInternalTransfer={() => void handleSaveInternalTransfer(transaction)}
                      />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
