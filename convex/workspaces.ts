import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const JOIN_CODE_LENGTH = 8;
const JOIN_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const MAX_WORKSPACE_NAME = 80;
const MIN_WORKSPACE_NAME = 3;

const generateCode = () => {
  const bytes = new Uint8Array(JOIN_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i += 1) {
    code += JOIN_CODE_ALPHABET[bytes[i]! % JOIN_CODE_ALPHABET.length];
  }
  return code;
};

const normalizeWorkspaceName = (name: string) => {
  const trimmed = name.trim();
  if (trimmed.length < MIN_WORKSPACE_NAME || trimmed.length > MAX_WORKSPACE_NAME) {
    throw new Error(
      `Workspace name must be between ${MIN_WORKSPACE_NAME} and ${MAX_WORKSPACE_NAME} characters.`,
    );
  }
  return trimmed;
};

const createUniqueJoinCode = async (ctx: MutationCtx) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const joinCode = generateCode();
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_join_code", (q) => q.eq("joinCode", joinCode))
      .unique();
    if (!existing) {
      return joinCode;
    }
  }
  throw new Error("Unable to generate a unique join code.");
};

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const name = normalizeWorkspaceName(args.name);
    const joinCode = await createUniqueJoinCode(ctx);

    const workspaceId = await ctx.db.insert("workspaces", {
      name,
      userId,
      joinCode,
    });

    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    const workspaces = [];
    for (const member of members) {
      const workspace = await ctx.db.get(member.workspaceId);
      if (workspace) {
        workspaces.push(workspace);
      }
    }

    return workspaces;
  },
});

export const getInfoById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    const workspace = await ctx.db.get(args.id);
    if (!workspace) {
      return null;
    }

    return {
      name: workspace.name,
      isMember: !!member,
    };
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();
    if (!member) {
      return null;
    }
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const name = normalizeWorkspaceName(args.name);
    await ctx.db.patch(args.id, { name });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const [members, channels, messages, conversations, reactions, notifications] =
      await Promise.all([
        ctx.db
          .query("members")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("channels")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("messages")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("conversations")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("reactions")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        ctx.db
          .query("notifications")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
      ]);

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    for (const message of messages) {
      if (message.image) {
        await ctx.storage.delete(message.image);
      }
      await ctx.db.delete(message._id);
    }
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }
    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }
    for (const workspaceMember of members) {
      await ctx.db.delete(workspaceMember._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const newJoinCode = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const joinCode = await createUniqueJoinCode(ctx);
    await ctx.db.patch(args.workspaceId, { joinCode });
    return args.workspaceId;
  },
});

export const join = mutation({
  args: {
    joinCode: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.joinCode !== args.joinCode.toUpperCase().trim()) {
      throw new Error("Invalid join code");
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId),
      )
      .unique();

    if (existingMember) {
      throw new Error("Already a member of this workspace");
    }

    await ctx.db.insert("members", {
      userId,
      workspaceId: workspace._id,
      role: "member",
    });

    return workspace._id;
  },
});
