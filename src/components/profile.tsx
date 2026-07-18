"use client";

import { Button } from "@/components/ui/button";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";
import { AlertTriangle, ChevronDownIcon, Loader, MailIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/user-current-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileProps {
  memberId: Id<"members">;
}

export const Profile = ({ memberId }: ProfileProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [, setProfileMemberId] = useProfileMemberId();

  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentMember({ workspaceId });
  const { data: member, isLoading: isLoadingMember } = useGetMember({
    id: memberId,
  });

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const onRemove = () => {
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("Member removed");
          setProfileMemberId(null);
          router.replace(`/workspace/${workspaceId}`);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const onLeave = () => {
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("You left the workspace");
          setProfileMemberId(null);
          router.replace("/");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const onUpdate = (role: "admin" | "member") => {
    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => toast.success("Role updated"),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (isLoadingMember || isLoadingCurrentMember) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button
            onClick={() => setProfileMemberId(null)}
            size="iconSm"
            variant="ghost"
          >
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex justify-between items-center px-4 border-b">
          <p className="text-lg font-bold">Profile</p>
          <Button
            onClick={() => setProfileMemberId(null)}
            size="iconSm"
            variant="ghost"
          >
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const avatarFallback = member.user.name?.[0] ?? "M";

  return (
    <div className="h-full flex flex-col">
      <div className="h-[49px] flex justify-between items-center px-4 border-b">
        <p className="text-lg font-bold">Profile</p>
        <Button
          onClick={() => setProfileMemberId(null)}
          size="iconSm"
          variant="ghost"
        >
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <Avatar className="max-w-[256px] max-h-[256px] size-full">
          <AvatarImage src={member.user.image} />
          <AvatarFallback className="aspect-square text-6xl">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col p-4">
        <p className="text-xl font-bold">{member.user.name}</p>
        {currentMember?.role === "admin" &&
        currentMember?._id !== memberId ? (
          <div className="flex items-center gap-2 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full capitalize">
                  {member.role} <ChevronDownIcon className="size-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup
                  value={member.role}
                  onValueChange={(role) =>
                    onUpdate(role as "admin" | "member")
                  }
                >
                  <DropdownMenuRadioItem value="admin">
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="member">
                    Member
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={onRemove}
              variant="outline"
              className="w-full"
              disabled={isRemovingMember || isUpdatingMember}
            >
              Remove
            </Button>
          </div>
        ) : currentMember?._id === memberId &&
          currentMember?.role !== "admin" ? (
          <div className="mt-4">
            <Button
              onClick={onLeave}
              variant="outline"
              className="w-full"
              disabled={isRemovingMember}
            >
              Leave
            </Button>
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="flex flex-col p-4">
        <p className="text-sm font-bold mb-4">Contact information</p>
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-md bg-muted flex items-center justify-center">
            <MailIcon className="size-4" />
          </div>
          <div className="flex flex-col">
            <p className="text-[13px] font-semibold text-muted-foreground">
              Email Address
            </p>
            <Link
              href={`mailto:${member.user.email}`}
              className="text-sm hover:underline text-[#1264a3]"
            >
              {member.user.email}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
