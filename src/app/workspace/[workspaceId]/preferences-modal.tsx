"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveWorkspace } from "@/features/auth/workspaces/api/use-remove-workspace";
import { useUpdateWorkspace } from "@/features/auth/workspaces/api/use-update-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PreferencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}

export const PreferencesModal = ({
  open,
  setOpen,
  initialValue,
}: PreferencesModalProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } =
    useUpdateWorkspace();
  const { mutate: removeWorkspace, isPending: isRemovingWorkspace } =
    useRemoveWorkspace();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateWorkspace(
      { id: workspaceId, name: value },
      {
        onSuccess: () => {
          toast.success("Workspace updated");
          setEditOpen(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleRemove = () => {
    removeWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success("Workspace removed");
          router.replace("/");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>

          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-left"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Workspace name</p>
                <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                  Edit
                </p>
              </div>
              <p className="text-sm">{value}</p>
            </button>

            <button
              type="button"
              disabled={isRemovingWorkspace}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600 disabled:opacity-50"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete Workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename this workspace</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEdit}>
            <Input
              value={value}
              disabled={isUpdatingWorkspace}
              onChange={(e) => setValue(e.target.value)}
              required
              autoFocus
              minLength={3}
              maxLength={80}
              placeholder="Workspace name"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isUpdatingWorkspace}>
                  Cancel
                </Button>
              </DialogClose>
              <Button disabled={isUpdatingWorkspace}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
