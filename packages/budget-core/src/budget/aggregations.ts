import type { IsoDate } from "../common.ts";
import type { LedgerTransaction } from "./entities.ts";

export type LedgerDateRange = {
  from?: IsoDate;
  to?: IsoDate;
};

export type LedgerAggregationRow = {
  id: string;
  amount: number;
};

export type IncomeExpenseTotals = {
  income: number;
  expenses: number;
};

type LedgerLine = {
  accountId: string;
  date: IsoDate;
  amount: number;
  categoryId: string | null;
  sinkId: string | null;
  lifestyleTagIds: string[];
  eventTagIds: string[];
};

function isInDateRange(date: IsoDate, range?: LedgerDateRange): boolean {
  if (range?.from && date < range.from) {
    return false;
  }
  if (range?.to && date > range.to) {
    return false;
  }
  return true;
}

function isInternalTransfer(
  transaction: Pick<LedgerTransaction, "internalTransferGroupId">,
): boolean {
  return transaction.internalTransferGroupId !== null;
}

function monthKey(date: IsoDate): string {
  return date.slice(0, 7);
}

export function collectLedgerLines(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): LedgerLine[] {
  const lines: LedgerLine[] = [];

  for (const transaction of transactions) {
    if (isInternalTransfer(transaction)) {
      continue;
    }
    if (!isInDateRange(transaction.date, options)) {
      continue;
    }

    if (transaction.virtualSlices.length > 0) {
      for (const slice of transaction.virtualSlices) {
        lines.push({
          accountId: transaction.accountId,
          date: transaction.date,
          amount: slice.amount,
          categoryId: slice.categoryId,
          sinkId: slice.sinkId,
          lifestyleTagIds: slice.lifestyleTagIds,
          eventTagIds: slice.eventTagIds,
        });
      }
      continue;
    }

    lines.push({
      accountId: transaction.accountId,
      date: transaction.date,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      sinkId: transaction.sinkId,
      lifestyleTagIds: transaction.lifestyleTagIds,
      eventTagIds: transaction.eventTagIds,
    });
  }

  return lines;
}

function sumByKey(
  lines: readonly LedgerLine[],
  keyForLine: (line: LedgerLine) => string | null,
  filter?: (line: LedgerLine) => boolean,
): LedgerAggregationRow[] {
  const totals = new Map<string, number>();

  for (const line of lines) {
    if (filter && !filter(line)) {
      continue;
    }

    const key = keyForLine(line);
    if (key === null) {
      continue;
    }

    totals.set(key, (totals.get(key) ?? 0) + line.amount);
  }

  return [...totals.entries()]
    .map(([id, amount]) => ({ id, amount }))
    .sort((left, right) => Math.abs(right.amount) - Math.abs(left.amount));
}

function spendingRows(rows: LedgerAggregationRow[]): LedgerAggregationRow[] {
  return rows
    .filter((row) => row.amount < 0)
    .map((row) => ({ id: row.id, amount: Math.abs(row.amount) }));
}

export function aggregateLedgerByCategory(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): LedgerAggregationRow[] {
  const lines = collectLedgerLines(transactions, options);
  return spendingRows(sumByKey(lines, (line) => line.categoryId));
}

export function aggregateLedgerBySink(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): LedgerAggregationRow[] {
  const lines = collectLedgerLines(transactions, options);
  return spendingRows(sumByKey(lines, (line) => line.sinkId));
}

export function aggregateLedgerByTag(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): LedgerAggregationRow[] {
  const lines = collectLedgerLines(transactions, options);
  const spendingLines = lines.filter((line) => line.amount < 0);
  const totals = new Map<string, number>();

  for (const line of spendingLines) {
    const amount = Math.abs(line.amount);
    const tagIds = [...line.lifestyleTagIds, ...line.eventTagIds];

    for (const tagId of tagIds) {
      totals.set(tagId, (totals.get(tagId) ?? 0) + amount);
    }
  }

  return [...totals.entries()]
    .map(([id, amount]) => ({ id, amount }))
    .sort((left, right) => right.amount - left.amount);
}

export function aggregateLedgerByAccount(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): LedgerAggregationRow[] {
  const lines = collectLedgerLines(transactions, options);
  return sumByKey(lines, (line) => line.accountId);
}

export function aggregateLedgerByMonth(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): LedgerAggregationRow[] {
  const lines = collectLedgerLines(transactions, options);
  return sumByKey(lines, (line) => monthKey(line.date)).sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}

export function aggregateIncomeAndExpenses(
  transactions: readonly LedgerTransaction[],
  options?: LedgerDateRange,
): IncomeExpenseTotals {
  const lines = collectLedgerLines(transactions, options);
  let income = 0;
  let expenses = 0;

  for (const line of lines) {
    if (line.amount > 0) {
      income += line.amount;
    } else if (line.amount < 0) {
      expenses += Math.abs(line.amount);
    }
  }

  return { income, expenses };
}
