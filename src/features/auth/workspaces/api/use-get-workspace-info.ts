import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { isValidConvexId } from "@/lib/access";

interface UseGetWorkspaceInfoProps {
  id?: Id<"workspaces">;
}

export const useGetWorkspaceInfo = ({ id }: UseGetWorkspaceInfoProps) => {
  const data = useQuery(
    api.workspaces.getInfoById,
    id && isValidConvexId(id) ? { id } : "skip",
  );
  const isLoading = !!id && isValidConvexId(id) && data === undefined;
  return { data, isLoading };
};
