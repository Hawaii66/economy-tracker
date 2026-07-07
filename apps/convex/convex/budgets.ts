import { INITIAL_BUDGET_STATE } from "budget-core";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import {
  getBudgetMembership,
  requireAuthUser,
  requireBudget,
  requireBudgetMembership,
  requireUser,
} from "./lib/budget_access.js";
import {
  appendBudgetEvents,
  insertSnapshot,
  parseCachedBudgetState,
} from "./lib/event_processing.js";
import { projectBudgetState } from "./lib/state_projection.js";

const clientEventValidator = v.object({
  eventType: v.string(),
  payload: v.any(),
  v: v.optional(v.number()),
});

export const getBudgetState = query({
  args: {
    budgetId: v.id("budgets"),
    timeTravelSeq: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthUser(ctx);
    await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, userId, [
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
    events: v.array(clientEventValidator),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthUser(ctx);
    const budget = await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, userId, [
      "OWNER",
      "EDITOR",
    ]);

    return appendBudgetEvents(ctx, {
      budget,
      userId,
      events: args.events,
    });
  },
});

export const createSnapshot = mutation({
  args: {
    budgetId: v.id("budgets"),
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthUser(ctx);
    const budget = await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, userId, [
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
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthUser(ctx);

    const createdAt = new Date().toISOString();
    const budgetId = await ctx.db.insert("budgets", {
      name: args.name,
      createdById: userId,
      isBranch: false,
      parentBudgetId: null,
      branchedAtSequence: null,
      cachedStateJson: JSON.stringify(INITIAL_BUDGET_STATE),
      currentSequence: 0,
    });

    await ctx.db.insert("budgetMemberships", {
      budgetId,
      userId,
      role: "OWNER",
    });

    await insertSnapshot(ctx, budgetId, 0, INITIAL_BUDGET_STATE, createdAt);

    return { budgetId };
  },
});

export const addMember = mutation({
  args: {
    budgetId: v.id("budgets"),
    userId: v.id("users"),
    role: membershipRoleValidator,
  },
  handler: async (ctx, args) => {
    const { userId: actorUserId } = await requireAuthUser(ctx);
    await requireBudget(ctx, args.budgetId);
    await requireBudgetMembership(ctx, args.budgetId, actorUserId, [
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
  },
  handler: async (ctx, args) => {
    const { userId } = await requireAuthUser(ctx);
    const parentBudget = await requireBudget(ctx, args.parentBudgetId);
    await requireBudgetMembership(ctx, args.parentBudgetId, userId, [
      "OWNER",
      "EDITOR",
    ]);

    const branchState = parseCachedBudgetState(parentBudget.cachedStateJson);
    const createdAt = new Date().toISOString();

    const branchBudgetId = await ctx.db.insert("budgets", {
      name: args.branchName,
      createdById: userId,
      isBranch: true,
      parentBudgetId: args.parentBudgetId,
      branchedAtSequence: parentBudget.currentSequence,
      cachedStateJson: parentBudget.cachedStateJson,
      currentSequence: 0,
    });

    await ctx.db.insert("budgetMemberships", {
      budgetId: branchBudgetId,
      userId,
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
