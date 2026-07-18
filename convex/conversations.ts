import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserIdOrThrow, getMember } from "./lib";

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
