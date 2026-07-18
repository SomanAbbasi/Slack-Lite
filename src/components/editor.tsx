"use client";

import { Button } from "@/components/ui/button";
import { ImageIcon, SendHorizonal, Smile, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

interface EditorProps {
  onSubmit: ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  innerRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  variant?: "create" | "update";
}

export const Editor = ({
  onSubmit,
  onCancel,
  placeholder = "Write a message...",
  defaultValue = "",
  disabled,
  innerRef,
  variant = "create",
}: EditorProps) => {
  const [value, setValue] = useState(defaultValue);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageElementRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const setRefs = (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (innerRef) {
      innerRef.current = node;
    }
  };

  const handleSubmit = async () => {
    if ((!value.trim() && !image) || disabled || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ body: value, image });
      setValue("");
      setImage(null);
      if (imageElementRef.current) {
        imageElementRef.current.value = "";
      }
      textareaRef.current?.focus();
    } catch {
      // Parent chat inputs own the error toast to avoid duplicates.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col border border-slate-200 rounded-lg overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm bg-white">
      <textarea
        ref={setRefs}
        value={value}
        disabled={disabled || isSubmitting}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-h-[90px] max-h-[280px] w-full resize-none border-0 outline-none px-3 py-2 text-sm font-sans"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
          }
        }}
      />

      {!!previewUrl && (
        <div className="p-2">
          <div className="relative size-[62px] flex items-center justify-center group/image">
            <button
              type="button"
              onClick={() => {
                setImage(null);
                if (imageElementRef.current) {
                  imageElementRef.current.value = "";
                }
              }}
              className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
            >
              <XIcon className="size-3.5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded"
              className="rounded-xl overflow-hidden border object-cover size-[62px]"
            />
          </div>
        </div>
      )}

      <div className="flex px-2 pb-2 z-[5]">
        <div className="flex items-center gap-x-1">
          {variant === "create" && (
            <>
              <Button
                disabled={disabled || isSubmitting}
                size="iconSm"
                variant="ghost"
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
              <Button
                disabled
                size="iconSm"
                variant="ghost"
                title="Emoji picker coming soon"
              >
                <Smile className="size-4" />
              </Button>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-x-2">
          {variant === "update" && (
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            disabled={disabled || isSubmitting || (!value.trim() && !image)}
            onClick={() => void handleSubmit()}
            size="sm"
            className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
          >
            {variant === "update" ? (
              "Save"
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </Button>
        </div>
      </div>
      <input
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        ref={imageElementRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) {
            setImage(null);
            return;
          }
          if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            toast.error("Only JPEG, PNG, GIF, or WebP images are allowed");
            e.target.value = "";
            return;
          }
          if (file.size > MAX_IMAGE_BYTES) {
            toast.error("Image must be 5MB or smaller");
            e.target.value = "";
            return;
          }
          setImage(file);
        }}
      />
    </div>
  );
};
