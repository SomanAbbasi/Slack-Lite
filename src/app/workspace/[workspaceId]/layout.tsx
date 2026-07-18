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
    <div className="h-full overflow-hidden">
      <Toolbar />
      <div className="flex h-[calc(100vh-40px)] overflow-hidden">
        <Sidebar />
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-w-0 flex-1"
          autoSave="slack-lite-workspace-layout-v2"
        >
          <ResizablePanel
            id="workspace-sidebar"
            defaultSize="260px"
            minSize="200px"
            maxSize="420px"
            groupResizeBehavior="preserve-pixel-size"
            className="bg-[#5E2C5F] min-w-0"
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="workspace-main"
            minSize="400px"
            className="min-w-0"
          >
            {showPanel ? (
              <ResizablePanelGroup
                orientation="horizontal"
                autoSave="slack-lite-thread-layout-v2"
                className="h-full"
              >
                <ResizablePanel
                  id="main-content"
                  minSize={30}
                  defaultSize={60}
                  className="min-w-0"
                >
                  {children}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  id="side-panel"
                  minSize={25}
                  defaultSize={40}
                  className="min-w-0 border-l"
                >
                  {parentMessageId ? (
                    <Thread />
                  ) : profileMemberId ? (
                    <Profile memberId={profileMemberId} />
                  ) : null}
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className="h-full min-w-0">{children}</div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceIdLayout;
