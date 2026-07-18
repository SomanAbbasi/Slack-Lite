"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Renderer } from "@/components/renderer";
import { Hint } from "@/components/hint";
import { Editor } from "@/components/editor";
import { formatCompactTime, formatFullTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Doc, Id } from "../../convex/_generated/dataModel";
import {
  MoreVertical,
  Pencil,
  Smile,
  Trash,
  MessageSquareText,
} from "lucide-react";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { useParentMessageId } from "@/features/messages/store/use-parent-message";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"];

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
      isReacted: boolean;
    }
  >;
  body: string;
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: number | undefined;
  isEditing: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  isCompact?: boolean;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
}

export const Message = ({
  id,
  memberId,
  authorImage,
  authorName = "Member",
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  setEditingId,
  isCompact,
  hideThreadButton,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: MessageProps) => {
  const [_, setParentMessageId] = useParentMessageId();
  const { mutate: toggleReaction } = useToggleReaction();
  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useRemoveMessage();
  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();

  const [showReactions, setShowReactions] = useState(false);
  const createdDate = new Date(createdAt);
  const avatarFallback = authorName.charAt(0).toUpperCase();

  const handleReaction = (value: string) => {
    toggleReaction(
      { messageId: id, value },
      {
        onError: (error) => toast.error(error.message),
      },
    );
    setShowReactions(false);
  };

  const handleUpdate = async ({ body: nextBody }: { body: string }) => {
    updateMessage(
      { id, body: nextBody },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success("Message updated");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleRemove = () => {
    removeMessage(
      { id },
      {
        onSuccess: () => {
          toast.success("Message deleted");
          setParentMessageId((current: Id<"messages"> | null) =>
            current === id ? null : current,
          );
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (isCompact) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
        )}
      >
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(createdDate)}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {formatCompactTime(createdDate)}
            </button>
          </Hint>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isUpdatingMessage}
                defaultValue={body}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <Renderer value={body} />
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt="Message attachment"
                  className="rounded-md max-h-[280px] object-cover mt-2"
                />
              )}
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions reactions={reactions} onChange={handleReaction} />
              {!hideThreadButton && !!threadCount && threadTimestamp ? (
                <ThreadBar
                  count={threadCount}
                  image={threadImage}
                  name={threadName}
                  timestamp={threadTimestamp}
                  onClick={() => setParentMessageId(id)}
                />
              ) : null}
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isUpdatingMessage || isRemovingMessage}
            handleEdit={() => setEditingId(id)}
            handleThread={() => setParentMessageId(id)}
            handleDelete={handleRemove}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
            showReactions={showReactions}
            setShowReactions={setShowReactions}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
        isRemovingMessage &&
          "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200",
      )}
    >
      <div className="flex items-start gap-2">
        <button>
          <Avatar>
            <AvatarImage src={authorImage} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </button>
        {isEditing ? (
          <div className="w-full h-full">
            <Editor
              onSubmit={handleUpdate}
              disabled={isUpdatingMessage}
              defaultValue={body}
              onCancel={() => setEditingId(null)}
              variant="update"
            />
          </div>
        ) : (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm">
              <button
                onClick={() => {}}
                className="font-bold text-primary hover:underline"
              >
                {authorName}
              </button>
              <span>&nbsp;&nbsp;</span>
              <Hint label={formatFullTime(createdDate)}>
                <button className="text-xs text-muted-foreground hover:underline">
                  {formatCompactTime(createdDate)}
                </button>
              </Hint>
            </div>
            <Renderer value={body} />
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt="Message attachment"
                className="rounded-md max-h-[280px] object-cover mt-2"
              />
            )}
            {updatedAt ? (
              <span className="text-xs text-muted-foreground">(edited)</span>
            ) : null}
            <Reactions reactions={reactions} onChange={handleReaction} />
            {!hideThreadButton && !!threadCount && threadTimestamp ? (
              <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => setParentMessageId(id)}
              />
            ) : null}
          </div>
        )}
      </div>
      {!isEditing && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={isUpdatingMessage || isRemovingMessage}
          handleEdit={() => setEditingId(id)}
          handleThread={() => setParentMessageId(id)}
          handleDelete={handleRemove}
          handleReaction={handleReaction}
          hideThreadButton={hideThreadButton}
          showReactions={showReactions}
          setShowReactions={setShowReactions}
        />
      )}
    </div>
  );
};

const Reactions = ({
  reactions,
  onChange,
}: {
  reactions: MessageProps["reactions"];
  onChange: (value: string) => void;
}) => {
  if (reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap my-1 gap-1">
      {reactions.map((reaction) => (
        <button
          key={reaction._id}
          onClick={() => onChange(reaction.value)}
          className={cn(
            "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-sm flex items-center gap-x-1",
            reaction.isReacted && "bg-blue-100/70 border-blue-500 text-blue-500",
          )}
        >
          {reaction.value}
          <span
            className={cn(
              "text-xs font-semibold text-muted-foreground",
              reaction.isReacted && "text-blue-500",
            )}
          >
            {reaction.count}
          </span>
        </button>
      ))}
    </div>
  );
};

const ThreadBar = ({
  count,
  image,
  name = "Member",
  timestamp,
  onClick,
}: {
  count: number;
  image?: string;
  name?: string;
  timestamp: number;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md hover:bg-white border border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image} />
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-xs text-sky-700 hover:underline font-bold truncate">
          {count} {count > 1 ? "replies" : "reply"}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden">
          Last reply {formatCompactTime(new Date(timestamp))}
        </span>
        <span className="text-xs text-muted-foreground truncate hidden group-hover/thread-bar:block">
          View thread
        </span>
      </div>
    </button>
  );
};

const Toolbar = ({
  isAuthor,
  isPending,
  handleEdit,
  handleThread,
  handleDelete,
  handleReaction,
  hideThreadButton,
  showReactions,
  setShowReactions,
}: {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton?: boolean;
  showReactions: boolean;
  setShowReactions: (value: boolean) => void;
}) => {
  return (
    <div className="opacity-0 group-hover:opacity-100 transition absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="iconSm" disabled={isPending}>
              <Smile className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="flex gap-1 p-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-lg hover:scale-110 transition"
                  onClick={() => handleReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              variant="ghost"
              size="iconSm"
              disabled={isPending}
              onClick={handleThread}
            >
              <MessageSquareText className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit message">
              <Button
                variant="ghost"
                size="iconSm"
                disabled={isPending}
                onClick={handleEdit}
              >
                <Pencil className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete message">
              <Button
                variant="ghost"
                size="iconSm"
                disabled={isPending}
                onClick={handleDelete}
              >
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        )}
        <Button variant="ghost" size="iconSm" disabled>
          <MoreVertical className="size-4" />
        </Button>
      </div>
    </div>
  );
};
