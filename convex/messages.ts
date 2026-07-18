import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserIdOrThrow, getMember } from "./lib";
import { paginationOptsValidator } from "convex/server";

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
  return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
  return ctx.db.get(memberId);
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
  return ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();
};

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId),
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined as string | undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessage = messages[messages.length - 1]!;
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember) {
    return {
      count: 0,
      image: undefined as string | undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name ?? "",
  };
};

const formatReactions = (
  reactions: Doc<"reactions">[],
  memberId?: Id<"members">,
) => {
  const grouped = reactions.reduce(
    (acc, reaction) => {
      const existing = acc.find((item) => item.value === reaction.value);
      if (existing) {
        existing.memberIds = Array.from(
          new Set([...existing.memberIds, reaction.memberId]),
        );
        existing.count = existing.memberIds.length;
      } else {
        acc.push({
          ...reaction,
          count: 1,
          memberIds: [reaction.memberId],
        });
      }
      return acc;
    },
    [] as Array<
      Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      }
    >,
  );

  return grouped.map(({ memberIds, ...rest }) => ({
    ...rest,
    memberIds,
    isReacted: memberId ? memberIds.includes(memberId) : false,
  }));
};

async function enrichMessages(
  ctx: QueryCtx,
  userId: Id<"users">,
  page: Doc<"messages">[],
) {
  return (
    await Promise.all(
      page.map(async (message) => {
        const member = await populateMember(ctx, message.memberId);
        const user = member ? await populateUser(ctx, member.userId) : null;

        if (!member || !user) {
          return null;
        }

        const reactions = await populateReactions(ctx, message._id);
        const thread = await populateThread(ctx, message._id);
        const currentMember = await getMember(ctx, message.workspaceId, userId);
        const image = message.image
          ? await ctx.storage.getUrl(message.image)
          : undefined;

        if (!currentMember) {
          return null;
        }

        return {
          ...message,
          image,
          member,
          user,
          reactions: formatReactions(reactions, currentMember._id),
          threadCount: thread.count,
          threadImage: thread.image,
          threadName: thread.name,
          threadTimestamp: thread.timestamp,
        };
      }),
    )
  ).filter((message): message is NonNullable<typeof message> => message !== null);
}

export const create = mutation({
  args: {
    body: v.string(),
    workspaceId: v.id("workspaces"),
    image: v.optional(v.id("_storage")),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);

    if (!member) {
      throw new Error("Unauthorized");
    }

    const body = args.body.trim();
    if (!body && !args.image) {
      throw new Error("Message cannot be empty");
    }
    if (body.length > 4000) {
      throw new Error("Message is too long");
    }

    let conversationId = args.conversationId;

    if (!args.channelId && !args.conversationId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
      conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert("messages", {
      body,
      image: args.image,
      memberId: member._id,
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      conversationId,
      parentMessageId: args.parentMessageId,
    });

    if (args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (parentMessage && parentMessage.memberId !== member._id) {
        const parentMember = await ctx.db.get(parentMessage.memberId);
        if (parentMember) {
          await ctx.db.insert("notifications", {
            workspaceId: args.workspaceId,
            userId: parentMember.userId,
            type: "reply",
            messageId,
            actorMemberId: member._id,
            body: "replied to your message",
            read: false,
          });
        }
      }
    }

    const mentionMatches = body.matchAll(/@([a-zA-Z0-9._-]+)/g);
    for (const match of mentionMatches) {
      const mentionedName = match[1];
      if (!mentionedName) continue;

      const workspaceMembers = await ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) =>
          q.eq("workspaceId", args.workspaceId),
        )
        .collect();

      for (const workspaceMember of workspaceMembers) {
        if (workspaceMember._id === member._id) continue;
        const user = await ctx.db.get(workspaceMember.userId);
        if (!user?.name) continue;
        if (user.name.toLowerCase() !== mentionedName.toLowerCase()) continue;

        await ctx.db.insert("notifications", {
          workspaceId: args.workspaceId,
          userId: workspaceMember.userId,
          type: "mention",
          messageId,
          actorMemberId: member._id,
          body: "mentioned you",
          read: false,
        });
      }
    }

    return messageId;
  },
});

export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized");
    }

    const body = args.body.trim();
    if (!body) {
      throw new Error("Message cannot be empty");
    }

    await ctx.db.patch(args.id, {
      body,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthorized");
    }

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_id", (q) => q.eq("messageId", args.id))
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    const replies = await ctx.db
      .query("messages")
      .withIndex("by_parent_message_id", (q) => q.eq("parentMessageId", args.id))
      .collect();

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    if (message.image) {
      await ctx.storage.delete(message.image);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getById = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) {
      return null;
    }

    const currentMember = await getMember(ctx, message.workspaceId, userId);
    if (!currentMember) {
      return null;
    }

    const member = await populateMember(ctx, message.memberId);
    if (!member) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);
    if (!user) {
      return null;
    }

    const reactions = await populateReactions(ctx, message._id);
    const thread = await populateThread(ctx, message._id);
    const image = message.image
      ? await ctx.storage.getUrl(message.image)
      : undefined;

    return {
      ...message,
      image,
      user,
      member,
      reactions: formatReactions(reactions, currentMember._id),
      threadCount: thread.count,
      threadImage: thread.image,
      threadName: thread.name,
      threadTimestamp: thread.timestamp,
    };
  },
});

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    let conversationId = args.conversationId;

    if (!args.channelId && !args.conversationId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
      conversationId = parentMessage.conversationId;
    }

    if (args.channelId) {
      const channel = await ctx.db.get(args.channelId);
      if (!channel) {
        return { page: [], isDone: true, continueCursor: "" };
      }
      const member = await getMember(ctx, channel.workspaceId, userId);
      if (!member) {
        return { page: [], isDone: true, continueCursor: "" };
      }

      const results = await ctx.db
        .query("messages")
        .withIndex("by_channel_id_parent_message_id", (q) =>
          q
            .eq("channelId", args.channelId)
            .eq("parentMessageId", args.parentMessageId),
        )
        .order("desc")
        .paginate(args.paginationOpts);

      return {
        ...results,
        page: await enrichMessages(ctx, userId, results.page),
      };
    }

    if (conversationId) {
      const conversation = await ctx.db.get(conversationId);
      if (!conversation) {
        return { page: [], isDone: true, continueCursor: "" };
      }
      const member = await getMember(ctx, conversation.workspaceId, userId);
      if (!member) {
        return { page: [], isDone: true, continueCursor: "" };
      }

      const results = await ctx.db
        .query("messages")
        .withIndex("by_conversation_id_parent_message_id", (q) =>
          q
            .eq("conversationId", conversationId)
            .eq("parentMessageId", args.parentMessageId),
        )
        .order("desc")
        .paginate(args.paginationOpts);

      return {
        ...results,
        page: await enrichMessages(ctx, userId, results.page),
      };
    }

    return { page: [], isDone: true, continueCursor: "" };
  },
});

export const search = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) {
      return [];
    }

    const q = args.query.trim().toLowerCase();
    if (!q) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_workspace_id", (idx) =>
        idx.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(200);

    const matched = [];

    for (const message of messages) {
      if (!message.body.toLowerCase().includes(q)) continue;
      const messageMember = await populateMember(ctx, message.memberId);
      if (!messageMember) continue;
      const user = await populateUser(ctx, messageMember.userId);
      if (!user) continue;

      matched.push({
        ...message,
        user,
        member: messageMember,
      });

      if (matched.length >= 25) break;
    }

    return matched;
  },
});
