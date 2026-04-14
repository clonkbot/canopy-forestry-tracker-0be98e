import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's own entries
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("entries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get all pending entries (for supervisors)
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "supervisor") return [];

    const entries = await ctx.db
      .query("entries")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Get profiles for each entry
    const entriesWithProfiles = await Promise.all(
      entries.map(async (entry) => {
        const workerProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", entry.userId))
          .first();
        return {
          ...entry,
          workerName: workerProfile?.name || "Unknown",
        };
      })
    );

    return entriesWithProfiles;
  },
});

// Get all entries (for supervisors)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "supervisor") return [];

    const entries = await ctx.db
      .query("entries")
      .order("desc")
      .take(100);

    const entriesWithProfiles = await Promise.all(
      entries.map(async (entry) => {
        const workerProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", entry.userId))
          .first();
        return {
          ...entry,
          workerName: workerProfile?.name || "Unknown",
        };
      })
    );

    return entriesWithProfiles;
  },
});

// Create a new entry
export const create = mutation({
  args: {
    treeCount: v.number(),
    species: v.string(),
    location: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("entries", {
      userId,
      treeCount: args.treeCount,
      species: args.species,
      location: args.location,
      notes: args.notes,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Approve an entry (supervisor only)
export const approve = mutation({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "supervisor") {
      throw new Error("Not authorized");
    }

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");

    await ctx.db.patch(args.id, {
      status: "approved",
      verifiedAt: Date.now(),
      verifiedBy: userId,
    });
  },
});

// Reject an entry (supervisor only)
export const reject = mutation({
  args: {
    id: v.id("entries"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.role !== "supervisor") {
      throw new Error("Not authorized");
    }

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");

    await ctx.db.patch(args.id, {
      status: "rejected",
      verifiedAt: Date.now(),
      verifiedBy: userId,
      rejectionReason: args.reason,
    });
  },
});

// Delete an entry (own entries only, and only if pending)
export const remove = mutation({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.id);
    if (!entry) throw new Error("Entry not found");
    if (entry.userId !== userId) throw new Error("Not authorized");
    if (entry.status !== "pending") throw new Error("Cannot delete verified entries");

    await ctx.db.delete(args.id);
  },
});

// Get stats for dashboard
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    if (profile.role === "fieldWorker") {
      const entries = await ctx.db
        .query("entries")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const approved = entries.filter((e) => e.status === "approved");
      const pending = entries.filter((e) => e.status === "pending");
      const rejected = entries.filter((e) => e.status === "rejected");

      return {
        totalTrees: approved.reduce((sum, e) => sum + e.treeCount, 0),
        pendingTrees: pending.reduce((sum, e) => sum + e.treeCount, 0),
        totalEntries: entries.length,
        approvedEntries: approved.length,
        pendingEntries: pending.length,
        rejectedEntries: rejected.length,
      };
    } else {
      // Supervisor stats
      const allEntries = await ctx.db.query("entries").collect();
      const pending = allEntries.filter((e) => e.status === "pending");
      const approved = allEntries.filter((e) => e.status === "approved");

      return {
        totalTrees: approved.reduce((sum, e) => sum + e.treeCount, 0),
        pendingReviews: pending.length,
        totalEntries: allEntries.length,
        approvedEntries: approved.length,
      };
    }
  },
});
