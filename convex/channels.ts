import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";
import { deleteMessageCascade } from "./lib";

const MIN_CHANNEL_NAME = 3;
const MAX_CHANNEL_NAME = 80;

const normalizeChannelName = (name: string) => {
  const parsedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (
    parsedName.length < MIN_CHANNEL_NAME ||
    parsedName.length > MAX_CHANNEL_NAME
  ) {
    throw new Error(
      `Channel name must be between ${MIN_CHANNEL_NAME} and ${MAX_CHANNEL_NAME} characters.`,
    );
  }

  return parsedName;
};

export const create = mutation({
  args: {
    name: v.string(),
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
      throw new Error("Forbidden");
    }

    const name = normalizeChannelName(args.name);

    const existing = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", name),
      )
      .unique();

    if (existing) {
      throw new Error("A channel with this name already exists");
    }

    const channelId = await ctx.db.insert("channels", {
      name,
      workspaceId: args.workspaceId,
    });

    return channelId;
  },
});

export const getById = query({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }

    const channel = await ctx.db.get(args.id);
    if (!channel) {
      return null;
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      return null;
    }

    return channel;
  },
});

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

    return await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()
      .then((channels) =>
        channels.sort((a, b) => a.name.localeCompare(b.name)),
      );
  },
});

export const update = mutation({
  args: {
    id: v.id("channels"),
    name: v.optional(v.string()),
    topic: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const channel = await ctx.db.get(args.id);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Forbidden");
    }

    const patch: {
      name?: string;
      topic?: string;
      description?: string;
    } = {};

    if (args.name !== undefined) {
      const name = normalizeChannelName(args.name);
      const existing = await ctx.db
        .query("channels")
        .withIndex("by_workspace_id_name", (q) =>
          q.eq("workspaceId", channel.workspaceId).eq("name", name),
        )
        .unique();

      if (existing && existing._id !== args.id) {
        throw new Error("A channel with this name already exists");
      }
      patch.name = name;
    }

    if (args.topic !== undefined) {
      const topic = args.topic.trim();
      if (topic.length > 250) {
        throw new Error("Topic must be 250 characters or fewer");
      }
      patch.topic = topic;
    }

    if (args.description !== undefined) {
      const description = args.description.trim();
      if (description.length > 1000) {
        throw new Error("Description must be 1000 characters or fewer");
      }
      patch.description = description;
    }

    await ctx.db.patch(args.id, patch);
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const channel = await ctx.db.get(args.id);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId),
      )
      .unique();

    if (!member || member.role !== "admin") {
      throw new Error("Forbidden");
    }

    if (channel.name === "general") {
      throw new Error("Cannot delete the general channel");
    }

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", channel.workspaceId),
      )
      .collect();

    if (channels.length <= 1) {
      throw new Error("Cannot delete the last channel in a workspace");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
      .collect();

    for (const message of messages) {
      await deleteMessageCascade(ctx, message);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
