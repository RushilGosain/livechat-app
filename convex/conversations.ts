import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Get or create a 1-on-1 DM conversation */
export const getOrCreateDM = mutation({
  args: {
    myId: v.id("users"),
    otherId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Look for existing DM between these two users
    const all = await ctx.db.query("conversations").collect();
    const existing = all.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(args.myId) &&
        c.participantIds.includes(args.otherId)
    );
    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participantIds: [args.myId, args.otherId],
      isGroup: false,
      createdBy: args.myId,
      lastMessageTime: Date.now(),
    });
  },
});

/** Create a group conversation */
export const createGroup = mutation({
  args: {
    groupName: v.string(),
    participantIds: v.array(v.id("users")),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      participantIds: args.participantIds,
      isGroup: true,
      groupName: args.groupName,
      createdBy: args.createdBy,
      lastMessageTime: Date.now(),
    });
  },
});

/** Get all conversations for a user, enriched with last message & participants */
export const getMyConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter((c) => c.participantIds.includes(args.userId));

    const enriched = await Promise.all(
      mine.map(async (conv) => {
        // Get participants
        const participants = await Promise.all(
          conv.participantIds.map((id) => ctx.db.get(id))
        );

        // Get last message
        let lastMessage = null;
        if (conv.lastMessageId) {
          lastMessage = await ctx.db.get(conv.lastMessageId);
        }

        // Count unread messages for this user
        const readReceipt = await ctx.db
          .query("readReceipts")
          .withIndex("by_user_conversation", (q) =>
            q.eq("userId", args.userId).eq("conversationId", conv._id)
          )
          .unique();

        const allMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        let unreadCount = 0;
        if (readReceipt?.lastReadTime) {
          unreadCount = allMessages.filter(
            (m) =>
              m.senderId !== args.userId &&
              m._creationTime > readReceipt.lastReadTime
          ).length;
        } else {
          unreadCount = allMessages.filter((m) => m.senderId !== args.userId).length;
        }

        return {
          ...conv,
          participants: participants.filter(Boolean),
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message time desc
    return enriched.sort(
      (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
    );
  },
});

/** Get single conversation by ID */
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return null;
    const participants = await Promise.all(
      conv.participantIds.map((id) => ctx.db.get(id))
    );
    return { ...conv, participants: participants.filter(Boolean) };
  },
});
