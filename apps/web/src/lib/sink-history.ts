import { collectLedgerLines } from 'budget-core'
import type { BudgetLedgerTransaction } from '@/lib/budget-types'

export type SinkLedgerEntry = {
  id: string
  ledgerId: string
  date: string
  amount: number
  description: string
  accountId: string
}

export type SinkActivityItem = {
  id: string
  date: string
  kind: 'created' | 'funded' | 'withdrawn' | 'spent' | 'cap_updated' | 'target_updated'
  amount?: number
  description?: string
  ledgerId?: string
}

export type SinkActivityEvent = {
  sequenceNumber: number
  eventType: string
  payload: Record<string, unknown>
  createdAt: string
}

export function collectSinkLedgerEntries(
  transactions: readonly BudgetLedgerTransaction[],
  sinkId: string,
): SinkLedgerEntry[] {
  const entries: SinkLedgerEntry[] = []

  for (const transaction of transactions) {
    if (transaction.internalTransferGroupId) {
      continue
    }

    if (transaction.virtualSlices.length > 0) {
      for (const slice of transaction.virtualSlices) {
        if (slice.sinkId !== sinkId) {
          continue
        }

        entries.push({
          id: `${transaction.id}:${slice.id}`,
          ledgerId: transaction.id,
          date: transaction.date,
          amount: slice.amount,
          description: slice.description ?? transaction.description,
          accountId: transaction.accountId,
        })
      }
      continue
    }

    if (transaction.sinkId === sinkId) {
      entries.push({
        id: transaction.id,
        ledgerId: transaction.id,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        accountId: transaction.accountId,
      })
    }
  }

  return entries.sort((left, right) => right.date.localeCompare(left.date))
}

export function aggregateSinkSpendingByMonth(
  transactions: readonly BudgetLedgerTransaction[],
  sinkId: string,
): Array<{ id: string; amount: number }> {
  const lines = collectLedgerLines(transactions).filter(
    (line) => line.sinkId === sinkId && line.amount < 0,
  )
  const totals = new Map<string, number>()

  for (const line of lines) {
    const month = line.date.slice(0, 7)
    totals.set(month, (totals.get(month) ?? 0) + Math.abs(line.amount))
  }

  return [...totals.entries()]
    .map(([id, amount]) => ({ id, amount }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

export function totalSinkSpending(
  transactions: readonly BudgetLedgerTransaction[],
  sinkId: string,
): number {
  return collectSinkLedgerEntries(transactions, sinkId)
    .filter((entry) => entry.amount < 0)
    .reduce((sum, entry) => sum + Math.abs(entry.amount), 0)
}

function eventDate(createdAt: string): string {
  return createdAt.slice(0, 10)
}

export function buildSinkActivityTimeline(
  events: readonly SinkActivityEvent[],
  transactions: readonly BudgetLedgerTransaction[],
  sinkId: string,
): SinkActivityItem[] {
  const items: SinkActivityItem[] = []

  for (const event of events) {
    const date = eventDate(event.createdAt)
    const payload = event.payload

    switch (event.eventType) {
      case 'SINK_CREATED':
        items.push({ id: `event-${event.sequenceNumber}`, date, kind: 'created' })
        break
      case 'SINK_FUNDED':
        items.push({
          id: `event-${event.sequenceNumber}`,
          date,
          kind: 'funded',
          amount: payload.amount as number,
        })
        break
      case 'SINK_WITHDRAWN':
        items.push({
          id: `event-${event.sequenceNumber}`,
          date,
          kind: 'withdrawn',
          amount: payload.amount as number,
        })
        break
      case 'SINK_CAP_UPDATED':
        items.push({
          id: `event-${event.sequenceNumber}`,
          date,
          kind: 'cap_updated',
          amount: payload.cap as number,
        })
        break
      case 'SINK_MONTHLY_TARGET_UPDATED':
        items.push({
          id: `event-${event.sequenceNumber}`,
          date,
          kind: 'target_updated',
          amount: payload.monthlyTarget as number,
        })
        break
    }
  }

  for (const entry of collectSinkLedgerEntries(transactions, sinkId)) {
    if (entry.amount >= 0) {
      continue
    }

    items.push({
      id: entry.id,
      date: entry.date,
      kind: 'spent',
      amount: Math.abs(entry.amount),
      description: entry.description,
      ledgerId: entry.ledgerId,
    })
  }

  return items.sort((left, right) => {
    const dateCompare = right.date.localeCompare(left.date)
    if (dateCompare !== 0) {
      return dateCompare
    }
    return right.id.localeCompare(left.id)
  })
}

export function sinkActivityLabel(item: SinkActivityItem): string {
  switch (item.kind) {
    case 'created':
      return 'Sink created'
    case 'funded':
      return 'Funded'
    case 'withdrawn':
      return 'Withdrawn'
    case 'spent':
      return item.description || 'Expense'
    case 'cap_updated':
      return 'Cap updated'
    case 'target_updated':
      return 'Monthly target updated'
  }
}
