"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Loader, TriangleAlert } from "lucide-react";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/user-current-member";

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

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);

  useEffect(() => {
    if (memberLoading || channelsLoading) return;

    if (channelId) {
      router.replace(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && member?.role === "admin") {
      setOpen(true);
    }
  }, [
    channelId,
    memberLoading,
    channelsLoading,
    open,
    setOpen,
    router,
    workspaceId,
    member?.role,
  ]);

  if (memberLoading || channelsLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!channelId) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">No channel found</span>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default WorkspaceIdPage;
