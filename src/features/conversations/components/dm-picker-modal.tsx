"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDmPickerModal } from "@/features/conversations/store/use-dm-picker-modal";
import { useInviteModal } from "@/features/auth/workspaces/store/use-invite-modal";
import { useGetMembers } from "@/features/members/use-get-members";
import { useCurrentMember } from "@/features/members/user-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

export const DmPickerModal = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useDmPickerModal();
  const [, setInviteOpen] = useInviteModal();
  const [query, setQuery] = useState("");

  const { data: currentMember, isLoading: currentLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: members, isLoading: membersLoading } = useGetMembers({
    workspaceId,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (members ?? [])
      .filter((member) => member._id !== currentMember?._id)
      .filter((member) =>
        q ? (member.user.name ?? "").toLowerCase().includes(q) : true,
      );
  }, [members, currentMember?._id, query]);

  const isLoading = currentLoading || membersLoading;
  const isAdmin = currentMember?.role === "admin";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>New direct message</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
          />
        </div>
        <div className="max-h-[360px] overflow-y-auto px-2 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-2 py-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {members && members.length <= 1
                  ? "No one else is in this workspace yet."
                  : "No matching people."}
              </p>
              {isAdmin ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setInviteOpen(true);
                  }}
                >
                  Invite people
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ask a workspace admin for an invite link.
                </p>
              )}
            </div>
          ) : (
            filtered.map((member) => (
              <button
                key={member._id}
                type="button"
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent text-left"
                onClick={() => {
                  setOpen(false);
                  router.push(
                    `/workspace/${workspaceId}/member/${member._id}`,
                  );
                }}
              >
                <Avatar className="size-8 rounded-md">
                  <AvatarImage src={member.user.image} className="rounded-md" />
                  <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
                    {(member.user.name ?? "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">
                  {member.user.name ?? "Member"}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
