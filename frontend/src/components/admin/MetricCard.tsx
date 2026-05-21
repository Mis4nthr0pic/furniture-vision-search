import { cn } from "../../utils/format";

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "border-signal/30 bg-signal/5"
      : tone === "warning"
        ? "border-warn/30 bg-warn/5"
        : "border-hair bg-panel";

  return (
    <div className={cn("border p-3", toneClass)}>
      <p className="instrument-kicker">{label}</p>
      <p className="mt-1 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tabular-nums tracking-[-0.04em] text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 font-mono text-[10px] text-ink-muted">{hint}</p>}
    </div>
  );
}
