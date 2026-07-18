"use client";

import { cn } from "@/lib/utils";

interface RendererProps {
  value: string;
}

export const Renderer = ({ value }: RendererProps) => {
  if (!value) return null;

  return (
    <div className={cn("text-sm text-slate-800 whitespace-pre-wrap break-words")}>
      {value.split(/(@[a-zA-Z0-9._-]+)/g).map((part, index) => {
        if (part.startsWith("@")) {
          return (
            <span
              key={`${part}-${index}`}
              className="bg-[#f2ecf2] text-[#1264a3] rounded px-0.5"
            >
              {part}
            </span>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </div>
  );
};
