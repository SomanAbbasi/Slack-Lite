import { useMutation } from "convex/react";
import { useMemo } from "react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = { name: string; workspaceId: Id<"workspaces"> };
type ResponseType = Id<"channels">;

export const useCreateChannel = () => {
  const mutation = useMutation(api.channels.create);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
