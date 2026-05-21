import { cn } from "../../utils/format";

export function ScoreGauge({
  score,
  max = 1,
  label,
  className,
}: {
  score: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const pct = Math.min(Math.max(score / max, 0), 1);
  const deg = pct * 360;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className="relative h-14 w-14 rounded-full"
        style={{
          background: `conic-gradient(#C46A4A ${deg}deg, rgba(240,228,208,0.12) ${deg}deg)`,
        }}
        title={label}
      >
        <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-butter font-display text-xs italic text-ink">
          {score.toFixed(3)}
        </div>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-wider text-cream/45">{label}</span>
    </div>
  );
}
