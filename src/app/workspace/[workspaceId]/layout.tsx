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
            <div className="flex h-[calc(100vh-40px)]">

                <Sidebar />
                <ResizablePanelGroup 
                orientation="horizontal"
                >
                    <ResizablePanel
                    defaultSize={30}
                    minSize={20}
                    className="bg-[#5E2C5F]"
                    
                    >
                    <WorkspaceSidebar/>
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel defaultSize={70} minSize={40}>
                        {children}


                    </ResizablePanel>

                </ResizablePanelGroup>

            </div>

        </div>
    );
}

export default WorkspaceIdLayout;