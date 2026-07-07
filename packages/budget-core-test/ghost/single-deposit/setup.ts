import {
  accountAddedEvent,
  ledgerTransactionCreatedEvent,
  sinkCreatedEvent,
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
      amount: 10_000,
      description: "Salary",
      categoryId: null,
      sinkId: "sink-salary",
      lifestyleTagIds: [],
      eventTagIds: [],
    },
  }),
];
