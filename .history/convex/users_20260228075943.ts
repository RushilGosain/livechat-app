import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Create or update a user profile from Clerk data */
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        imageUrl: args.imageUrl,
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      isOnline: true,
      lastSeen: Date.now(),
    });
  },
});

/** Mark user as offline */
export const setOffline = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: false,
        lastSeen: Date.now(),
      });
    }
  },
});

/** Get logged-in user by clerkId */
export const getMe = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/** Get all users except the caller, with optional name search */
export const searchUsers = query({
  args: {
    clerkId: v.string(),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("users").collect();
    let others = all.filter((u) => u.clerkId !== args.clerkId);
    if (args.search && args.search.trim()) {
      const term = args.search.toLowerCase();
      others = others.filter((u) => u.name.toLowerCase().includes(term));
    }
    return others;
  },
});

/** Get user by internal Convex ID */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
