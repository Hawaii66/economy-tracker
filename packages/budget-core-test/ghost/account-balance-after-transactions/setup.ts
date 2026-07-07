import {
  accountAddedEvent,
  categoryCreatedEvent,
  ledgerTransactionCreatedEvent,
} from "../../helpers/domain-event.js";

export const events = [
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
  ledgerTransactionCreatedEvent({
    sequenceNumber: 3,
    userId: "user-1",
    createdAt: "2026-01-02T00:00:00.000Z",
    payload: {
      ledgerTransactionId: "txn-deposit",
      rawTransactionId: null,
      accountId: "acct-checking",
      date: "2026-01-02",
      amount: 100,
      description: "Salary",
      categoryId: null,
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
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
      amount: -50,
      description: "Groceries",
      categoryId: "cat-groceries",
      sinkId: null,
      lifestyleTagIds: [],
      eventTagIds: [],
    },
  }),
];
