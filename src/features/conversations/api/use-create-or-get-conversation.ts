import { useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = {
  workspaceId: Id<"workspaces">;
  memberId: Id<"members">;
};
type ResponseType = Id<"conversations">;

export const useCreateOrGetConversation = () => {
  const mutation = useMutation(api.conversations.createOrGet);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
