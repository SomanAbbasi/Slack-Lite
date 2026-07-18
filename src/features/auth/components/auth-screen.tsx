"use client";
import React, { useEffect, useState } from "react";
import { SignInFlow } from "./types";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";
import { useSearchParams } from "next/navigation";

const RETURN_TO_KEY = "slack-lite-return-to";

export const getStoredReturnTo = () => {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(RETURN_TO_KEY);
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/auth")
  ) {
    return value;
  }
  return null;
};

export const clearStoredReturnTo = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RETURN_TO_KEY);
};

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");
  const searchParams = useSearchParams();

  useEffect(() => {
    const returnTo = searchParams.get("returnTo");
    if (
      returnTo &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//") &&
      !returnTo.startsWith("/auth")
    ) {
      window.sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full md:w-105">
        {state === "signIn" ? (
          <SignInCard setState={setState} />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  );
};
