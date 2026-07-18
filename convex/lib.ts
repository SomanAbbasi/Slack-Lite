import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
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
