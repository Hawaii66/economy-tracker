import { describe, expect, it } from "vitest";
import { INITIAL_BUDGET_STATE, replayBudgetEvents } from "budget-core";
import {
  accountAddedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

describe("sink guard-rail", () => {
  it("rejects funding beyond available cash", () => {
    const events = [
      accountAddedEvent({
        sequenceNumber: 1,
        userId: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        payload: {
          accountId: "acct-checking",
          name: "Checking",
          openingBalance: 10_000,
          currency: "SEK",
          genesisDate: "2026-01-01",
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          sinkId: "sink-car",
          name: "Car repairs",
          sinkType: "capped_reserve",
          monthlyTarget: 5_000,
          cap: 50_000,
        },
      }),
      sinkFundedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:00.000Z",
        payload: {
          sinkId: "sink-car",
          amount: 15_000,
          ledgerTransactionId: null,
        },
      }),
    ];

    expect(() => replayBudgetEvents(INITIAL_BUDGET_STATE, events)).toThrow(
      /exceeds available cash/,
    );
  });
});
