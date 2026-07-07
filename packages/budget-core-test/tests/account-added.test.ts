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
          openingBalance: 1500,
          currency: "sek",
          genesisDate: "2026-01-01",
        },
      }),
    ]);

    expect(state.accounts["acct-checking"]).toEqual({
      id: "acct-checking",
      name: "Checking",
      balance: 1500,
      currency: "SEK",
      isLiquid: true,
      genesisDate: "2026-01-01",
      parserTemplateId: null,
    });
  });
});
