import { describe, expect, it } from "vitest";
import {
  findInsufficientSinkBalance,
  INITIAL_BUDGET_STATE,
  replayBudgetEvents,
} from "budget-core";
import {
  accountAddedEvent,
  categoryCreatedEvent,
  incomeSlicedEvent,
  ledgerTransactionCreatedEvent,
  ledgerTransactionUpdatedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

describe("sink balance requirement on ledger expenses", () => {
  it("rejects ledger entries that would make a sink balance negative", () => {
    expect(() =>
      replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
        ledgerTransactionCreatedEvent({
          sequenceNumber: 4,
          userId: "user-1",
          createdAt: "2026-01-02T00:00:00.000Z",
          payload: {
            ledgerTransactionId: "txn-groceries",
            rawTransactionId: null,
            accountId: "acct-checking",
            date: "2026-01-02",
            amount: -5_000,
            description: "Groceries",
            categoryId: "cat-groceries",
            sinkId: "sink-groceries",
            lifestyleTagIds: [],
            eventTagIds: [],
          },
        }),
      ]),
    ).toThrow('Insufficient sink balance for "Groceries"');
  });

  it("allows expenses after the sink has been funded", () => {
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
      sinkFundedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
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

    expect(state.sinks["sink-groceries"]?.balance).toBe(0);
  });

  it("rejects expense slices that exceed sink balance", () => {
    expect(() =>
      replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
            amount: 1_000,
            ledgerTransactionId: null,
          },
        }),
        ledgerTransactionCreatedEvent({
          sequenceNumber: 4,
          userId: "user-1",
          createdAt: "2026-01-03T00:00:00.000Z",
          payload: {
            ledgerTransactionId: "txn-split",
            rawTransactionId: null,
            accountId: "acct-checking",
            date: "2026-01-03",
            amount: -2_500,
            description: "Mixed groceries",
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
          createdAt: "2026-01-03T00:00:01.000Z",
          payload: {
            ledgerTransactionId: "txn-split",
            slices: [
              {
                sliceId: "slice-1",
                amount: -1_500,
                sinkId: "sink-groceries",
                categoryId: null,
                lifestyleTagIds: [],
                eventTagIds: [],
              },
              {
                sliceId: "slice-2",
                amount: -1_000,
                sinkId: "sink-groceries",
                categoryId: null,
                lifestyleTagIds: [],
                eventTagIds: [],
              },
            ],
          },
        }),
      ]),
    ).toThrow('Insufficient sink balance for "Groceries"');
  });

  it("rejects reassignment when the new sink lacks balance", () => {
    expect(() =>
      replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
            amount: 5_000,
            ledgerTransactionId: null,
          },
        }),
        ledgerTransactionCreatedEvent({
          sequenceNumber: 6,
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
          sequenceNumber: 7,
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
      ]),
    ).toThrow('Insufficient sink balance for "Dining"');
  });

  it("allows income allocations without prior funding", () => {
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
      ledgerTransactionCreatedEvent({
        sequenceNumber: 3,
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
          sinkId: "sink-savings",
          lifestyleTagIds: [],
          eventTagIds: [],
        },
      }),
    ]);

    expect(state.sinks["sink-savings"]?.balance).toBe(10_000);
  });
});

describe("findInsufficientSinkBalance", () => {
  it("detects shortfalls across multiple slices to the same sink", () => {
    const result = findInsufficientSinkBalance(
      {
        "sink-groceries": { balance: 1_000 },
      },
      [
        { sinkId: "sink-groceries", amount: -700 },
        { sinkId: "sink-groceries", amount: -500 },
      ],
    );

    expect(result).toEqual({
      sinkId: "sink-groceries",
      available: 300,
      required: 500,
      shortfall: 200,
    });
  });
});
