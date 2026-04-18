

import { Button } from "@/components/ui/button"
import { useGetWorkspace } from "@/features/auth/workspaces/api/use-get-workspace"
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { Info, Search } from "lucide-react"
export const Toolbar = () => {

    const workspaceId=useWorkspaceId();
    const {data}=useGetWorkspace({id:workspaceId});

    return (
        <nav className="bg-[#481349] flex h-10 items-center gap-2 px-2">
            <div className="flex-1" />

            <div className="flex flex-1 justify-center">
                <div className="w-full min-w-[280px] max-w-md">
                    <Button
                        size="sm"
                        className="h-7 w-full justify-start bg-accent/25 px-2 hover:bg-accent/25"
                    >
                        <Search className="mr-2 size-4 text-white" />
                        <span className="text-xs text-white">Search {data?.name}</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-end">
                <Button variant="transparent" size="iconSm" aria-label="Workspace info">
                    <Info className="size-5 text-white" />
                </Button>
            </div>
        </nav>
    )
}
