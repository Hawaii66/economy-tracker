import { sinkCreatedEvent, sinkMonthlyTargetUpdatedEvent } from "../../helpers/domain-event.js";

export const events = [
  sinkCreatedEvent({
    sequenceNumber: 1,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    payload: {
      sinkId: "sink-car",
      name: "Car repairs",
      sinkType: "capped_reserve",
      monthlyTarget: 5_000,
      cap: 50_000,
    },
  }),
  sinkMonthlyTargetUpdatedEvent({
    sequenceNumber: 2,
    userId: "user-1",
    createdAt: "2026-01-02T00:00:00.000Z",
    payload: {
      sinkId: "sink-car",
      monthlyTarget: 7_500,
    },
  }),
];
