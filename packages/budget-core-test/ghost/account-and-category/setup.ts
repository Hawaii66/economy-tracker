import {
  accountAddedEvent,
  categoryCreatedEvent,
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
      categoryId: "cat-rent",
      name: "Rent",
    },
  }),
];
