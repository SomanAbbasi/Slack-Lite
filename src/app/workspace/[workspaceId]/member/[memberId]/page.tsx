"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";

const MemberIdPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [failed, setFailed] = useState(false);

  const { mutate, isPending } = useCreateOrGetConversation();

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setConversationId(null);

    mutate(
      {
        workspaceId,
        memberId,
      },
      {
        onSuccess: (data) => {
          if (!cancelled) {
            setConversationId(data);
          }
        },
        onError: (error) => {
          if (!cancelled) {
            setFailed(true);
            toast.error(error.message);
          }
        },
      },
    );

    return () => {
      cancelled = true;
    };
  }, [memberId, workspaceId, mutate]);

  if (failed) {
    return (
      <div className="h-full flex flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }

  if (isPending || !conversationId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <Conversation id={conversationId} />;
};

export default MemberIdPage;
