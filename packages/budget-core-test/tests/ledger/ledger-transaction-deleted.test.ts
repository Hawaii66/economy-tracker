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

describe("ledger transaction deletion", () => {
  it("removes a ledger entry, reverses balance, and leaves raw import unlinked", () => {
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
      {
        eventType: "TRANSACTIONS_IMPORTED",
        v: 1,
        sequenceNumber: 2,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          importBatchId: "batch-1",
          accountId: "acct-checking",
          transactions: [
            {
              rawTransactionId: "raw-1",
              date: "2026-01-02",
              amount: -1_500,
              description: "Grocery store",
              rawRow: { description: "Grocery store" },
            },
          ],
        },
      },
      sinkCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.500Z",
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
        createdAt: "2026-01-02T00:00:00.750Z",
        payload: {
          sinkId: "sink-groceries",
          amount: 1_500,
          ledgerTransactionId: null,
        },
      }),
      ledgerTransactionCreatedEvent({
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-1",
          rawTransactionId: "raw-1",
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
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:02.000Z",
        payload: {
          ledgerTransactionId: "txn-1",
        },
      },
    ]);

    expect(state.accounts["acct-checking"]?.balance).toBe(10_000);
    expect(state.rawTransactions["raw-1"]?.description).toBe("Grocery store");
    expect(state.ledgerTransactions["txn-1"]).toBeUndefined();
  });

  it("removes both sides of an internal transfer and restores opening balances", () => {
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
      ledgerTransactionCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-out",
          rawTransactionId: "raw-out",
          accountId: "acct-checking",
          date: "2026-01-02",
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
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-in",
          rawTransactionId: "raw-in",
          accountId: "acct-card",
          date: "2026-01-02",
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
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:02.000Z",
        payload: {
          transferGroupId: "xfer-1",
          ledgerTransactionIdA: "txn-out",
          ledgerTransactionIdB: "txn-in",
        },
      },
      {
        eventType: "LEDGER_TRANSACTION_DELETED",
        v: 1,
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:03.000Z",
        payload: {
          ledgerTransactionId: "txn-out",
        },
      },
    ]);

    expect(state.accounts["acct-checking"]?.balance).toBe(10_000);
    expect(state.accounts["acct-card"]?.balance).toBe(0);
    expect(state.ledgerTransactions["txn-out"]).toBeUndefined();
    expect(state.ledgerTransactions["txn-in"]).toBeUndefined();
    expect(state.internalTransferGroups["xfer-1"]).toBeUndefined();
  });

  it("tolerates deleting both transfer legs in one batch", () => {
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
      ledgerTransactionCreatedEvent({
        sequenceNumber: 3,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:00.000Z",
        payload: {
          ledgerTransactionId: "txn-out",
          rawTransactionId: "raw-out",
          accountId: "acct-checking",
          date: "2026-01-02",
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
        sequenceNumber: 4,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:01.000Z",
        payload: {
          ledgerTransactionId: "txn-in",
          rawTransactionId: "raw-in",
          accountId: "acct-card",
          date: "2026-01-02",
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
        sequenceNumber: 5,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:02.000Z",
        payload: {
          transferGroupId: "xfer-1",
          ledgerTransactionIdA: "txn-out",
          ledgerTransactionIdB: "txn-in",
        },
      },
      {
        eventType: "LEDGER_TRANSACTION_DELETED",
        v: 1,
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:03.000Z",
        payload: {
          ledgerTransactionId: "txn-out",
        },
      },
      {
        eventType: "LEDGER_TRANSACTION_DELETED",
        v: 1,
        sequenceNumber: 7,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:04.000Z",
        payload: {
          ledgerTransactionId: "txn-in",
        },
      },
    ]);

    expect(state.accounts["acct-checking"]?.balance).toBe(10_000);
    expect(state.accounts["acct-card"]?.balance).toBe(0);
    expect(state.ledgerTransactions["txn-out"]).toBeUndefined();
    expect(state.ledgerTransactions["txn-in"]).toBeUndefined();
  });
});
