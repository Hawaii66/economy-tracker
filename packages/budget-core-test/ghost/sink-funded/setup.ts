import { accountAddedEvent, sinkCreatedEvent, sinkFundedEvent } from "../../helpers/domain-event.js";

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
  sinkCreatedEvent({
    sequenceNumber: 2,
    userId: "user-1",
    createdAt: "2026-01-02T00:00:00.000Z",
    payload: {
      sinkId: "sink-car",
      name: "Car repairs",
      color: "#6BCB9A",
      icon: "wrench",
      sinkType: "capped_reserve",
      monthlyTarget: 5_000,
      cap: 50_000,
    },
  }),
  sinkFundedEvent({
    sequenceNumber: 3,
    userId: "user-1",
    createdAt: "2026-01-03T00:00:00.000Z",
    payload: {
      sinkId: "sink-car",
      amount: 20_000,
      ledgerTransactionId: null,
    },
  }),
];
