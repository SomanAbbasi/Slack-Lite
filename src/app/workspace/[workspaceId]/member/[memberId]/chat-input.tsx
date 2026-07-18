"use client";

import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Editor } from "@/components/editor";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useRef } from "react";

interface ChatInputProps {
  placeholder: string;
  conversationId?: Id<"conversations">;
}

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
  const workspaceId = useWorkspaceId();
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const { mutate: createMessage, isPending: isCreatingMessage } =
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
          conversationId,
          workspaceId,
          body,
          image: storageId,
        },
        { throwError: true },
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send message",
      );
      throw error;
    }
  };

  return (
    <div className="px-5 w-full">
      <Editor
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isCreatingMessage}
        innerRef={editorRef}
      />
    </div>
  );
};
