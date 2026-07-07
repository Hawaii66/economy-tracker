import { describe, expect, it } from "vitest";
import {
  INITIAL_BUDGET_STATE,
  replayBudgetEvents,
} from "budget-core";
import {
  accountAddedEvent,
  ledgerTransactionCreatedEvent,
  sinkCreatedEvent,
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
        },
      }),
    ]);

    expect(state.ledgerTransactions["txn-transfer"]?.sinkId).toBeNull();
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
