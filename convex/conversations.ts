import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getAuthUserIdOrThrow,
  getMember,
  isConversationParticipant,
} from "./lib";

export const createOrGet = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const currentMember = await getMember(ctx, args.workspaceId, userId);

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (args.memberId === currentMember._id) {
      throw new Error("Cannot start a direct message with yourself");
    }

    const otherMember = await ctx.db.get(args.memberId);
    if (!otherMember || otherMember.workspaceId !== args.workspaceId) {
      throw new Error("Member not found");
    }

    const memberOneId =
      currentMember._id < otherMember._id
        ? currentMember._id
        : otherMember._id;
    const memberTwoId =
      currentMember._id < otherMember._id
        ? otherMember._id
        : currentMember._id;

    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_workspace_id_member_one_id_member_two_id", (q) =>
        q
          .eq("workspaceId", args.workspaceId)
          .eq("memberOneId", memberOneId)
          .eq("memberTwoId", memberTwoId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      workspaceId: args.workspaceId,
      memberOneId,
      memberTwoId,
    });
  },
});

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const currentMember = await getMember(ctx, args.workspaceId, userId);
    if (!currentMember) {
      return [];
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .collect();

    const results = [];

    for (const conversation of conversations) {
      if (!isConversationParticipant(conversation, currentMember._id)) {
        continue;
      }

      const otherMemberId =
        conversation.memberOneId === currentMember._id
          ? conversation.memberTwoId
          : conversation.memberOneId;
      const otherMember = await ctx.db.get(otherMemberId);
      if (!otherMember) {
        continue;
      }

      const otherUser = await ctx.db.get(otherMember.userId);
      if (!otherUser) {
        continue;
      }

      const recentMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation_id", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .order("desc")
        .take(1);

      results.push({
        conversationId: conversation._id,
        memberId: otherMember._id,
        name: otherUser.name ?? "Member",
        image: otherUser.image,
        lastMessageAt:
          recentMessages[0]?._creationTime ?? conversation._creationTime,
        lastMessageBody: recentMessages[0]?.body ?? "",
      });
    }

    return results.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});
