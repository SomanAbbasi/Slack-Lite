"use client";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Prefer an already-open channel for this workspace; otherwise first channel.
 */
export const useWorkspaceHomeHref = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { data: channels } = useGetChannels({ workspaceId });

  const channelMatch = pathname.match(/\/channel\/([^/]+)/);
  const activeChannelId = channelMatch?.[1];
  const firstChannelId = channels?.[0]?._id;

  if (
    activeChannelId &&
    channels?.some((channel) => channel._id === activeChannelId)
  ) {
    return `/workspace/${workspaceId}/channel/${activeChannelId}`;
  }

  if (firstChannelId) {
    return `/workspace/${workspaceId}/channel/${firstChannelId}`;
  }

  return `/workspace/${workspaceId}`;
};

export const useGoToWorkspaceHome = () => {
  const router = useRouter();
  const href = useWorkspaceHomeHref();

  return useCallback(() => {
    router.push(href);
  }, [router, href]);
};
