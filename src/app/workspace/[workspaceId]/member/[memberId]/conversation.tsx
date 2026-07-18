"use client";

import { useMemberId } from "@/hooks/use-member-id";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/members/api/use-get-member";
import { Loader } from "lucide-react";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id";

interface ConversationProps {
  id: Id<"conversations">;
}

export const Conversation = ({ id }: ConversationProps) => {
  const memberId = useMemberId();
  const [, setProfileMemberId] = useProfileMemberId();
  const { data: member, isLoading: memberLoading } = useGetMember({
    id: memberId,
  });

  if (memberLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        memberName={member?.user.name}
        memberImage={member?.user.image}
        onClick={() => setProfileMemberId(memberId)}
      />
      <MessageList
        memberName={member?.user.name}
        memberImage={member?.user.image}
        conversationId={id}
        variant="conversation"
      />
      <ChatInput
        placeholder={`Message ${member?.user.name}`}
        conversationId={id}
      />
    </div>
  );
};
