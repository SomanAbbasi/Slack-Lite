"use client";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { Suspense } from "react";
import { FullPageLoader } from "@/components/auth-gate";

export default function AuthPage() {
  return (
    <Suspense fallback={<FullPageLoader label="Loading..." />}>
      <AuthScreen />
    </Suspense>
  );
}
