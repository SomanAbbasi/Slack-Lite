"use client";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"



import { Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { WorkspaceSidebar } from "./workspace-sidebar";
interface WorkspaceIdLayoutProps {
    children: React.ReactNode;

}
const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {
    return (
        <div className="h-full">
            <Toolbar />
            <div className="flex h-[calc(100vh-40px)] overflow-hidden">

                <Sidebar />
                <ResizablePanelGroup
                orientation="horizontal"
                className="min-w-0 flex-1"
                >
                    <ResizablePanel
                    defaultSize={30}
                    minSize={20}
                    className="bg-[#5E2C5F] min-w-0"
                    
                    >
                    <WorkspaceSidebar/>
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={70} minSize={40} className="min-w-0">
                        {children}


                    </ResizablePanel>

                </ResizablePanelGroup>

            </div>

        </div>
    );
}

export default WorkspaceIdLayout;