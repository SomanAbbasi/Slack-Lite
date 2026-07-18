"use client";

import { Button } from "@/components/ui/button";
import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useParentMessageId } from "@/features/messages/store/use-parent-message";
import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { Message } from "@/components/message";
import { useCurrentMember } from "@/features/members/user-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { MessageList } from "@/components/message-list";
import { Editor } from "@/components/editor";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { toast } from "sonner";

export const Thread = () => {
  const workspaceId = useWorkspaceId();
  const [parentMessageId, setParentMessageId] = useParentMessageId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: parentMessageId as Id<"messages">,
  });
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const { mutate: createMessage, isPending: creatingMessage } =
    useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      editorRef.current?.focus();
      let storageId: Id<"_storage"> | undefined;

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });
        if (!url) throw new Error("Failed to generate upload URL");
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });
        if (!result.ok) throw new Error("Failed to upload image");
        const json = (await result.json()) as { storageId: Id<"_storage"> };
        storageId = json.storageId;
      }

      await createMessage(
        {
          body,
          image: storageId,
          workspaceId,
          channelId: message?.channelId,
          conversationId: message?.conversationId,
          parentMessageId: parentMessageId ?? undefined,
        },
        { throwError: true },
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reply",
      );
      throw error;
    }
  };

  if (!parentMessageId) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-[49px] flex justify-between items-center px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button
          onClick={() => setParentMessageId(null)}
          size="iconSm"
          variant="ghost"
        >
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>

      {loadingMessage ? (
        <div className="h-full flex items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !message ? (
        <div className="h-full flex flex-col gap-y-2 items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <Message
              hideThreadButton
              id={message._id}
              memberId={message.memberId}
              authorImage={message.user.image}
              authorName={message.user.name}
              isAuthor={message.memberId === currentMember?._id}
              body={message.body}
              image={message.image}
              createdAt={message._creationTime}
              updatedAt={message.updatedAt}
              isEditing={editingId === message._id}
              setEditingId={setEditingId}
              reactions={message.reactions}
            />
            <MessageList
              channelId={message.channelId}
              conversationId={message.conversationId}
              parentMessageId={message._id}
              variant="thread"
            />
          </div>
          <div className="px-4">
            <Editor
              onSubmit={handleSubmit}
              disabled={creatingMessage}
              placeholder="Reply..."
              innerRef={editorRef}
            />
          </div>
        </>
      )}
    </div>
  );
};
