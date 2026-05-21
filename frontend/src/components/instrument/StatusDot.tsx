import { cn } from "../../utils/format";

type StatusTone = "signal" | "warn" | "danger" | "idle";

const toneClass: Record<StatusTone, string> = {
  signal: "bg-signal",
  warn: "bg-warn",
  danger: "bg-danger",
  idle: "bg-ink-muted",
};

export function StatusDot({
  tone,
  label,
  timestamp,
}: {
  tone: StatusTone;
  label: string;
  timestamp?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase text-ink-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", toneClass[tone])} aria-hidden />
      {label}
      {timestamp && <span className="normal-case text-ink-muted">· {timestamp}</span>}
    </span>
  );
}
