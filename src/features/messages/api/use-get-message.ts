import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMessageProps {
  id: Id<"messages"> | null;
}

export const useGetMessage = ({ id }: UseGetMessageProps) => {
  const data = useQuery(api.messages.getById, id ? { id } : "skip");
  const isLoading = data === undefined;
  return { data, isLoading };
};
