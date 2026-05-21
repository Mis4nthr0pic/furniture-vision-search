import { cn } from "../../utils/format";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  className?: string;
}

export function ScoreBar({ label, value, max = 1, className }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase text-ink-muted">
        <span>{label}</span>
        <span className="tabular-nums text-ink-soft">{value.toFixed(3)}</span>
      </div>
      <div className="h-1 bg-hair">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
