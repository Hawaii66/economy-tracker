import type { Sink } from "./entities.ts";
import type { IsoDate } from "../common.ts";

type BalanceRecord = Record<string, { balance: number }>;

function parseIsoDate(isoDate: IsoDate): { year: number; month: number; day: number } {
  const parts = isoDate.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return { year, month, day };
}

/** Calendar months from `from` to `to` (exclusive of partial final month). */
export function calendarMonthsBetween(from: IsoDate, to: IsoDate): number {
  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);
  let months = (toDate.year - fromDate.year) * 12 + (toDate.month - fromDate.month);
  if (toDate.day < fromDate.day) {
    months -= 1;
  }
  return months;
}

export function monthsUntilTarget(targetDate: IsoDate, today: IsoDate): number {
  return Math.max(1, calendarMonthsBetween(today, targetDate));
}

export function totalAccountCash(accounts: BalanceRecord): number {
  return Object.values(accounts).reduce((sum, account) => sum + account.balance, 0);
}

export function totalSinkBalance(sinks: BalanceRecord): number {
  return Object.values(sinks).reduce((sum, sink) => sum + sink.balance, 0);
}

export function isGuardRailHealthy(accounts: BalanceRecord, sinks: BalanceRecord): boolean {
  return totalAccountCash(accounts) >= totalSinkBalance(sinks);
}

export function maxFundableAmount(accounts: BalanceRecord, sinks: BalanceRecord): number {
  return totalAccountCash(accounts) - totalSinkBalance(sinks);
}

export function assertGuardRailFundingAllowed(
  accounts: BalanceRecord,
  sinks: BalanceRecord,
  additionalFunding: number,
): void {
  const projectedSinkTotal = totalSinkBalance(sinks) + additionalFunding;
  const cash = totalAccountCash(accounts);
  if (projectedSinkTotal > cash) {
    throw new Error(
      `Sink funding exceeds available cash: virtual sinks would total ${projectedSinkTotal} but accounts hold ${cash}`,
    );
  }
}

export function assertGuardRailStateHealthy(
  accounts: BalanceRecord,
  sinks: BalanceRecord,
): void {
  if (!isGuardRailHealthy(accounts, sinks)) {
    throw new Error(
      `Virtual sink balances (${totalSinkBalance(sinks)}) exceed account cash (${totalAccountCash(accounts)})`,
    );
  }
}

export type SinkAllocationAmount = {
  sinkId: string;
  amount: number;
};

export type InsufficientSinkBalance = {
  sinkId: string;
  available: number;
  required: number;
  shortfall: number;
};

/** Whether applying allocations would leave every connected sink non-negative. */
export function findInsufficientSinkBalance(
  sinks: BalanceRecord,
  allocations: readonly SinkAllocationAmount[],
  multiplier: 1 | -1 = 1,
): InsufficientSinkBalance | null {
  const balances = new Map<string, number>(
    Object.entries(sinks).map(([sinkId, sink]) => [sinkId, sink.balance]),
  );

  for (const { sinkId, amount } of allocations) {
    const delta = multiplier * amount;
    if (delta >= 0) {
      continue;
    }

    const available = balances.get(sinkId) ?? 0;
    const required = Math.abs(delta);
    if (available < required) {
      return {
        sinkId,
        available,
        required,
        shortfall: required - available,
      };
    }

    balances.set(sinkId, available + delta);
  }

  return null;
}

export function assertSinkBalanceCoversAllocation(
  sink: { id?: string; name?: string; balance: number },
  amount: number,
  multiplier: 1 | -1 = 1,
): void {
  const delta = multiplier * amount;
  if (delta >= 0) {
    return;
  }

  const required = Math.abs(delta);
  if (sink.balance < required) {
    const label = sink.name ?? sink.id ?? "sink";
    throw new Error(
      `Insufficient sink balance for "${label}": ${sink.balance} available, ${required} required. Fund the sink before recording this expense.`,
    );
  }
}

export function sinkMonthlyPace(sink: Sink, today: IsoDate): number {
  switch (sink.sinkType) {
    case "target_date": {
      const remaining = Math.max(0, sink.targetAmount - sink.balance);
      if (remaining === 0) {
        return 0;
      }
      const months = monthsUntilTarget(sink.targetDate, today);
      return Math.ceil(remaining / months);
    }
    case "recurring_bill":
      return Math.ceil(sink.billAmount / sink.periodMonths);
    case "capped_reserve": {
      const headroom = Math.max(0, sink.cap - sink.balance);
      if (headroom === 0) {
        return 0;
      }
      return Math.min(sink.monthlyTarget, headroom);
    }
  }
}

