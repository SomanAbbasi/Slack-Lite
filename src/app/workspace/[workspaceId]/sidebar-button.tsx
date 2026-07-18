import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";

interface SidebarButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const SidebarButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-y-0.5 cursor-pointer group"
    >
      <div
        className={cn(
          "size-9 p-2 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors",
          isActive && "bg-accent/20",
        )}
      >
        <Icon className="size-5 text-white group-hover:scale-110 transition-all" />
      </div>
      <span className="text-[11px] text-white group-hover:text-accent">
        {label}
      </span>
    </button>
  );
};
