import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const populateUser = (ctx: QueryCtx, id: Id<"users">) => {
  return ctx.db.get(id);
};

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return [];
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return [];
    }

    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const members = [];

    for (const item of data) {
      const user = await populateUser(ctx, item.userId);
      if (user) {
        members.push({
          ...item,
          user: {
            _id: user._id,
            name: user.name,
            image: user.image,
            email: user.email,
          },
        });
      }
    }

    return members;
  },
});

export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      return null;
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);
    if (!user) {
      return null;
    }

    return {
      ...member,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
      },
    };
  },
});

export const current = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return null;
    }

    return member;
  },
});

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { role: args.role });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db.get(args.id);
    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (member.role === "admin") {
      const admins = await ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) =>
          q.eq("workspaceId", member.workspaceId),
        )
        .collect();
      const adminCount = admins.filter((item) => item.role === "admin").length;
      if (adminCount === 1) {
        throw new Error("Cannot remove the last admin");
      }
    }

    if (currentMember._id === args.id || currentMember.role === "admin") {
      await ctx.db.delete(args.id);
      return args.id;
    }

    throw new Error("Unauthorized");
  },
});
