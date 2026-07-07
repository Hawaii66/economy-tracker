import {
  accountAddedEvent,
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
  ledgerTransactionCreatedEvent({
    sequenceNumber: 2,
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
    },
  }),
];
