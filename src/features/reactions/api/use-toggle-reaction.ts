import { useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = { messageId: Id<"messages">; value: string };
type ResponseType = Id<"reactions"> | null;

export const useToggleReaction = () => {
  const mutation = useMutation(api.reactions.toggle);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
