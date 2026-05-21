import { cn } from "../../utils/format";

export function ScoreGauge({
  score,
  max = 1,
  label = "score",
  size = 56,
  className,
}: {
  score: number;
  max?: number;
  label?: string;
  size?: number;
  className?: string;
}) {
  const pct = Math.min(Math.max(score / max, 0), 1);
  const deg = pct * 360;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          borderRadius: "9999px",
          background: `conic-gradient(rgb(var(--accent)) ${deg}deg, rgb(var(--hair)) ${deg}deg)`,
        }}
        title={`${label} ${score.toFixed(3)}`}
      >
        <div
          className="absolute inset-[4px] flex items-center justify-center rounded-full bg-bg font-emphasis italic text-ink"
          style={{ fontSize: size * 0.26 }}
        >
          {score.toFixed(2)}
        </div>
      </div>
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">{label}</span>
    </div>
  );
}
