import { mutation } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./lib";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthUserIdOrThrow(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
