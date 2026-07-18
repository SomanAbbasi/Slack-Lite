import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetConversationsProps {
  workspaceId: Id<"workspaces">;
}

export const useGetConversations = ({
  workspaceId,
}: UseGetConversationsProps) => {
  const data = useQuery(api.conversations.list, { workspaceId });
  return { data, isLoading: data === undefined };
};
