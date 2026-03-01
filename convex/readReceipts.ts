import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const markRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    lastReadMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("readReceipts")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .unique();

    const data = {
      conversationId: args.conversationId,
      userId: args.userId,
      lastReadMessageId: args.lastReadMessageId,
      lastReadTime: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("readReceipts", data);
    }
  },
});
