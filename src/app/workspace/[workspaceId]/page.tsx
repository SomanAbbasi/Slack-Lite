"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { Loader, TriangleAlert } from "lucide-react";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/user-current-member";

const WorkspaceIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [open, setOpen] = useCreateChannelModal();
  const redirectedRef = useRef(false);

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });

  const channelId = useMemo(() => channels?.[0]?._id, [channels]);

  useEffect(() => {
    redirectedRef.current = false;
  }, [workspaceId]);

  useEffect(() => {
    if (memberLoading || channelsLoading) return;
    if (redirectedRef.current) return;

    if (channelId) {
      redirectedRef.current = true;
      router.replace(`/workspace/${workspaceId}/channel/${channelId}`);
      return;
    }

    if (!open && member?.role === "admin") {
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

  if (memberLoading || channelsLoading || channelId) {
    return (
      <div className="h-full flex-1 flex items-center justify-center flex-col gap-2 bg-white">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex items-center justify-center flex-col gap-2 bg-white">
      <TriangleAlert className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No channel found</span>
    </div>
  );
};

export default WorkspaceIdPage;
