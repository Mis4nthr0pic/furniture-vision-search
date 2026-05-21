import { memo } from "react";
import { useSearchProgress } from "../../hooks/useSearchProgress";
import { cn } from "../../utils/format";
import { Card, CardHeader } from "../ui/Card";

interface SearchLoadingPanelProps {
  enableRerank?: boolean;
}

export const SearchLoadingPanel = memo(function SearchLoadingPanel({
  enableRerank = true,
}: SearchLoadingPanelProps) {
  const { stepIndex, percent, steps, step } = useSearchProgress(true, enableRerank);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="relative border-b border-hair">
        <CardHeader sectionId="[live]" title="Pipeline" description={step.label} />
        <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-hair">
          <div
            className="h-full w-1/3 animate-shimmer bg-accent"
            style={{ width: `${Math.max(8, percent)}%` }}
          />
        </div>
      </div>

      <div className="p-4">
        <p className="sr-only" aria-live="polite">
          Search progress: {step.label}, {Math.round(percent)} percent
        </p>
        <div className="flex items-center justify-between font-mono text-[10px] uppercase text-ink-muted">
          <span>{step.kicker}</span>
          <span className="tabular-nums text-ink">{Math.round(percent)}%</span>
        </div>
        <p className="mt-2 font-mono text-[11px] text-ink-soft">
          {enableRerank
            ? "vision → embed → hybrid k=30 → rerank n=10 · est 8–12s"
            : "vision → embed → hybrid k=30 · est 4–6s"}
        </p>

        <ol className="mt-4 flex divide-x divide-hair border border-hair">
          {steps.map((item, index) => {
            const done = index < stepIndex;
            const active = index === stepIndex;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex-1 px-2 py-1.5 text-center font-mono text-[9px] uppercase tracking-wide",
                  done && "bg-signal/10 text-signal",
                  active && "bg-accent/10 text-accent",
                  !done && !active && "text-ink-muted",
                )}
              >
                {item.kicker}
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
});
