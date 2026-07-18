import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import {
  deleteMessageCascade,
  getAuthUserIdOrThrow,
  getMember,
  isConversationParticipant,
} from "./lib";
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
  currentMemberId: Id<"members">,
  page: Doc<"messages">[],
) {
  const memberCache = new Map<Id<"members">, Doc<"members"> | null>();
  const userCache = new Map<Id<"users">, Doc<"users"> | null>();

  const getCachedMember = async (memberId: Id<"members">) => {
    if (memberCache.has(memberId)) {
      return memberCache.get(memberId) ?? null;
    }
    const member = await populateMember(ctx, memberId);
    memberCache.set(memberId, member);
    return member;
  };

  const getCachedUser = async (userId: Id<"users">) => {
    if (userCache.has(userId)) {
      return userCache.get(userId) ?? null;
    }
    const user = await populateUser(ctx, userId);
    userCache.set(userId, user);
    return user;
  };

  return (
    await Promise.all(
      page.map(async (message) => {
        const member = await getCachedMember(message.memberId);
        const user = member ? await getCachedUser(member.userId) : null;

        const reactions = await populateReactions(ctx, message._id);
        const thread = await populateThread(ctx, message._id);
        const image = message.image
          ? await ctx.storage.getUrl(message.image)
          : undefined;

        if (!member || !user) {
          return {
            ...message,
            image,
            member: member ?? {
              _id: message.memberId,
              _creationTime: message._creationTime,
              userId: "" as Id<"users">,
              workspaceId: message.workspaceId,
              role: "member" as const,
            },
            user: user ?? {
              _id: "" as Id<"users">,
              _creationTime: message._creationTime,
              name: "Former member",
              image: undefined,
              email: undefined,
            },
            reactions: formatReactions(reactions, currentMemberId),
            threadCount: thread.count,
            threadImage: thread.image,
            threadName: thread.name,
            threadTimestamp: thread.timestamp,
          };
        }

        return {
          ...message,
          image,
          member,
          user,
          reactions: formatReactions(reactions, currentMemberId),
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

    if (args.channelId) {
      const channel = await ctx.db.get(args.channelId);
      if (!channel || channel.workspaceId !== args.workspaceId) {
        throw new Error("Channel not found");
      }
    }

    if (conversationId) {
      const conversation = await ctx.db.get(conversationId);
      if (
        !conversation ||
        conversation.workspaceId !== args.workspaceId ||
        !isConversationParticipant(conversation, member._id)
      ) {
        throw new Error("Unauthorized");
      }
    }

    if (!args.channelId && !conversationId) {
      throw new Error("Message must belong to a channel or conversation");
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

    const mentionMatches = [...body.matchAll(/@([a-zA-Z0-9._-]+)/g)];
    if (mentionMatches.length > 0) {
      const workspaceMembers = await ctx.db
        .query("members")
        .withIndex("by_workspace_id", (q) =>
          q.eq("workspaceId", args.workspaceId),
        )
        .collect();

      for (const match of mentionMatches) {
        const mentionedName = match[1];
        if (!mentionedName) continue;

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

    await deleteMessageCascade(ctx, message);
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

    if (message.conversationId) {
      const conversation = await ctx.db.get(message.conversationId);
      if (
        !conversation ||
        !isConversationParticipant(conversation, currentMember._id)
      ) {
        return null;
      }
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
        page: await enrichMessages(ctx, member._id, results.page),
      };
    }

    if (conversationId) {
      const conversation = await ctx.db.get(conversationId);
      if (!conversation) {
        return { page: [], isDone: true, continueCursor: "" };
      }
      const member = await getMember(ctx, conversation.workspaceId, userId);
      if (!member || !isConversationParticipant(conversation, member._id)) {
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
        page: await enrichMessages(ctx, member._id, results.page),
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
      .take(100);

    const matched = [];
    const memberCache = new Map<Id<"members">, Doc<"members"> | null>();
    const userCache = new Map<Id<"users">, Doc<"users"> | null>();

    for (const message of messages) {
      if (!message.body.toLowerCase().includes(q)) continue;

      // Never expose private DM bodies to non-participants.
      if (message.conversationId) {
        const conversation = await ctx.db.get(message.conversationId);
        if (
          !conversation ||
          !isConversationParticipant(conversation, member._id)
        ) {
          continue;
        }
      }

      let messageMember = memberCache.get(message.memberId);
      if (messageMember === undefined) {
        messageMember = await populateMember(ctx, message.memberId);
        memberCache.set(message.memberId, messageMember);
      }
      if (!messageMember) continue;

      let user = userCache.get(messageMember.userId);
      if (user === undefined) {
        user = await populateUser(ctx, messageMember.userId);
        userCache.set(messageMember.userId, user);
      }
      if (!user) continue;

      matched.push({
        ...message,
        user,
        member: messageMember,
      });

      if (matched.length >= 20) break;
    }

    return matched;
  },
});

export const getThreads = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserIdOrThrow(ctx);
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) {
      return [];
    }

    const replies = await ctx.db
      .query("messages")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId),
      )
      .order("desc")
      .take(200);

    const parentIds = new Set<Id<"messages">>();
    for (const reply of replies) {
      if (reply.parentMessageId) {
        parentIds.add(reply.parentMessageId);
      }
    }

    const threads = [];
    for (const parentId of parentIds) {
      const parent = await ctx.db.get(parentId);
      if (!parent || parent.parentMessageId) continue;

      if (parent.conversationId) {
        const conversation = await ctx.db.get(parent.conversationId);
        if (
          !conversation ||
          !isConversationParticipant(conversation, member._id)
        ) {
          continue;
        }
      }

      const parentMember = await populateMember(ctx, parent.memberId);
      const parentUser = parentMember
        ? await populateUser(ctx, parentMember.userId)
        : null;
      const thread = await populateThread(ctx, parent._id);

      threads.push({
        ...parent,
        userName: parentUser?.name ?? "Former member",
        userImage: parentUser?.image,
        threadCount: thread.count,
        threadTimestamp: thread.timestamp,
        threadName: thread.name,
      });

      if (threads.length >= 40) break;
    }

    return threads.sort((a, b) => b.threadTimestamp - a.threadTimestamp);
  },
});
