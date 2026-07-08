import { describe, expect, it } from "vitest";
import { INITIAL_BUDGET_STATE, replayBudgetEvents } from "budget-core";
import {
  accountAddedEvent,
  categoryCreatedEvent,
  ledgerTransactionCreatedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

describe("account balance after transactions", () => {
  it("leaves 50 SEK after adding 100 and spending 50 in a category", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
      accountAddedEvent({
        sequenceNumber: 1,
        userId: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        payload: {
          accountId: "acct-checking",
          name: "Checking",
          openingBalance: 0,
          currency: "SEK",
          genesisDate: "2026-01-01",
        },
      }),
      categoryCreatedEvent({
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-01T00:01:00.000Z",
        payload: {
          categoryId: "cat-groceries",
          name: "Groceries",
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-01T00:02:00.000Z",
        payload: {
          sinkId: "sink-groceries",
          name: "Groceries",
          color: "#5EAEFF",
          icon: "shopping-cart",
          sinkType: "capped_reserve",
          monthlyTarget: 5_000,
          cap: 20_000,
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-01T00:03:00.000Z",
        payload: {
          sinkId: "sink-salary",
          name: "Salary",
          color: "#5EAEFF",
          icon: "briefcase",
          sinkType: "capped_reserve",
          monthlyTarget: 10_000,
          cap: 50_000,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-deposit",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-02",
          amount: 10_000,
          description: "Salary",
          categoryId: null,
          sinkId: "sink-salary",
          lifestyleTagIds: [],
          eventTagIds: [],
        },
      }),
      {
        eventType: "SINK_WITHDRAWN",
        v: 1,
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:00.000Z",
        payload: {
          sinkId: "sink-salary",
          amount: 5_000,
        },
      },
      sinkFundedEvent({
        sequenceNumber: 7,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:01.000Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 5_000,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 8,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:02.000Z",
        payload: {
          ledgerTransactionId: "txn-groceries",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-03",
          amount: -5_000,
          description: "Groceries",
          categoryId: "cat-groceries",
          sinkId: "sink-groceries",
          lifestyleTagIds: [],
          eventTagIds: [],
        },
      }),
    ]);

    expect(state.accounts["acct-checking"]?.balance).toBe(5_000);
    expect(state.ledgerTransactions["txn-groceries"]?.categoryId).toBe(
      "cat-groceries",
    );
  });
});
