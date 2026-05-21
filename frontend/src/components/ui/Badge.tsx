import { cn } from "../../utils/format";

interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}

const tones = {
  neutral: "border-hair text-ink-soft bg-panel",
  brand: "border-accent/40 text-accent bg-accent/5",
  success: "border-signal/40 text-signal bg-signal/5",
  warning: "border-warn/40 text-warn bg-warn/5",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
