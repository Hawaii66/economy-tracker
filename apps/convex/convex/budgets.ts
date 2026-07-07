import { INITIAL_BUDGET_STATE } from "budget-core";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import {
  getBudgetMembership,
  requireBudget,
  requireBudgetMembership,
  requireUser,
} from "./lib/budget-access.js";
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

const membershipRoleValidator = v.union(
  v.literal("OWNER"),
  v.literal("EDITOR"),
  v.literal("VIEWER"),
);

export const createBudget = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.userId);

    const createdAt = new Date().toISOString();
    const budgetId = await ctx.db.insert("budgets", {
      name: args.name,
      createdById: args.userId,
      isBranch: false,
      parentBudgetId: null,
      branchedAtSequence: null,
      cachedStateJson: JSON.stringify(INITIAL_BUDGET_STATE),
      currentSequence: 0,
    });

    await ctx.db.insert("budgetMemberships", {
      budgetId,
      userId: args.userId,
      role: "OWNER",
    });

    await insertSnapshot(ctx, budgetId, 0, INITIAL_BUDGET_STATE, createdAt);

    return { budgetId };
  },
});

export const addMember = mutation({
  args: {
    budgetId: v.id("budgets"),
    actorUserId: v.id("users"),
    userId: v.id("users"),
    role: membershipRoleValidator,
  },
  handler: async (ctx, args) => {
    await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, args.actorUserId, [
      "OWNER",
    ]);
    await requireUser(ctx, args.userId);

    const existingMembership = await getBudgetMembership(
      ctx,
      args.budgetId,
      args.userId,
    );
    if (existingMembership) {
      throw new Error("User is already a member of this budget");
    }

    const membershipId = await ctx.db.insert("budgetMemberships", {
      budgetId: args.budgetId,
      userId: args.userId,
      role: args.role,
    });

    return { membershipId };
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
