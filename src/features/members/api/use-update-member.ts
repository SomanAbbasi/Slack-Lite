import { useMutation } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutationState } from "@/hooks/use-mutation-state";

type RequestType = {
  id: Id<"members">;
  role: "admin" | "member";
};
type ResponseType = Id<"members">;

export const useUpdateMember = () => {
  const mutation = useMutation(api.members.update);
  const mutationFn = useMemo(() => mutation, [mutation]);
  return useMutationState<RequestType, ResponseType>(mutationFn);
};
