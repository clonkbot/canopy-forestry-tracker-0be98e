import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with roles
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    role: v.union(v.literal("fieldWorker"), v.literal("supervisor")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Tree planting entries
  entries: defineTable({
    userId: v.id("users"),
    treeCount: v.number(),
    species: v.string(),
    location: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
    verifiedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),
});
