import { useMutation } from "convex/react";
import { useMemo } from "react";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = { id: Id<"workspaces"> };
type ResponseType = Id<"workspaces">;

export const useRemoveWorkspace = () => {
  const mutation = useMutation(api.workspaces.remove);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
