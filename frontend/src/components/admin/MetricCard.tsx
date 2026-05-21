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
      ? "border-teal/40 bg-teal/10"
      : tone === "warning"
        ? "border-ochre/40 bg-ochre/10"
        : "border-cream/10 bg-ink-rise/80";

  return (
    <div className={cn("rounded-lg border p-4 backdrop-blur-sm", toneClass)}>
      <p className="font-mono text-[10px] uppercase tracking-kicker text-cream/45">{label}</p>
      <p className="mt-1 font-display text-3xl italic tracking-tight text-terracotta">{value}</p>
      {hint && <p className="mt-1 font-serif text-xs italic text-cream/50">{hint}</p>}
    </div>
  );
}
