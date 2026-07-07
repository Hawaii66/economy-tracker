import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel.js";
import type { MutationCtx, QueryCtx } from "../_generated/server.js";

type BudgetCtx = QueryCtx | MutationCtx;

export async function requireAuthUser(ctx: BudgetCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Authentication required");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return { userId, user };
}

export async function requireBudget(ctx: BudgetCtx, budgetId: Id<"budgets">) {
  const budget = await ctx.db.get(budgetId);
  if (!budget) {
    throw new Error("Budget not found");
  }
  return budget;
}

export async function requireUser(ctx: BudgetCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function getBudgetMembership(
  ctx: BudgetCtx,
  budgetId: Id<"budgets">,
  userId: Id<"users">,
) {
  return ctx.db
    .query("budgetMemberships")
    .withIndex("by_budget", (q) => q.eq("budgetId", budgetId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();
}

export async function requireBudgetMembership(
  ctx: BudgetCtx,
  budgetId: Id<"budgets">,
  userId: Id<"users">,
  allowedRoles: Array<Doc<"budgetMemberships">["role"]>,
) {
  const membership = await ctx.db
    .query("budgetMemberships")
    .withIndex("by_budget", (q) => q.eq("budgetId", budgetId))
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!membership) {
    throw new Error("User is not a member of this budget");
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new Error("Insufficient permissions for this budget");
  }

  return membership;
}
