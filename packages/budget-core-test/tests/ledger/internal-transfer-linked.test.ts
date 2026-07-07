import { describe, expect, it } from "vitest";
import {
  INITIAL_BUDGET_STATE,
  InternalTransferLinkedEventSchema,
  replayBudgetEvents,
} from "budget-core";
import {
  accountAddedEvent,
  ledgerTransactionCreatedEvent,
} from "../../helpers/domain-event.js";

describe("internal transfer linking", () => {
  it("links opposite ledger transactions across accounts without changing net balances", () => {
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
      InternalTransferLinkedEventSchema.parse({
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
      }),
    ]);

    expect(state.accounts["acct-checking"]?.balance).toBe(8_000);
    expect(state.accounts["acct-card"]?.balance).toBe(2_000);
    expect(state.ledgerTransactions["txn-out"]?.internalTransferGroupId).toBe("xfer-1");
    expect(state.ledgerTransactions["txn-in"]?.internalTransferGroupId).toBe("xfer-1");
    expect(state.internalTransferGroups["xfer-1"]?.ledgerTransactionIds).toEqual([
      "txn-out",
      "txn-in",
    ]);
  });

  it("unlinks an internal transfer without changing account balances", () => {
    const linkedState = replayBudgetEvents(INITIAL_BUDGET_STATE, [
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
      InternalTransferLinkedEventSchema.parse({
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
      }),
    ]);

    const state = replayBudgetEvents(linkedState, [
      {
        eventType: "INTERNAL_TRANSFER_UNLINKED",
        v: 1,
        sequenceNumber: 6,
        userId: "user-1",
        createdAt: "2026-01-02T00:00:03.000Z",
        payload: {
          transferGroupId: "xfer-1",
        },
      },
    ]);

    expect(state.accounts["acct-checking"]?.balance).toBe(8_000);
    expect(state.accounts["acct-card"]?.balance).toBe(2_000);
    expect(state.ledgerTransactions["txn-out"]?.internalTransferGroupId).toBeNull();
    expect(state.ledgerTransactions["txn-in"]?.internalTransferGroupId).toBeNull();
    expect(state.internalTransferGroups["xfer-1"]).toBeUndefined();
  });
});
