"use client";

import { UserButton } from "@/features/auth/components/user-button";
import { WorkSpaceSwitcher } from "./workspace-switcher";
import { SidebarButton } from "./sidebar-button";
import { BellIcon, Home, MessagesSquare, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState } from "react";
import { ActivityModal } from "./activity-modal";
import { useGoToWorkspaceHome } from "@/hooks/use-workspace-home";
import { toast } from "sonner";
import { useDmPickerModal } from "@/features/conversations/store/use-dm-picker-modal";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export const Sidebar = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const [activityOpen, setActivityOpen] = useState(false);
  const goHome = useGoToWorkspaceHome();
  const [, setDmPickerOpen] = useDmPickerModal();
  const unreadCount = useQuery(api.notifications.unreadCount, { workspaceId });

  return (
    <>
      <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
        <WorkSpaceSwitcher />
        <SidebarButton
          icon={Home}
          label="Home"
          isActive={
            pathname.includes(`/workspace/${workspaceId}`) &&
            !pathname.includes("/member/") &&
            !pathname.includes("/threads")
          }
          onClick={goHome}
        />
        <SidebarButton
          icon={MessagesSquare}
          label="DMs"
          isActive={pathname.includes("/member/")}
          onClick={() => setDmPickerOpen(true)}
        />
        <div className="relative">
          <SidebarButton
            icon={BellIcon}
            label="Activity"
            onClick={() => setActivityOpen(true)}
          />
          {!!unreadCount && unreadCount > 0 ? (
            <span className="absolute -top-0.5 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </div>
        <SidebarButton
          icon={MoreHorizontal}
          label="More"
          onClick={() => toast.message("More options coming soon")}
        />
        <div className="flex flex-col items-center justify-center gap-y-1 mt-auto">
          <UserButton />
        </div>
      </aside>
      <ActivityModal open={activityOpen} setOpen={setActivityOpen} />
    </>
  );
};
