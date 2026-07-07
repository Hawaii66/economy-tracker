import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { requireBudget, requireBudgetMembership } from "./lib/budget-access.js";
import {
  appendBudgetEvents,
  insertSnapshot,
  parseCachedBudgetState,
} from "./lib/event-processing.js";
import { projectBudgetState } from "./lib/state-projection.js";

const clientEventValidator = v.object({
  eventType: v.string(),
  payload: v.any(),
  v: v.optional(v.number()),
});

export const getBudgetState = query({
  args: {
    budgetId: v.id("budgets"),
    userId: v.id("users"),
    timeTravelSeq: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, args.userId, [
      "OWNER",
      "EDITOR",
      "VIEWER",
    ]);

    return projectBudgetState(ctx, args.budgetId, args.timeTravelSeq);
  },
});

export const appendEvents = mutation({
  args: {
    budgetId: v.id("budgets"),
    userId: v.id("users"),
    events: v.array(clientEventValidator),
  },
  handler: async (ctx, args) => {
    const budget = await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, args.userId, [
      "OWNER",
      "EDITOR",
    ]);

    return appendBudgetEvents(ctx, {
      budget,
      userId: args.userId,
      events: args.events,
    });
  },
});

export const createSnapshot = mutation({
  args: {
    budgetId: v.id("budgets"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const budget = await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, args.userId, [
      "OWNER",
      "EDITOR",
    ]);

    const state = parseCachedBudgetState(budget.cachedStateJson);
    const createdAt = new Date().toISOString();
    const snapshotId = await insertSnapshot(
      ctx,
      args.budgetId,
      budget.currentSequence,
      state,
      createdAt,
    );

    return {
      snapshotId,
      sequenceNumber: budget.currentSequence,
      createdAt,
    };
  },
});

export const branchBudget = mutation({
  args: {
    parentBudgetId: v.id("budgets"),
    branchName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const parentBudget = await requireBudget(ctx, args.parentBudgetId);
    await requireBudgetMembership(ctx, args.parentBudgetId, args.userId, [
      "OWNER",
      "EDITOR",
    ]);

    const branchState = parseCachedBudgetState(parentBudget.cachedStateJson);
    const createdAt = new Date().toISOString();

    const branchBudgetId = await ctx.db.insert("budgets", {
      name: args.branchName,
      createdById: args.userId,
      isBranch: true,
      parentBudgetId: args.parentBudgetId,
      branchedAtSequence: parentBudget.currentSequence,
      cachedStateJson: parentBudget.cachedStateJson,
      currentSequence: 0,
    });

    await ctx.db.insert("budgetMemberships", {
      budgetId: branchBudgetId,
      userId: args.userId,
      role: "OWNER",
    });

    await insertSnapshot(ctx, branchBudgetId, 0, branchState, createdAt);

    return {
      budgetId: branchBudgetId,
      parentBudgetId: args.parentBudgetId,
      branchedAtSequence: parentBudget.currentSequence,
    };
  },
});
