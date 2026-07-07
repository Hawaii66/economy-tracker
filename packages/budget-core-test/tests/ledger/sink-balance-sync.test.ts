import { describe, expect, it } from "vitest";
import { INITIAL_BUDGET_STATE, replayBudgetEvents } from "budget-core";
import {
  accountAddedEvent,
  categoryCreatedEvent,
  incomeSlicedEvent,
  ledgerTransactionCreatedEvent,
  ledgerTransactionUpdatedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

describe("sink balance sync with ledger transactions", () => {
  it("decreases sink balance when an expense is categorized to the sink", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
        createdAt: "2026-01-01T00:01:00.000Z",
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
      sinkFundedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 10_000,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:00.000Z",
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

    expect(state.sinks["sink-groceries"]?.balance).toBe(5_000);
  });

  it("moves sink balance when sink assignment is updated", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
          sinkId: "sink-dining",
          name: "Dining",
          color: "#6BCB9A",
          icon: "utensils",
          sinkType: "capped_reserve",
          monthlyTarget: 3_000,
          cap: 15_000,
        },
      }),
      sinkFundedEvent({
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 10_000,
          ledgerTransactionId: null,
        },
      }),
      sinkFundedEvent({
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          sinkId: "sink-dining",
          amount: 5_000,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 7,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:00.000Z",
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
      ledgerTransactionUpdatedEvent({
        sequenceNumber: 8,
        userId: "user-1",
        createdAt: "2026-01-04T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-groceries",
          categoryId: "cat-groceries",
          sinkId: "sink-dining",
          lifestyleTagIds: [],
          eventTagIds: [],
        },
      }),
    ]);

    expect(state.sinks["sink-groceries"]?.balance).toBe(10_000);
    expect(state.sinks["sink-dining"]?.balance).toBe(0);
  });

  it("restores sink balance when a ledger entry is deleted", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
        createdAt: "2026-01-01T00:01:00.000Z",
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
      sinkFundedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 8_000,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-1",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-02",
          amount: -1_500,
          description: "Grocery store",
          categoryId: "cat-groceries",
          sinkId: "sink-groceries",
          lifestyleTagIds: [],
          eventTagIds: [],
        },
      }),
      {
        eventType: "LEDGER_TRANSACTION_DELETED",
        v: 1,
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:02.000Z",
        payload: {
          ledgerTransactionId: "txn-1",
        },
      },
    ]);

    expect(state.sinks["sink-groceries"]?.balance).toBe(8_000);
  });

  it("allocates income slices to sink balances", () => {
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
      sinkCreatedEvent({
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-01T00:01:00.000Z",
        payload: {
          sinkId: "sink-savings",
          name: "Savings",
          color: "#5EAEFF",
          icon: "piggy-bank",
          sinkType: "capped_reserve",
          monthlyTarget: 5_000,
          cap: 50_000,
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-01T00:02:00.000Z",
        payload: {
          sinkId: "sink-fun",
          name: "Fun",
          color: "#6BCB9A",
          icon: "sparkles",
          sinkType: "capped_reserve",
          monthlyTarget: 2_000,
          cap: 10_000,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-salary",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-02",
          amount: 10_000,
          description: "Salary",
          categoryId: null,
          sinkId: null,
          lifestyleTagIds: [],
          eventTagIds: [],
          virtualSliceParent: true,
        },
      }),
      incomeSlicedEvent({
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-salary",
          slices: [
            {
              sliceId: "slice-savings",
              amount: 7_000,
              sinkId: "sink-savings",
              categoryId: null,
              lifestyleTagIds: [],
              eventTagIds: [],
            },
            {
              sliceId: "slice-fun",
              amount: 3_000,
              sinkId: "sink-fun",
              categoryId: null,
              lifestyleTagIds: [],
              eventTagIds: [],
            },
          ],
        },
      }),
    ]);

    expect(state.sinks["sink-savings"]?.balance).toBe(7_000);
    expect(state.sinks["sink-fun"]?.balance).toBe(3_000);
  });

  it("does not adjust sink balances for internal transfers", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
      accountAddedEvent({
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-01T00:01:00.000Z",
        payload: {
          accountId: "acct-card",
          name: "Card",
          openingBalance: 0,
          currency: "SEK",
          genesisDate: "2026-01-01",
        },
      }),
      sinkCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
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
      sinkFundedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 5_000,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-out",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-03",
          amount: -2_000,
          description: "Transfer to card",
          categoryId: null,
          sinkId: null,
          lifestyleTagIds: [],
          eventTagIds: [],
          internalTransferLeg: true,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-in",
          rawTransactionId: null,
          accountId: "acct-card",
          date: "2026-01-03",
          amount: 2_000,
          description: "Transfer from checking",
          categoryId: null,
          sinkId: null,
          lifestyleTagIds: [],
          eventTagIds: [],
          internalTransferLeg: true,
        },
      }),
      {
        eventType: "INTERNAL_TRANSFER_LINKED",
        v: 1,
        sequenceNumber: 7,
        userId: "user-1",
        createdAt: "2026-01-03T00:00:02.000Z",
        payload: {
          transferGroupId: "xfer-1",
          ledgerTransactionIdA: "txn-out",
          ledgerTransactionIdB: "txn-in",
        },
      },
    ]);

    expect(state.sinks["sink-groceries"]?.balance).toBe(5_000);
  });
});
