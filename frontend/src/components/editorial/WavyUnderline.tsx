import { cn } from "../../utils/format";

export function WavyUnderline({ className }: { className?: string }) {
  return (
    <svg
      width="60"
      height="8"
      viewBox="0 0 60 8"
      className={cn("text-terracotta", className)}
      aria-hidden
    >
      <path
        d="M 2 5 Q 30 1 58 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
