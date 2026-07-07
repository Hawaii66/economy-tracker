import { describe, expect, it } from "vitest";
import {
  missedFundingMonths,
  sinkCatchUpAmount,
  sinkFundingStatus,
} from "budget-core";

describe("sink funding schedule", () => {
  it("counts one missed month when last funded in the previous calendar month", () => {
    expect(missedFundingMonths("2026-01-15", "2026-02-10")).toBe(1);
  });

  it("counts multiple missed months", () => {
    expect(missedFundingMonths("2026-01-15", "2026-03-01")).toBe(2);
  });

  it("counts zero when funded in the current calendar month", () => {
    expect(missedFundingMonths("2026-02-03", "2026-02-28")).toBe(0);
  });

  it("treats never-funded sinks as due for the current month", () => {
    expect(missedFundingMonths(null, "2026-02-10")).toBe(1);
  });

  it("suggests catch-up amount based on monthly pace and missed months", () => {
    const sink = {
      id: "sink-car",
      name: "Car repairs",
      balance: 0,
      lastFundedOn: "2026-01-10",
      sinkType: "capped_reserve" as const,
      monthlyTarget: 5_000,
      cap: 50_000,
    };

    expect(sinkCatchUpAmount(sink, "2026-03-01", 2)).toBe(10_000);
    expect(sinkFundingStatus(sink, "2026-03-01")).toMatchObject({
      missedMonths: 2,
      suggestedAmount: 10_000,
      needsFunding: true,
    });
  });

  it("does not prompt when the sink is already at its cap", () => {
    const sink = {
      id: "sink-car",
      name: "Car repairs",
      balance: 50_000,
      lastFundedOn: "2026-01-10",
      sinkType: "capped_reserve" as const,
      monthlyTarget: 5_000,
      cap: 50_000,
    };

    expect(sinkFundingStatus(sink, "2026-03-01")).toMatchObject({
      missedMonths: 2,
      suggestedAmount: 0,
      needsFunding: false,
    });
  });
});