export function guardRailFromState(state: {
  accounts: BalanceRecord;
  sinks: BalanceRecord;
}) {
  const cash = totalAccountCash(state.accounts);
  const sinkTotal = totalSinkBalance(state.sinks);
  return {
    cash,
    sinkTotal,
    headroom: cash - sinkTotal,
    healthy: cash >= sinkTotal,
  };
}

function yearMonth(isoDate: IsoDate): number {
  const { year, month } = parseIsoDate(isoDate);
  return year * 12 + month;
}

/** Calendar months since last funding that are now due (0 = funded this month). */
export function missedFundingMonths(
  lastFundedOn: IsoDate | null,
  today: IsoDate,
): number {
  const current = yearMonth(today);
  if (lastFundedOn === null) {
    return 1;
  }
  return Math.max(0, current - yearMonth(lastFundedOn));
}

export function sinkCatchUpAmount(
  sink: Sink,
  today: IsoDate,
  missedMonths: number,
): number {
  if (missedMonths <= 0) {
    return 0;
  }

  const pace = sinkMonthlyPace(sink, today);
  if (pace === 0) {
    return 0;
  }

  let amount = pace * missedMonths;

  switch (sink.sinkType) {
    case "target_date":
      amount = Math.min(amount, Math.max(0, sink.targetAmount - sink.balance));
      break;
    case "capped_reserve":
      amount = Math.min(amount, Math.max(0, sink.cap - sink.balance));
      break;
    case "recurring_bill":
      break;
  }

  return amount;
}

export type SinkFundingStatus = {
  lastFundedOn: IsoDate | null;
  missedMonths: number;
  monthlyPace: number;
  suggestedAmount: number;
  needsFunding: boolean;
};

export function sinkFundingStatus(sink: Sink, today: IsoDate): SinkFundingStatus {
  const missedMonths = missedFundingMonths(sink.lastFundedOn, today);
  const monthlyPace = sinkMonthlyPace(sink, today);
  const suggestedAmount = sinkCatchUpAmount(sink, today, missedMonths);

  return {
    lastFundedOn: sink.lastFundedOn,
    missedMonths,
    monthlyPace,
    suggestedAmount,
    needsFunding: missedMonths > 0 && suggestedAmount > 0,
  };
}

export function sinkFundingPromptLabel(missedMonths: number): string {
  if (missedMonths <= 1) {
    return "Needs funding this month";
  }
  return `Catch up ${missedMonths} months`;
}

export type DueSinkFundingEntry = {
  sinkId: string;
  amount: number;
  missedMonths: number;
  monthlyPace: number;
  suggestedAmount: number;
};

export type DueSinkFundingPlan = {
  /** Sinks that will receive funding, in emission order. */
  entries: DueSinkFundingEntry[];
  /** Due sinks that could not be funded within available headroom. */
  skipped: DueSinkFundingEntry[];
  /** Sum of suggested amounts for all due sinks. */
  totalRequested: number;
  /** Sum of amounts in `entries`. */
  totalFundable: number;
  headroom: number;
};

function dueSinkFundingEntry(sink: Sink, today: IsoDate): DueSinkFundingEntry | null {
  const status = sinkFundingStatus(sink, today);
  if (!status.needsFunding) {
    return null;
  }

  return {
    sinkId: sink.id,
    amount: status.suggestedAmount,
    missedMonths: status.missedMonths,
    monthlyPace: status.monthlyPace,
    suggestedAmount: status.suggestedAmount,
  };
}

/** Plan batch funding for due sinks, respecting guard-rail headroom and priority order. */
export function planDueSinkFunding(
  accounts: BalanceRecord,
  sinks: Record<string, Sink>,
  today: IsoDate,
): DueSinkFundingPlan {
  const headroom = maxFundableAmount(accounts, sinks);
  const dueEntries = Object.values(sinks)
    .map((sink) => dueSinkFundingEntry(sink, today))
    .filter((entry): entry is DueSinkFundingEntry => entry !== null)
    .sort((left, right) => {
      if (right.missedMonths !== left.missedMonths) {
        return right.missedMonths - left.missedMonths;
      }
      return left.sinkId.localeCompare(right.sinkId);
    });

  const totalRequested = dueEntries.reduce((sum, entry) => sum + entry.suggestedAmount, 0);
  const entries: DueSinkFundingEntry[] = [];
  const skipped: DueSinkFundingEntry[] = [];
  let remainingHeadroom = headroom;

  for (const entry of dueEntries) {
    if (entry.suggestedAmount <= remainingHeadroom) {
      entries.push(entry);
      remainingHeadroom -= entry.suggestedAmount;
    } else {
      skipped.push(entry);
    }
  }

  return {
    entries,
    skipped,
    totalRequested,
    totalFundable: entries.reduce((sum, entry) => sum + entry.amount, 0),
    headroom,
  };
}
