export const isSafeReturnTo = (value: string | null | undefined): value is string => {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/auth")
  );
};

/** Convex document ids are lowercase alphanumeric (typically ~32 chars). */
export const isValidConvexId = (value: unknown): value is string => {
  return typeof value === "string" && /^[a-z0-9]{16,40}$/i.test(value);
};

export const normalizeJoinCode = (value: string) => {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
};

export const buildInviteLink = (
  origin: string,
  workspaceId: string,
  joinCode: string,
) => {
  const url = new URL(`/join/${workspaceId}`, origin);
  const code = normalizeJoinCode(joinCode);
  if (code) {
    url.searchParams.set("code", code);
  }
  return url.toString();
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
