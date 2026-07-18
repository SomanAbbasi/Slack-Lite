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
      enriched.push({
        ...notification,
        actorName: actorUser?.name ?? "Someone",
        actorImage: actorUser?.image,
      });
    }

    return enriched;
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
