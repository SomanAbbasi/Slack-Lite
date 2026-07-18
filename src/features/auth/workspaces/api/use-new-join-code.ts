import { useMutation } from "convex/react";
import { useMemo } from "react";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = { workspaceId: Id<"workspaces"> };
type ResponseType = Id<"workspaces">;

export const useNewJoinCode = () => {
  const mutation = useMutation(api.workspaces.newJoinCode);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
