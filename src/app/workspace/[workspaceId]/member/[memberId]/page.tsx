"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/user-current-member";
import { AlertTriangle, Loader } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";
import { Button } from "@/components/ui/button";

const MemberIdPage = () => {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const { data: currentMember, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestKeyRef = useRef<string | null>(null);

  const { mutate, isPending } = useCreateOrGetConversation();
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  const loadConversation = useCallback(() => {
    if (!workspaceId || !memberId || !currentMember) {
      return;
    }

    const requestKey = `${workspaceId}:${memberId}`;
    requestKeyRef.current = requestKey;
    setFailed(false);
    setErrorMessage(null);
    setConversationId(null);

    void mutateRef.current(
      {
        workspaceId,
        memberId,
      },
      {
        onSuccess: (data) => {
          if (requestKeyRef.current !== requestKey) return;
          setConversationId(data);
        },
        onError: (error) => {
          if (requestKeyRef.current !== requestKey) return;
          setFailed(true);
          setErrorMessage(error.message);
          toast.error(error.message);
        },
      },
    );
  }, [workspaceId, memberId, currentMember]);

  useEffect(() => {
    if (memberLoading) return;
    if (!currentMember) {
      setFailed(true);
      setErrorMessage("You are not a member of this workspace");
      return;
    }
    loadConversation();
  }, [memberLoading, currentMember, loadConversation]);

  if (memberLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="h-full flex flex-col gap-y-3 items-center justify-center px-4">
        <AlertTriangle className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground text-center">
          {errorMessage ?? "Conversation not found"}
        </span>
        <Button variant="outline" size="sm" onClick={loadConversation}>
          Try again
        </Button>
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
