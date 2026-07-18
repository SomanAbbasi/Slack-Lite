"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "./api/use-current-user";
import { Loader, LogOut, DoorOpen } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmModal } from "@/components/confirm-modal";

export const UserButton = () => {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as Id<"workspaces"> | undefined;
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  const member = useQuery(
    api.members.current,
    workspaceId ? { workspaceId } : "skip",
  );
  const { mutate: removeMember, isPending } = useRemoveMember();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }
  if (!data) {
    return null;
  }

  const { image, name } = data;
  const avatarFallback = (name ?? "?").charAt(0).toUpperCase();

  const handleLeave = () => {
    if (!member) return;
    removeMember(
      { id: member._id },
      {
        onSuccess: () => {
          toast.success("Left workspace");
          setConfirmOpen(false);
          router.replace("/");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="outline-none relative">
          <Avatar className="rounded-md size-10 hover:opacity-75 transition">
            <AvatarImage className="rounded-md" alt={name} src={image} />
            <AvatarFallback className="rounded-md bg-sky-500 text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="right" className="w-60">
          {member && (
            <>
              <DropdownMenuItem
                className="h-10"
                onClick={() => setConfirmOpen(true)}
              >
                <DoorOpen className="size-4 mr-2" />
                Leave workspace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => void signOut()} className="h-10">
            <LogOut className="size-4 mr-2" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={confirmOpen}
        setOpen={setConfirmOpen}
        title="Leave this workspace?"
        description="You will lose access until an admin invites you again."
        confirmLabel="Leave"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleLeave}
      />
    </>
  );
};
