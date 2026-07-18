import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { usePathname } from "next/navigation";

const sidebarItemVariants = cva(
  "flex items-center gap-2 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-white",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface SidebarItemProps {
  label: string;
  id: string;
  icon: LucideIcon | IconType;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

export const SidebarItem = ({
  label,
  icon: Icon,
  id,
  variant,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  const href =
    id === "threads" || id === "drafts"
      ? `/workspace/${workspaceId}`
      : `/workspace/${workspaceId}/channel/${id}`;

  const isActive =
    variant === "active" ||
    (id !== "threads" &&
      id !== "drafts" &&
      pathname.includes(`/channel/${id}`));

  return (
    <Button
      asChild
      variant="transparent"
      size="sm"
      className={cn(
        sidebarItemVariants({ variant: isActive ? "active" : "default" }),
      )}
    >
      <Link href={href} className="flex items-center gap-2 w-full">
        <Icon className="size-3.5 shrink-0" />
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
};
