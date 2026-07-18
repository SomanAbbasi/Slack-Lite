"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { WorkSpaceSwitcher } from "./workspace-switcher";
import { SidebarButton } from "./sidebar-button";
import { BellIcon, Home, MessagesSquare, MoreHorizontal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState } from "react";
import { ActivityModal } from "./activity-modal";

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [activityOpen, setActivityOpen] = useState(false);

  return (
    <>
      <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
        <WorkSpaceSwitcher />
        <SidebarButton
          icon={Home}
          label="Home"
          isActive={pathname.includes(`/workspace/${workspaceId}`)}
          onClick={() => router.push(`/workspace/${workspaceId}`)}
        />
        <SidebarButton
          icon={MessagesSquare}
          label="DMs"
          onClick={() => router.push(`/workspace/${workspaceId}`)}
        />
        <SidebarButton
          icon={BellIcon}
          label="Activity"
          onClick={() => setActivityOpen(true)}
        />
        <SidebarButton icon={MoreHorizontal} label="More" />
        <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
          <UserButton />
        </div>
      </aside>
      <ActivityModal open={activityOpen} setOpen={setActivityOpen} />
    </>
  );
};
