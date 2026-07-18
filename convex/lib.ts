import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { auth } from "./auth";

export const getAuthUserIdOrThrow = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await auth.getUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
};

export const getMember = async (
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) => {
  return await ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();
};

export const isConversationParticipant = (
  conversation: Doc<"conversations">,
  memberId: Id<"members">,
) => {
  return (
    conversation.memberOneId === memberId ||
    conversation.memberTwoId === memberId
  );
};

export const deleteMessageCascade = async (
  ctx: MutationCtx,
  message: Doc<"messages">,
) => {
  const reactions = await ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", message._id))
    .collect();
  for (const reaction of reactions) {
    await ctx.db.delete(reaction._id);
  }

  const replies = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", message._id),
    )
    .collect();

  for (const reply of replies) {
    await deleteMessageCascade(ctx, reply);
  }

  const notifications = await ctx.db
    .query("notifications")
    .withIndex("by_workspace_id", (q) =>
      q.eq("workspaceId", message.workspaceId),
    )
    .collect();
  for (const notification of notifications) {
    if (notification.messageId === message._id) {
      await ctx.db.delete(notification._id);
    }
  }

  if (message.image) {
    await ctx.storage.delete(message.image);
  }

  await ctx.db.delete(message._id);
};
