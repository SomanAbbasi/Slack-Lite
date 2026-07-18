"use client";

import { useEffect, useMemo } from "react";
import { useGetWorkspaces } from "@/features/auth/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/auth/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/auth-gate";

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();
  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspaceId) {
      router.replace(`/workspace/${workspaceId}`);
      return;
    }

    if (!open) {
      setOpen(true);
    }
  }, [workspaceId, isLoading, open, setOpen, router]);

  return <FullPageLoader label="Opening workspace..." />;
}
