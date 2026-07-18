"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetWorkspaceInfo } from "@/features/auth/workspaces/api/use-get-workspace-info";
import { useJoinWorkspace } from "@/features/auth/workspaces/api/use-join-workspace";
import { isValidConvexId, normalizeJoinCode } from "@/lib/access";
import { Loader, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { SlackLiteMark } from "@/components/brand";

const JoinPageContent = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawWorkspaceId = params.workspaceId;
  const workspaceId = isValidConvexId(rawWorkspaceId)
    ? (rawWorkspaceId as Id<"workspaces">)
    : undefined;

  const codeFromUrl = normalizeJoinCode(searchParams.get("code") ?? "");
  const [joinCode, setJoinCode] = useState(codeFromUrl);
  const autoJoinAttempted = useRef(false);

  const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });
  const { mutate, isPending } = useJoinWorkspace();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  useEffect(() => {
    if (codeFromUrl) {
      setJoinCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  useEffect(() => {
    if (isMember && workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
    }
  }, [isMember, router, workspaceId]);

  const join = (code: string) => {
    if (!workspaceId) return;
    const normalized = normalizeJoinCode(code);
    if (normalized.length < 6) {
      toast.error("Enter a valid invite code");
      return;
    }

    mutate(
      {
        workspaceId,
        joinCode: normalized,
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

  useEffect(() => {
    if (autoJoinAttempted.current) return;
    if (!workspaceId || isLoading || !data || data.isMember) return;
    if (!codeFromUrl) return;
    autoJoinAttempted.current = true;
    join(codeFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, isLoading, data, codeFromUrl]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    join(joinCode);
  };

  if (!workspaceId) {
    return (
      <div className="h-full flex flex-col gap-y-4 items-center justify-center bg-white p-8">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Invalid invite link</h1>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          This invite URL is malformed. Ask your teammate to use{" "}
          <strong>Copy invite link</strong> from Slack-Lite and open that link
          directly.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Opening invite…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col gap-y-4 items-center justify-center bg-white p-8">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Invite not found</h1>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          This workspace invite link is invalid or the workspace no longer
          exists.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8">
      <SlackLiteMark className="size-14" />
      <div className="flex flex-col gap-y-4 items-center justify-center max-w-md w-full">
        <div className="flex flex-col gap-y-2 items-center justify-center text-center">
          <h1 className="text-2xl font-bold">Join {data.name}</h1>
          <p className="text-md text-muted-foreground">
            {codeFromUrl
              ? "Confirm the invite code and join this workspace"
              : "Enter the workspace invite code to continue"}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 w-full">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(normalizeJoinCode(e.target.value))}
            placeholder="Enter invite code"
            maxLength={8}
            disabled={isPending}
            required
            autoFocus
            className="uppercase tracking-widest text-center"
          />
          <Button disabled={isPending} size="lg" className="w-full">
            {isPending ? "Joining…" : "Join workspace"}
          </Button>
        </form>
        <Button size="lg" variant="outline" asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

const JoinPage = () => {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          <Loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <JoinPageContent />
    </Suspense>
  );
};

export default JoinPage;
