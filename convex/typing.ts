import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const TYPING_TIMEOUT_MS = 3000;

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .unique();

    if (args.isTyping) {
      if (existing) {
        await ctx.db.patch(existing._id, { updatedAt: Date.now() });
      } else {
        await ctx.db.insert("typingIndicators", {
          conversationId: args.conversationId,
          userId: args.userId,
          updatedAt: Date.now(),
        });
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    }
  },
});

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
    myUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const active = indicators.filter(
      (i) =>
        i.userId !== args.myUserId &&
        now - i.updatedAt < TYPING_TIMEOUT_MS
    );

    return Promise.all(active.map((i) => ctx.db.get(i.userId)));
  },
});
