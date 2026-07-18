import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import { isValidConvexId } from "@/lib/access";

/**
 * Returns a validated workspace id from the route.
 * Invalid / polluted values (e.g. pasted invite text) become undefined at runtime
 * so global modals do not fire Convex queries with bad args.
 */
export const useWorkspaceId = () => {
  const params = useParams();
  const raw = params.workspaceId;
  if (!isValidConvexId(raw)) {
    return undefined as unknown as Id<"workspaces">;
  }
  return raw as Id<"workspaces">;
};
