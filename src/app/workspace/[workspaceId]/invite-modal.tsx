"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNewJoinCode } from "@/features/auth/workspaces/api/use-new-join-code";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { buildInviteLink } from "@/lib/access";
import { CopyIcon, LinkIcon, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  name: string;
  joinCode: string;
}

export const InviteModal = ({
  open,
  setOpen,
  name,
  joinCode,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useNewJoinCode();

  const inviteLink =
    typeof window !== "undefined" && workspaceId
      ? buildInviteLink(window.location.origin, workspaceId, joinCode)
      : "";

  const handleCopyLink = async () => {
    if (!inviteLink) {
      toast.error("Invite link unavailable");
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.error("Failed to copy invite link");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      toast.success("Invite code copied");
    } catch {
      toast.error("Failed to copy invite code");
    }
  };

  const handleCopyMessage = async () => {
    if (!inviteLink) {
      toast.error("Invite link unavailable");
      return;
    }
    const payload = [
      `You're invited to join ${name} on Slack-Lite.`,
      ``,
      `Open this link:`,
      inviteLink,
      ``,
      `If asked for a code, use: ${joinCode}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("Invite message copied");
    } catch {
      toast.error("Failed to copy invite message");
    }
  };

  const handleNewCode = () => {
    if (!workspaceId) return;
    mutate(
      { workspaceId },
      {
        onSuccess: () => {
          toast.success("Invite code regenerated");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people to {name}</DialogTitle>
          <DialogDescription>
            Share the invite link. The code is included automatically so
            teammates can join in one click.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4 items-center justify-center py-4">
          <p className="text-4xl font-bold tracking-widest uppercase">
            {joinCode}
          </p>
          <p className="text-xs text-muted-foreground break-all text-center px-2">
            {inviteLink || "Generating link…"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={handleCopyLink} variant="default" size="sm">
              <LinkIcon className="size-4 mr-2" />
              Copy invite link
            </Button>
            <Button onClick={handleCopyCode} variant="outline" size="sm">
              <CopyIcon className="size-4 mr-2" />
              Copy code
            </Button>
            <Button onClick={handleCopyMessage} variant="ghost" size="sm">
              Copy message
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <Button
            disabled={isPending || !workspaceId}
            onClick={handleNewCode}
            variant="outline"
          >
            New code
            <RefreshCcw className="size-4 ml-2" />
          </Button>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
