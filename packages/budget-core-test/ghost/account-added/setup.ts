import { accountAddedEvent } from "../../helpers/domain-event.js";

export const events = [
  accountAddedEvent({
    sequenceNumber: 1,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    payload: {
      accountId: "acct-checking",
      name: "Checking",
      openingBalance: 1500,
      currency: "SEK",
      genesisDate: "2026-01-01",
    },
  }),
];
