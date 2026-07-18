import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserIdOrThrow, getMember } from "./lib";

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .order("desc")
      .take(50);

    const enriched = [];
    for (const notification of notifications) {
      const actor = await ctx.db.get(notification.actorMemberId);
      const actorUser = actor ? await ctx.db.get(actor.userId) : null;
      const message = await ctx.db.get(notification.messageId);
      let targetMemberId: typeof member._id | undefined;

      if (message?.conversationId) {
        const conversation = await ctx.db.get(message.conversationId);
        if (conversation) {
          targetMemberId =
            conversation.memberOneId === member._id
              ? conversation.memberTwoId
              : conversation.memberOneId;
        }
      }

      enriched.push({
        ...notification,
        actorName: actorUser?.name ?? "Someone",
        actorImage: actorUser?.image,
        channelId: message?.channelId,
        conversationId: message?.conversationId,
        parentMessageId: message?.parentMessageId ?? message?._id,
        targetMemberId,
      });
    }

    return enriched;
  },
});

export const unreadCount = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) {
      return 0;
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .collect();

    return notifications.filter((item) => !item.read).length;
  },
});

export const markRead = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) {
      throw new Error("Unauthorized");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .collect();

    for (const notification of notifications) {
      if (!notification.read) {
        await ctx.db.patch(notification._id, { read: true });
      }
    }

    return null;
  },
});
