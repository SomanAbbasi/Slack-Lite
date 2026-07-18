"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { Thread } from "@/components/thread";
import { useParentMessageId } from "@/features/messages/store/use-parent-message";
import { Profile } from "@/components/profile";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {
  const [parentMessageId] = useParentMessageId();
  const [profileMemberId] = useProfileMemberId();

  const showPanel = !!parentMessageId || !!profileMemberId;

  return (
    <div className="h-full">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)] overflow-hidden">
        <Sidebar />
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-w-0 flex-1"
          autoSave="slack-lite-workspace-layout"
        >
          <ResizablePanel
            defaultSize={20}
            minSize={12}
            className="bg-[#5E2C5F] min-w-0"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80} minSize={20} className="min-w-0">
            {showPanel ? (
              <ResizablePanelGroup
                orientation="horizontal"
                autoSave="slack-lite-thread-layout"
              >
                <ResizablePanel minSize={20} defaultSize={60}>
                  {children}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel minSize={20} defaultSize={40}>
                  {parentMessageId ? (
                    <Thread />
                  ) : profileMemberId ? (
                    <Profile memberId={profileMemberId} />
                  ) : null}
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              children
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceIdLayout;
