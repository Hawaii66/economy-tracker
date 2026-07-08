import { describe, expect, it } from "vitest";
import {
  INITIAL_BUDGET_STATE,
  planDueSinkFunding,
  replayBudgetEvents,
  type Sink,
} from "budget-core";
import {
  accountAddedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

const today = "2026-03-01";

function cappedReserveSink(
  id: string,
  overrides: Partial<Extract<Sink, { sinkType: "capped_reserve" }>> = {},
): Sink {
  return {
    id,
    name: id,
    color: "#6BCB9A",
    icon: "wrench",
    balance: 0,
    lastFundedOn: "2026-01-10",
    sinkType: "capped_reserve",
    monthlyTarget: 5_000,
    cap: 50_000,
    ...overrides,
  };
}

describe("planDueSinkFunding", () => {
  const accounts = {
    checking: { balance: 100_000 },
  };

  it("funds all due sinks when headroom is sufficient", () => {
    const sinks = {
      "sink-a": cappedReserveSink("sink-a"),
      "sink-b": cappedReserveSink("sink-b", { monthlyTarget: 3_000 }),
    };

    const plan = planDueSinkFunding(accounts, sinks, today);

    expect(plan.totalRequested).toBe(16_000);
    expect(plan.totalFundable).toBe(16_000);
    expect(plan.entries).toHaveLength(2);
    expect(plan.skipped).toHaveLength(0);
    expect(plan.entries.map((entry) => entry.sinkId).sort()).toEqual(["sink-a", "sink-b"]);
  });

  it("funds higher-priority due sinks first when headroom cannot cover all", () => {
    const accountsWithLimitedCash = {
      checking: { balance: 10_000 },
    };
    const sinks = {
      "sink-a": cappedReserveSink("sink-a", { lastFundedOn: "2026-01-10" }),
      "sink-b": cappedReserveSink("sink-b", {
        lastFundedOn: "2025-12-10",
        monthlyTarget: 3_000,
      }),
    };

    const plan = planDueSinkFunding(accountsWithLimitedCash, sinks, today);

    expect(plan.totalRequested).toBe(19_000);
    expect(plan.totalFundable).toBe(9_000);
    expect(plan.entries).toEqual([
      expect.objectContaining({ sinkId: "sink-b", amount: 9_000, missedMonths: 3 }),
    ]);
    expect(plan.skipped).toEqual([
      expect.objectContaining({ sinkId: "sink-a", suggestedAmount: 10_000, missedMonths: 2 }),
    ]);
  });

  it("returns no fundable entries when headroom is zero", () => {
    const accountsFullyAllocated = {
      checking: { balance: 10_000 },
    };
    const sinks = {
      "sink-a": cappedReserveSink("sink-a", { balance: 10_000 }),
    };

    const plan = planDueSinkFunding(accountsFullyAllocated, sinks, today);

    expect(plan.headroom).toBe(0);
    expect(plan.totalFundable).toBe(0);
    expect(plan.entries).toHaveLength(0);
    expect(plan.skipped).toHaveLength(1);
  });
});

describe("batch SINK_FUNDED replay", () => {
  it("applies multiple due-sink funding events within guard-rail headroom", () => {
    const events = [
      accountAddedEvent({
        sequenceNumber: 1,
        userId: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        payload: {
          accountId: "acct-checking",
          name: "Checking",
          openingBalance: 100_000,
          currency: "SEK",
          genesisDate: "2026-01-01",
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          sinkId: "sink-a",
          name: "Car repairs",
          color: "#6BCB9A",
          icon: "wrench",
          sinkType: "capped_reserve",
          monthlyTarget: 5_000,
          cap: 50_000,
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          sinkId: "sink-b",
          name: "Holiday",
          color: "#5EAEFF",
          icon: "plane",
          sinkType: "capped_reserve",
          monthlyTarget: 3_000,
          cap: 30_000,
        },
      }),
      sinkFundedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-03-01T00:00:00.000Z",
        payload: {
          sinkId: "sink-a",
          amount: 10_000,
          ledgerTransactionId: null,
        },
      }),
      sinkFundedEvent({
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-03-01T00:00:00.000Z",
        payload: {
          sinkId: "sink-b",
          amount: 6_000,
          ledgerTransactionId: null,
        },
      }),
    ];

    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, events);

    expect(state.sinks["sink-a"]?.balance).toBe(10_000);
    expect(state.sinks["sink-b"]?.balance).toBe(6_000);
    expect(state.sinks["sink-a"]?.lastFundedOn).toBe("2026-03-01");
    expect(state.sinks["sink-b"]?.lastFundedOn).toBe("2026-03-01");
  });
});
