"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetWorkspaceInfo } from "@/features/auth/workspaces/api/use-get-workspace-info";
import { useJoinWorkspace } from "@/features/auth/workspaces/api/use-join-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Hash, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const JoinPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [joinCode, setJoinCode] = useState("");

  const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });
  const { mutate, isPending } = useJoinWorkspace();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  useEffect(() => {
    if (isMember) {
      router.replace(`/workspace/${workspaceId}`);
    }
  }, [isMember, router, workspaceId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      {
        workspaceId,
        joinCode,
      },
      {
        onSuccess: (id) => {
          toast.success("Joined workspace");
          router.replace(`/workspace/${id}`);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md">
      <div className="size-14 rounded-xl bg-[#4A154B] text-white flex items-center justify-center">
        <Hash className="size-7" />
      </div>
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {data?.name}</h1>
          <p className="text-md text-muted-foreground">
            Enter the workspace invite code to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 w-full">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter invite code"
            maxLength={8}
            disabled={isPending}
            required
            autoFocus
            className="uppercase tracking-widest text-center"
          />
          <Button disabled={isPending} size="lg" className="w-full">
            Join workspace
          </Button>
        </form>
        <div className="flex gap-x-2">
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
