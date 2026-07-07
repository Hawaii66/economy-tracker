import { sinkCreatedEvent } from "../../helpers/domain-event.js";

export const events = [
  sinkCreatedEvent({
    sequenceNumber: 1,
    userId: "user-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    payload: {
      sinkId: "sink-vacation",
      name: "Vacation",
      color: "#5EAEFF",
      icon: "plane",
      sinkType: "target_date",
      targetAmount: 200_000,
      targetDate: "2026-12-01",
    },
  }),
  sinkCreatedEvent({
    sequenceNumber: 2,
    userId: "user-1",
    createdAt: "2026-01-02T00:00:00.000Z",
    payload: {
      sinkId: "sink-netflix",
      name: "Netflix",
      color: "#E8B84A",
      icon: "tv",
      sinkType: "recurring_bill",
      billAmount: 1_200,
      periodMonths: 12,
    },
  }),
  sinkCreatedEvent({
    sequenceNumber: 3,
    userId: "user-1",
    createdAt: "2026-01-03T00:00:00.000Z",
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
];
