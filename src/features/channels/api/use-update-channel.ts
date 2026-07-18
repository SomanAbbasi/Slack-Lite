import { useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = { id: Id<"channels">; name: string };
type ResponseType = Id<"channels">;

export const useUpdateChannel = () => {
  const mutation = useMutation(api.channels.update);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
