"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader, TriangleAlert } from "lucide-react";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/user-current-member";
import { Button } from "@/components/ui/button";

const WorkspaceIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  const channelId = channels?.[0]?._id;
  const isLoading = memberLoading || channelsLoading;

  useEffect(() => {
    if (isLoading) return;
    if (!member) return;
    if (!channelId) {
      if (!open && member.role === "admin") {
        setOpen(true);
      }
      return;
    }

    router.replace(`/workspace/${workspaceId}/channel/${channelId}`);
  }, [
    isLoading,
    member,
    channelId,
    open,
    setOpen,
    router,
    workspaceId,
  ]);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2 bg-white">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2 bg-white px-6 text-center">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          You are not a member of this workspace
        </span>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Go home
        </Button>
      </div>
    );
  }

  if (channelId) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2 bg-white">
        <Loader className="size-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Opening channel...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2 bg-white px-6 text-center">
      <TriangleAlert className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {member.role === "admin"
          ? "No channels yet. Create one to get started."
          : "No channels yet. Ask a workspace admin to create one."}
      </span>
      {member.role === "admin" && (
        <Button size="sm" onClick={() => setOpen(true)}>
          Create a channel
        </Button>
      )}
    </div>
  );
};

export default WorkspaceIdPage;
