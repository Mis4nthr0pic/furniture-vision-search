import { memo } from "react";
import { useSearchProgress } from "../../hooks/useSearchProgress";
import { cn } from "../../utils/format";
import { Card } from "../ui/Card";

interface SearchLoadingPanelProps {
  enableRerank?: boolean;
}

export const SearchLoadingPanel = memo(function SearchLoadingPanel({
  enableRerank = true,
}: SearchLoadingPanelProps) {
  const { stepIndex, percent, steps, step } = useSearchProgress(true, enableRerank);

  return (
    <Card className="animate-fade-in border-terracotta/30">
      <div className="flex items-start gap-4">
        <span
          className="mt-1 h-5 w-5 shrink-0 animate-spin-slow rounded-full border-2 border-terracotta border-t-transparent"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-kicker text-terracotta">
            ✦ {step.kicker} · {step.label}
          </p>
          <p className="mt-1 font-display text-lg italic text-cream">Consulting the catalog…</p>
          <p className="mt-2 font-serif text-sm italic leading-relaxed text-cream/60">
            {enableRerank
              ? "Vision extraction, hybrid retrieval, and rerank typically take 8–12 seconds."
              : "Vision extraction and hybrid retrieval typically take 4–6 seconds."}
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-kicker text-cream/50">
                Progress
              </span>
              <span className="font-display text-sm italic tabular-nums text-terracotta">
                {Math.round(percent)}%
              </span>
            </div>
            <p className="sr-only" aria-live="polite">
              Search progress: {step.label}, {Math.round(percent)} percent
            </p>
            <div className="h-0.5 overflow-hidden bg-terracotta/15" aria-hidden="true">
              <div
                className="h-full bg-terracotta transition-all duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <ol className="mt-5 flex flex-wrap gap-2">
            {steps.map((item, index) => {
              const done = index < stepIndex;
              const active = index === stepIndex;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-pill px-3 py-1 font-mono text-[10px] uppercase tracking-kicker transition",
                    done && "bg-teal/20 text-cream",
                    active && "bg-terracotta/20 text-terracotta",
                    !done && !active && "bg-ink/40 text-cream/35",
                  )}
                >
                  {item.kicker}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Card>
  );
});
