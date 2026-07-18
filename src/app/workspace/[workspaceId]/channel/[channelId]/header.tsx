"use client";

import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/user-current-member";

interface HeaderProps {
  title: string;
}

export const ChannelHeader = ({ title }: HeaderProps) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const { data: member } = useCurrentMember({ workspaceId });

  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();
  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success("Channel updated");
          setEditOpen(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleRemove = () => {
    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Channel removed");
          router.push(`/workspace/${workspaceId}`);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
            size="sm"
          >
            <span className="truncate"># {title}</span>
            <FaChevronDown className="size-2.5 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <div className="px-5 py-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Channel name</p>
                {member?.role === "admin" && (
                  <button
                    onClick={() => setEditOpen(true)}
                    className="text-sm text-[#1264a3] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                )}
              </div>
              <p className="text-sm"># {title}</p>
            </div>
            {member?.role === "admin" && (
              <button
                onClick={handleRemove}
                disabled={isRemovingChannel}
                className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
              >
                <TrashIcon className="size-4" />
                <p className="text-sm font-semibold">Delete channel</p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename this channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input
              value={value}
              disabled={isUpdatingChannel}
              onChange={(e) =>
                setValue(e.target.value.replace(/\s+/g, "-").toLowerCase())
              }
              required
              autoFocus
              minLength={3}
              maxLength={80}
              placeholder="e.g. plan-budget"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isUpdatingChannel}>
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isUpdatingChannel}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
