import { accountAddedEvent } from "../../helpers/domain-event.js";

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
  accountAddedEvent({
    sequenceNumber: 2,
    userId: "user-1",
    createdAt: "2026-01-01T00:01:00.000Z",
    payload: {
      accountId: "acct-savings",
      name: "Savings",
      openingBalance: 500_000,
      currency: "SEK",
      genesisDate: "2026-01-01",
    },
  }),
];
