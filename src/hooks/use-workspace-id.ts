import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Returns the workspace id from the route.
 * Outside `/workspace/[workspaceId]` this is undefined at runtime —
 * callers mounted globally must skip Convex queries when it is falsy.
 */
export const useWorkspaceId = () => {
  const params = useParams();
  return params.workspaceId as Id<"workspaces">;
};
