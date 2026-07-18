"use client";

import { useConvexAuth } from "convex/react";
import { Loader } from "lucide-react";
import type { ReactNode } from "react";

export const FullPageLoader = ({ label }: { label?: string }) => {
  return (
    <div className="h-full min-h-screen flex flex-col items-center justify-center gap-2 bg-white">
      <Loader className="size-6 animate-spin text-muted-foreground" />
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  );
};

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return <FullPageLoader label="Loading..." />;
  }

  return <>{children}</>;
};
