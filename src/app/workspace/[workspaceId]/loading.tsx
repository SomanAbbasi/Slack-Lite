"use client";

import { Loader } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
