"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMembers } from "@/features/members/use-get-members";
import { useGetWorkspace } from "@/features/auth/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Info, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const Toolbar = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMembers({ workspaceId });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const messageResults = useQuery(
    api.messages.search,
    open && query.trim().length > 1 ? { workspaceId, query } : "skip",
  );

  const filteredChannels = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return channels ?? [];
    return (channels ?? []).filter((channel) =>
      channel.name.toLowerCase().includes(q),
    );
  }, [channels, query]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members ?? [];
    return (members ?? []).filter((member) =>
      member.user.name?.toLowerCase().includes(q),
    );
  }, [members, query]);

  return (
    <>
      <nav className="bg-[#481349] flex h-10 items-center gap-2 px-2">
        <div className="flex-1" />
        <div className="flex flex-1 justify-center">
          <div className="w-full min-w-[280px] max-w-md">
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="h-7 w-full justify-start bg-accent/25 px-2 hover:bg-accent/25"
            >
              <Search className="mr-2 size-4 text-white" />
              <span className="text-xs text-white">Search {data?.name}</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <Button
            variant="transparent"
            size="iconSm"
            aria-label="Workspace info"
          >
            <Info className="size-5 text-white" />
          </Button>
        </div>
      </nav>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent className="p-0 overflow-hidden max-w-lg">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>Search {data?.name}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-2">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels, people, and messages..."
            />
          </div>
          <div className="max-h-[360px] overflow-y-auto px-2 pb-4 space-y-3">
            <div>
              <p className="px-2 text-xs font-semibold text-muted-foreground mb-1">
                Channels
              </p>
              {filteredChannels.length === 0 ? (
                <p className="px-2 text-sm text-muted-foreground">No channels</p>
              ) : (
                filteredChannels.map((channel) => (
                  <button
                    key={channel._id}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-sm"
                    onClick={() => {
                      setOpen(false);
                      router.push(
                        `/workspace/${workspaceId}/channel/${channel._id}`,
                      );
                    }}
                  >
                    # {channel.name}
                  </button>
                ))
              )}
            </div>
            <div>
              <p className="px-2 text-xs font-semibold text-muted-foreground mb-1">
                Members
              </p>
              {filteredMembers.length === 0 ? (
                <p className="px-2 text-sm text-muted-foreground">No members</p>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member._id}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-sm"
                    onClick={() => {
                      setOpen(false);
                      router.push(
                        `/workspace/${workspaceId}/member/${member._id}`,
                      );
                    }}
                  >
                    {member.user.name}
                  </button>
                ))
              )}
            </div>
            {!!messageResults?.length && (
              <div>
                <p className="px-2 text-xs font-semibold text-muted-foreground mb-1">
                  Messages
                </p>
                {messageResults.map((message) => (
                  <button
                    key={message._id}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-sm"
                    onClick={() => {
                      setOpen(false);
                      if (message.channelId) {
                        router.push(
                          `/workspace/${workspaceId}/channel/${message.channelId}`,
                        );
                      }
                    }}
                  >
                    <span className="font-medium">{message.user.name}: </span>
                    <span className="text-muted-foreground truncate">
                      {message.body}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
