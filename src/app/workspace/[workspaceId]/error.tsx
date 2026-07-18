"use client";

import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <TriangleAlert className="size-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Something went wrong loading this workspace.
      </p>
      <Button size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
