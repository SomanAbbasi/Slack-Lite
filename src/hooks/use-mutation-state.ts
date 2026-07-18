"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MutationStatus = "success" | "error" | "settled" | "pending" | null;

type Options<TResponse> = {
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export function useMutationState<TRequest, TResponse>(
  mutationFn: (values: TRequest) => Promise<TResponse>,
) {
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<MutationStatus>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetData = (value: TResponse | null) => {
    if (isMountedRef.current) setData(value);
  };

  const safeSetError = (value: Error | null) => {
    if (isMountedRef.current) setError(value);
  };

  const safeSetStatus = (value: MutationStatus) => {
    if (isMountedRef.current) setStatus(value);
  };

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(
    () => status === "settled" || status === "success" || status === "error",
    [status],
  );

  const mutate = useCallback(
    async (values: TRequest, options?: Options<TResponse>) => {
      try {
        safeSetData(null);
        safeSetError(null);
        safeSetStatus("pending");

        const response = await mutationFn(values);
        safeSetData(response);
        safeSetStatus("success");
        options?.onSuccess?.(response);
        return response;
      } catch (err) {
        const caught =
          err instanceof Error ? err : new Error("Something went wrong");
        safeSetError(caught);
        safeSetStatus("error");
        options?.onError?.(caught);
        if (options?.throwError) {
          throw caught;
        }
      } finally {
        options?.onSettled?.();
        if (isMountedRef.current) {
          setStatus((current) =>
            current === "pending" ? "settled" : current,
          );
        }
      }
    },
    [mutationFn],
  );

  return {
    mutate,
    data,
    error,
    isPending,
    isSuccess,
    isError,
    isSettled,
  };
}
