import {
  accountAddedEvent,
  categoryCreatedEvent,
  ledgerTransactionCreatedEvent,
  sinkCreatedEvent,
  sinkFundedEvent,
} from "../../helpers/domain-event.js";

export const events = [
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
      amount: 10_000,
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
];
