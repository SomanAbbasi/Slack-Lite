import { cn } from "@/lib/utils";

interface SlackLiteMarkProps {
  className?: string;
}

/** Polished Slack-Lite brand mark: aubergine tile with white "S". */
export const SlackLiteMark = ({ className }: SlackLiteMarkProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-xl bg-[#4A154B] text-white shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 64"
        className="size-[62%] "
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 22.5c0-4.7 3.8-8.5 8.5-8.5h4.2c5.4 0 9.8 4.4 9.8 9.8 0 3.4-1.7 6.4-4.4 8.2 2.7 1.8 4.4 4.8 4.4 8.2 0 5.4-4.4 9.8-9.8 9.8H26.5C21.8 50 18 46.2 18 41.5c0-2.9 1.4-5.5 3.6-7.1C19.4 32.8 18 30.2 18 27.3v-4.8Zm8.5-4.5c-2.5 0-4.5 2-4.5 4.5V27c0 2.5 2 4.5 4.5 4.5h3.5c2.8 0 5-2.2 5-5s-2.2-5-5-5h-3.5Zm3.5 23c2.8 0 5-2.2 5-5s-2.2-5-5-5H26.5c-2.5 0-4.5 2-4.5 4.5 0 2.5 2 4.5 4.5 4.5h3.5Z"
          fill="currentColor"
        />
        <circle cx="46" cy="18" r="4" fill="#ECB22E" />
      </svg>
    </div>
  );
};
