import { useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = Record<string, never>;
type ResponseType = string;

export const useGenerateUploadUrl = () => {
  const mutation = useMutation(api.upload.generateUploadUrl);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
