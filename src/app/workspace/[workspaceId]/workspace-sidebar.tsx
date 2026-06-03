import { useGetWorkspace } from "@/features/auth/workspaces/api/use-get-workspace";
import { useCurrentMember } from "@/features/members/user-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { AlertTriangle, HashIcon, Loader, MessageSquareText, SendHorizonal, Sidebar } from "lucide-react";
import { WorkspaceHeader } from "./workspace-header";
import { current } from "../../../../convex/memebers";
import { SidebarItem } from "../sidebar-items";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { internalMutation } from "../../../../convex/_generated/server";
import { WorkspaceSection } from "./workspace-section";



export const WorkspaceSidebar = () => {

    const workspaceId = useWorkspaceId();
    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
    const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });

    if (workspaceLoading || memberLoading) {
        return (
            <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-white" />
            </div>
        )
    }

    if (!workspace || !member) {
        return (
            <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
                <AlertTriangle className="size-5  text-white" />
                <p className="text-white text-sm">WorkSpace not found</p>
            </div>
        )
    }
    return (
        <div className="flex flex-col bg-[#5E2C5F] h-full">
            <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"} />

            <div className="flex flex-col px-2 mt-3">

                <SidebarItem
                    label="Threads"
                    icon={MessageSquareText}
                    id="threads"
                //variant="active"

                />

                <SidebarItem
                    label="Drafts & Sent"
                    icon={SendHorizonal}
                    id="drafts"
                //variant="active"

                />

            </div>
            <WorkspaceSection

                labels="Channels"
                hint="New Channel"
                onNew={() => { }}


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




        </div>
    )
}