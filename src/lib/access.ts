export const isSafeReturnTo = (value: string | null | undefined): value is string => {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/auth")
  );
};

export const canDeleteChannel = (channelName: string, channelCount: number) => {
  if (channelName === "general") return false;
  if (channelCount <= 1) return false;
  return true;
};

export const isConversationParticipant = (
  conversation: { memberOneId: string; memberTwoId: string },
  memberId: string,
) => {
  return (
    conversation.memberOneId === memberId ||
    conversation.memberTwoId === memberId
  );
};

export const shouldIncludeMessageInSearch = ({
  conversation,
  memberId,
}: {
  conversation: { memberOneId: string; memberTwoId: string } | null;
  memberId: string;
}) => {
  if (!conversation) return true;
  return isConversationParticipant(conversation, memberId);
};
