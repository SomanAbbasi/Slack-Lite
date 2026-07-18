import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserIdOrThrow, getMember } from "./lib";
import { Id } from "./_generated/dataModel";

export const toggle = mutation({
  args: {
    messageId: v.id("messages"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member) {
      throw new Error("Unauthorized");
    }

    const value = args.value.trim();
    if (!value || value.length > 16) {
      throw new Error("Invalid reaction");
    }

    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_id", (q) => q.eq("messageId", args.messageId))
      .filter((q) =>
        q.and(
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), value),
        ),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return existing._id as Id<"reactions"> | null;
    }

    const reactionId = await ctx.db.insert("reactions", {
      workspaceId: message.workspaceId,
      messageId: message._id,
      memberId: member._id,
      value,
    });

    if (message.memberId !== member._id) {
      const messageMember = await ctx.db.get(message.memberId);
      if (messageMember) {
        const existingNotification = await ctx.db
          .query("notifications")
          .withIndex("by_workspace_id_user_id", (q) =>
            q
              .eq("workspaceId", message.workspaceId)
              .eq("userId", messageMember.userId),
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("type"), "reaction"),
              q.eq(q.field("messageId"), message._id),
              q.eq(q.field("actorMemberId"), member._id),
            ),
          )
          .first();

        if (!existingNotification) {
          await ctx.db.insert("notifications", {
            workspaceId: message.workspaceId,
            userId: messageMember.userId,
            type: "reaction",
            messageId: message._id,
            actorMemberId: member._id,
            body: `reacted ${value} to your message`,
            read: false,
          });
        }
      }
    }

    return reactionId;
  },
});
