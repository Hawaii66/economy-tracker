import { describe, expect, it } from "vitest";
import {
  INITIAL_BUDGET_STATE,
  replayBudgetEvents,
} from "budget-core";
import { accountAddedEvent } from "../helpers/domain-event.js";

describe("account added", () => {
  it("adds an account when replaying an ACCOUNT_ADDED event", () => {
    const state = replayBudgetEvents(INITIAL_BUDGET_STATE, [
      accountAddedEvent({
        sequenceNumber: 1,
        userId: "user-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        payload: {
          accountId: "acct-checking",
          name: "Checking",
          openingBalance: 150_000,
          currency: "sek",
          genesisDate: "2026-01-01",
        },
      }),
    ]);

    expect(state.accounts["acct-checking"]).toEqual({
      id: "acct-checking",
      name: "Checking",
      description: "",
      color: "#5EAEFF",
      icon: "wallet",
      balance: 150_000,
      currency: "SEK",
      genesisDate: "2026-01-01",
      parserTemplateId: null,
    });
  });
});
