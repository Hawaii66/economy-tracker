import { describe, expect, it } from "vitest";
import {
  INITIAL_BUDGET_STATE,
  replayBudgetEvents,
} from "budget-core";
import {
  accountAddedEvent,
  ledgerTransactionCreatedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

describe("sink requirement on ledger transactions", () => {
  it("rejects categorized ledger entries without a sink", () => {
    expect(() =>
      replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
        ledgerTransactionCreatedEvent({
          sequenceNumber: 2,
          userId: "user-1",
          createdAt: "2026-01-02T00:00:00.000Z",
          payload: {
            ledgerTransactionId: "txn-groceries",
            rawTransactionId: null,
            accountId: "acct-checking",
            date: "2026-01-02",
            amount: -1_500,
            description: "Groceries",
            categoryId: "cat-groceries",
            sinkId: null,
            lifestyleTagIds: [],
            eventTagIds: [],
          },
        }),
      ]),
    ).toThrow("Transactions must be connected to a sink");
  });

  it("allows fully unassigned ledger entries for internal transfers", () => {
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
      ledgerTransactionCreatedEvent({
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-transfer",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-02",
          amount: -2_000,
          description: "Transfer",
          categoryId: null,
          sinkId: null,
          lifestyleTagIds: [],
          eventTagIds: [],
          internalTransferLeg: true,
        },
      }),
    ]);

    expect(state.ledgerTransactions["txn-transfer"]?.sinkId).toBeNull();
  });

  it("rejects fully unassigned ledger entries without an exemption", () => {
    expect(() =>
      replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
        ledgerTransactionCreatedEvent({
          sequenceNumber: 2,
          userId: "user-1",
          createdAt: "2026-01-02T00:00:00.000Z",
          payload: {
            ledgerTransactionId: "txn-unassigned",
            rawTransactionId: null,
            accountId: "acct-checking",
            date: "2026-01-02",
            amount: -500,
            description: "Coffee",
            categoryId: null,
            sinkId: null,
            lifestyleTagIds: [],
            eventTagIds: [],
          },
        }),
      ]),
    ).toThrow("Transactions must be connected to a sink");
  });

  it("allows virtual slice parents when slices provide sinks", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
      accountAddedEvent({
        sequenceNumber: 1,
        userId: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        payload: {
          accountId: "acct-checking",
          name: "Checking",
          openingBalance: 1_500,
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
        createdAt: "2026-01-01T00:02:00.000Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 1_500,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-split",
          rawTransactionId: null,
          accountId: "acct-checking",
          date: "2026-01-02",
          amount: -1_500,
          description: "Mixed groceries",
          categoryId: null,
          sinkId: null,
          lifestyleTagIds: [],
          eventTagIds: [],
          virtualSliceParent: true,
        },
      }),
      {
        eventType: "INCOME_SLICED",
        v: 1,
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-split",
          slices: [
            {
              sliceId: "slice-1",
              amount: -1_500,
              description: "Groceries",
              categoryId: null,
              sinkId: "sink-groceries",
              lifestyleTagIds: [],
              eventTagIds: [],
            },
          ],
        },
      },
    ]);

    expect(state.ledgerTransactions["txn-split"]?.virtualSlices).toHaveLength(1);
    expect(state.ledgerTransactions["txn-split"]?.virtualSlices[0]?.sinkId).toBe(
      "sink-groceries",
    );
  });

  it("requires a sink on income slices", () => {
    expect(() =>
      replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
          sequenceNumber: 3,
          userId: "user-1",
          createdAt: "2026-01-02T00:00:00.000Z",
          payload: {
            ledgerTransactionId: "txn-salary",
            rawTransactionId: null,
            accountId: "acct-checking",
            date: "2026-01-02",
            amount: 20_000,
            description: "Salary",
            categoryId: null,
            sinkId: null,
            lifestyleTagIds: [],
            eventTagIds: [],
            virtualSliceParent: true,
          },
        }),
        {
          eventType: "INCOME_SLICED",
          v: 1,
          sequenceNumber: 4,
          userId: "user-1",
          createdAt: "2026-01-02T00:00:01.000Z",
          payload: {
            ledgerTransactionId: "txn-salary",
            slices: [
              {
                sliceId: "slice-1",
                amount: 20_000,
                description: "Salary",
                categoryId: null,
                sinkId: null,
                lifestyleTagIds: [],
                eventTagIds: [],
              },
            ],
          },
        },
      ]),
    ).toThrow("Transactions must be connected to a sink");
  });
});
