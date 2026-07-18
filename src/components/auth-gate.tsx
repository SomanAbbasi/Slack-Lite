"use client";

import { useConvexAuth } from "convex/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import {
  clearStoredReturnTo,
  getStoredReturnTo,
} from "@/features/auth/components/auth-screen";
import { isSafeReturnTo } from "@/lib/access";

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
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const returnTo = getStoredReturnTo();
    if (!isSafeReturnTo(returnTo)) return;
    clearStoredReturnTo();
    if (window.location.pathname.startsWith("/auth")) {
      router.replace(returnTo);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <FullPageLoader label="Loading..." />;
  }

  return <>{children}</>;
};
