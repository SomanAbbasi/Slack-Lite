

import { useMutation } from "convex/react";


import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RequestType = { name: string; workspaceId: Id<"workspaces"> }
type ResponseType = Id<"channels"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
}

export const useCreateChannel = () => {
    const [data, setData] = useState<ResponseType>(null);

    const [error, setError] = useState<Error | null>(null)
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const safeSetData = (value: ResponseType) => {
        if (isMountedRef.current) {
            setData(value);
        }
    };

    const safeSetError = (value: Error | null) => {
        if (isMountedRef.current) {
            setError(value);
        }
    };

    const safeSetStatus = (value: "success" | "error" | "settled" | "pending" | null) => {
        if (isMountedRef.current) {
            setStatus(value);
        }
    };

    // const [isPending, setIsPending] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);
    // const [isError, setIsError] = useState(false);
    // const [isSettled, setIsSettled] = useState(false);


    const isPending = useMemo(() => status === "pending", [status])
    const isSuccess = useMemo(() => status === "success", [status])
    const isError = useMemo(() => status === "error", [status])
    const isSettled = useMemo(() => status === "settled", [status])

    const mutation = useMutation(api.channels.create);

    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        try {
            safeSetData(null);
            safeSetError(null);

            safeSetStatus("pending");


            const response = await mutation(values);
            options?.onSuccess?.(response);
            return response;
        }
        catch {
            safeSetStatus("error");

            options?.onError?.(error as Error);
            if (options?.throwError) {
                throw Error;
            }

        }
        finally {
            safeSetStatus("settled");

            options?.onSettled?.();

        }
    }, [mutation]);

    return {
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isError,
        isSettled
    };
};