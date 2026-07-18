"use client";

import { useGetWorkspace } from "@/features/auth/workspaces/api/use-get-workspace";
import { useCurrentMember } from "@/features/members/user-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "../sidebar-items";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetConversations } from "@/features/conversations/api/use-get-conversations";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useDmPickerModal } from "@/features/conversations/store/use-dm-picker-modal";
import { useInviteModal } from "@/features/auth/workspaces/store/use-invite-modal";
import { Button } from "@/components/ui/button";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const [_open, setOpen] = useCreateChannelModal();
  const [, setDmPickerOpen] = useDmPickerModal();
  const [, setInviteOpen] = useInviteModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { data: channels } = useGetChannels({ workspaceId });
  const { data: conversations } = useGetConversations({ workspaceId });

  if (workspaceLoading || memberLoading) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }

  const isAdmin = member.role === "admin";

  return (
    <div className="flex flex-col bg-[#5E2C5F] h-full min-w-0 overflow-y-auto">
      <WorkspaceHeader workspace={workspace} isAdmin={isAdmin} />

      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SidebarItem label="Drafts & Sent" icon={SendHorizonal} id="drafts" />
      </div>

      <WorkspaceSection
        labels="Channels"
        hint="New Channel"
        onNew={isAdmin ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            icon={HashIcon}
            label={item.name}
            id={item._id}
          />
        ))}
      </WorkspaceSection>

      <WorkspaceSection
        labels="Direct Messages"
        hint="New direct message"
        onNew={() => setDmPickerOpen(true)}
      >
        {conversations && conversations.length > 0 ? (
          conversations.map((item) => (
            <UserItem
              key={item.conversationId}
              id={item.memberId}
              label={item.name}
              image={item.image}
            />
          ))
        ) : (
          <div className="px-4 py-2 space-y-2">
            <p className="text-xs text-[#f9edffcc]">
              No direct messages yet.
            </p>
            {isAdmin ? (
              <Button
                size="sm"
                variant="transparent"
                className="h-7 px-2 text-xs text-white hover:bg-white/10"
                onClick={() => setInviteOpen(true)}
              >
                Invite people
              </Button>
            ) : (
              <p className="text-[11px] text-[#f9edff99]">
                Ask an admin to invite teammates.
              </p>
            )}
            <Button
              size="sm"
              variant="transparent"
              className="h-7 px-2 text-xs text-white hover:bg-white/10"
              onClick={() => setDmPickerOpen(true)}
            >
              Message someone
            </Button>
          </div>
        )}
      </WorkspaceSection>
    </div>
  );
};
