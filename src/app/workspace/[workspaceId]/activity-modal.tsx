"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ActivityModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ActivityModal = ({ open, setOpen }: ActivityModalProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const notifications = useQuery(
    api.notifications.get,
    open ? { workspaceId } : "skip",
  );
  const markRead = useMutation(api.notifications.markRead);

  const handleMarkRead = async () => {
    try {
      await markRead({ workspaceId });
      toast.success("Marked as read");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to mark as read",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Activity</DialogTitle>
          <Button variant="outline" size="sm" onClick={() => void handleMarkRead()}>
            Mark all read
          </Button>
        </DialogHeader>
        <div className="max-h-[420px] overflow-y-auto space-y-2">
          {notifications === undefined ? (
            <div className="flex justify-center py-8">
              <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No activity yet
            </p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                className={`w-full text-left rounded-lg border px-3 py-2 hover:bg-accent ${
                  notification.read ? "opacity-70" : "bg-sky-50"
                }`}
                onClick={() => {
                  setOpen(false);
                  // Navigate to workspace home; message deep-links can be expanded later
                  router.push(`/workspace/${workspaceId}`);
                }}
              >
                <p className="text-sm font-medium">
                  {notification.actorName} {notification.body}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {notification.type}
                </p>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
