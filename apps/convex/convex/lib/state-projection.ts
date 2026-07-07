import {
  INITIAL_BUDGET_STATE,
  replayBudgetEvents,
  type BudgetState,
} from "budget-core";
import type { Id } from "../_generated/dataModel.js";
import type { QueryCtx } from "../_generated/server.js";
import { parseCachedBudgetState, storedEventToDomainEvent } from "./event-processing.js";

export async function projectBudgetState(
  ctx: QueryCtx,
  budgetId: Id<"budgets">,
  timeTravelSeq?: number,
): Promise<{ sequence: number; state: BudgetState }> {
  const budget = await ctx.db.get(budgetId);
  if (!budget) {
    throw new Error("Budget not found");
  }

  if (timeTravelSeq === undefined) {
    return {
      sequence: budget.currentSequence,
      state: parseCachedBudgetState(budget.cachedStateJson),
    };
  }

  if (timeTravelSeq < 0) {
    throw new Error("timeTravelSeq must be non-negative");
  }

  if (timeTravelSeq > budget.currentSequence) {
    throw new Error(
      `timeTravelSeq ${timeTravelSeq} exceeds current sequence ${budget.currentSequence}`,
    );
  }

  if (timeTravelSeq === budget.currentSequence) {
    return {
      sequence: budget.currentSequence,
      state: parseCachedBudgetState(budget.cachedStateJson),
    };
  }

  const closestSnapshot = await ctx.db
    .query("snapshots")
    .withIndex("by_budget_seq", (q) =>
      q.eq("budgetId", budgetId).lte("sequenceNumber", timeTravelSeq),
    )
    .order("desc")
    .first();

  const baseState = closestSnapshot
    ? parseCachedBudgetState(closestSnapshot.stateDataJson)
    : INITIAL_BUDGET_STATE;
  const startSeq = closestSnapshot?.sequenceNumber ?? 0;

  const deltaEvents = await ctx.db
    .query("events")
    .withIndex("by_budget_seq", (q) =>
      q
        .eq("budgetId", budgetId)
        .gt("sequenceNumber", startSeq)
        .lte("sequenceNumber", timeTravelSeq),
    )
    .order("asc")
    .collect();

  const state = replayBudgetEvents(
    baseState,
    deltaEvents.map(storedEventToDomainEvent),
  );

  return {
    sequence: timeTravelSeq,
    state,
  };
}
