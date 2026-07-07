import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  budgets: defineTable({
    name: v.string(),
    createdById: v.id("users"),

    // Branch genealogy pointers
    isBranch: v.boolean(),
    parentBudgetId: v.union(v.id("budgets"), v.null()),
    branchedAtSequence: v.union(v.number(), v.null()),

    // Fast O(1) cache: always guaranteed to be CURRENT_VERSION structured JSON
    cachedStateJson: v.string(),
    currentSequence: v.number(),
  }),

  budgetMemberships: defineTable({
    budgetId: v.id("budgets"),
    userId: v.id("users"),
    role: v.union(v.literal("OWNER"), v.literal("EDITOR"), v.literal("VIEWER")),
  })
    .index("by_budget", ["budgetId"])
    .index("by_user", ["userId"]),

  events: defineTable({
    budgetId: v.id("budgets"),
    sequenceNumber: v.number(),
    eventType: v.string(),
    payload: v.any(),
    userId: v.id("users"),
    createdAt: v.string(),
    v: v.number(),
  })
    .index("by_budget_seq", ["budgetId", "sequenceNumber"])
    .index("by_budget", ["budgetId"]),

  snapshots: defineTable({
    budgetId: v.id("budgets"),
    sequenceNumber: v.number(),
    stateDataJson: v.string(),
    createdAt: v.string(),
  }).index("by_budget_seq", ["budgetId", "sequenceNumber"]),
});
