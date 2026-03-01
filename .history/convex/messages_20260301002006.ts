import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Send a message */
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const msgId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      isDeleted: false,
      reactions: [],
    });

    // Update conversation's last message pointer
    await ctx.db.patch(args.conversationId, {
      lastMessageId: msgId,
      lastMessageTime: Date.now(),
    });

    return msgId;
  },
});

/** Send a message */
/** enriched with sender info */
export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return Promise.all(
      messages.map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return { ...msg, sender };
      })
    );
  },
});

/** Soft delete a message — only the sender can delete */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.senderId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.messageId, { isDeleted: true, content: "" });
  },
});

/** Toggle a reaction on a message */
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const reactions = msg.reactions ?? [];
    const existing = reactions.find((r) => r.emoji === args.emoji);

    let updated;
    if (!existing) {
      // Add new reaction group
      updated = [...reactions, { emoji: args.emoji, userIds: [args.userId] }];
    } else if (existing.userIds.includes(args.userId)) {
      // Remove user from reaction
      const newUserIds = existing.userIds.filter((id) => id !== args.userId);
      if (newUserIds.length === 0) {
        updated = reactions.filter((r) => r.emoji !== args.emoji);
      } else {
        updated = reactions.map((r) =>
          r.emoji === args.emoji ? { ...r, userIds: newUserIds } : r
        );
      }
    } else {
      // Add user to existing reaction
      updated = reactions.map((r) =>
        r.emoji === args.emoji
          ? { ...r, userIds: [...r.userIds, args.userId] }
          : r
      );
    }

    await ctx.db.patch(args.messageId, { reactions: updated });
  },
});
