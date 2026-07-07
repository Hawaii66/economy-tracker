import { categoryCreatedEvent } from "../../helpers/domain-event.js";

export const events = [
  categoryCreatedEvent({
    sequenceNumber: 1,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    payload: {
      categoryId: "cat-food",
      name: "Food",
    },
  }),
];
