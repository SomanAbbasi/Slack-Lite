"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useParentMessageId } from "@/features/messages/store/use-parent-message";
import { Loader } from "lucide-react";
import { formatCompactTime } from "@/lib/time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ThreadsPage = () => {
  const workspaceId = useWorkspaceId();
  const [, setParentMessageId] = useParentMessageId();
  const threads = useQuery(api.messages.getThreads, { workspaceId });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-[49px] border-b flex items-center px-4">
        <h1 className="text-lg font-semibold">Threads</h1>
      </div>
      <div className="flex-1 overflow-y-auto messages-scrollbar">
        {threads === undefined ? (
          <div className="h-full flex items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : threads.length === 0 ? (
          <div className="h-full flex items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">
              No threads yet. Reply to a message to start one.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {threads.map((thread) => (
              <button
                key={thread._id}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3"
                onClick={() => setParentMessageId(thread._id)}
              >
                <Avatar className="size-9 rounded-md shrink-0">
                  <AvatarImage src={thread.userImage} className="rounded-md" />
                  <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
                    {thread.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">
                      {thread.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCompactTime(new Date(thread._creationTime))}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">{thread.body}</p>
                  <p className="text-xs text-sky-700 mt-1">
                    {thread.threadCount}{" "}
                    {thread.threadCount === 1 ? "reply" : "replies"}
                    {thread.threadName
                      ? ` · Last reply from ${thread.threadName}`
                      : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadsPage;
