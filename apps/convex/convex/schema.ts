import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  budgets: defineTable({
    userId: v.string(),
    name: v.string(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
});
