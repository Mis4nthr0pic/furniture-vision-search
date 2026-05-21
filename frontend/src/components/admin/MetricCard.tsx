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
      ? "border-emerald-200 bg-emerald-50/60"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/60"
        : "border-surface-border bg-white";

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", toneClass)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-stone-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
