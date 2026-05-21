import { useEffect, useState } from "react";
import type { EmbeddingsProgress } from "../../types";
import { cn } from "../../utils/format";
import {
  formatReindexStatusLine,
  getActiveStepIndex,
  getReindexPhaseLabel,
  getReindexProgressPercent,
  reindexSteps,
} from "../../utils/reindex";
import { Button } from "../ui/Button";

interface ReindexProgressScreenProps {
  open: boolean;
  progress: EmbeddingsProgress | null;
  running: boolean;
  error: string | null;
  onDismiss: () => void;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder}s`;
}

export function ReindexProgressScreen({
  open,
  progress,
  running,
  error,
  onDismiss,
}: ReindexProgressScreenProps) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (open && running && startedAt == null) {
      setStartedAt(Date.now());
    }
    if (!open) {
      setStartedAt(null);
      setElapsedMs(0);
    }
  }, [open, running, startedAt]);

  useEffect(() => {
    if (!open || !running || startedAt == null) return;

    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 500);

    return () => window.clearInterval(timer);
  }, [open, running, startedAt]);

  if (!open) return null;

  const phase = progress?.phase ?? (error ? "error" : "start");
  const percent = getReindexProgressPercent(progress);
  const activeStep = getActiveStepIndex(phase === "error" ? undefined : phase);
  const isComplete = phase === "done" && !running;
  const isError = Boolean(error) || phase === "error";
  const statusLine = error ?? formatReindexStatusLine(progress);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reindex-progress-title"
    >
      <div className="w-full max-w-lg bg-butter p-6 text-ink shadow-polaroid sm:p-8" style={{ transform: "rotate(-0.5deg)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-kicker text-terracotta">
              ✦ No. 04 · The inventory
            </p>
            <h2
              id="reindex-progress-title"
              className="mt-1 font-display text-2xl italic text-ink"
            >
              {isError ? "Reindex failed" : isComplete ? "Index rebuilt" : "Building vector index"}
            </h2>
            <p className="mt-2 font-serif text-sm italic text-ink/70">
              {isComplete
                ? "Hybrid search can now use cached embeddings for all catalog products."
                : "This usually takes about a minute with default settings. Keep this tab open."}
            </p>
          </div>
          {running && (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta/15">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
            </span>
          )}
        </div>

        <ol className="mt-6 grid grid-cols-4 gap-2">
          {reindexSteps.map((step, index) => {
            const done = !isError && activeStep > index;
            const active = !isError && activeStep === index && (running || isComplete);
            return (
              <li key={step.id} className="text-center">
                <div
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full font-display text-sm italic transition",
                    done && "bg-teal text-cream",
                    active && "bg-terracotta text-cream ring-4 ring-terracotta/20",
                    !done && !active && "bg-ink/10 text-ink/35",
                    isError && index === activeStep && "bg-paprika text-cream",
                  )}
                >
                  {done ? "✓" : index + 1}
                </div>
                <p
                  className={cn(
                    "mt-2 font-mono text-[10px] uppercase leading-tight tracking-kicker",
                    active || done ? "text-ink" : "text-ink/35",
                  )}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-mono text-[10px] uppercase tracking-kicker text-ink/70">
              {isError ? "Error" : getReindexPhaseLabel(phase)}
            </span>
            <span className="font-display text-lg italic tabular-nums text-terracotta">{percent}%</span>
          </div>
          <div className="h-0.5 overflow-hidden bg-terracotta/15">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isError ? "bg-paprika" : isComplete ? "bg-teal" : "bg-terracotta",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 min-h-[1.25rem] font-serif text-sm italic text-ink/70">{statusLine}</p>
          {progress && progress.total > 0 && !isError && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-kicker text-ink/45">
              Batch progress: {progress.current.toLocaleString()} /{" "}
              {progress.total.toLocaleString()} products
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-terracotta/20 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-kicker text-ink/45">
            {running && startedAt != null
              ? `Elapsed ${formatElapsed(elapsedMs)}`
              : isComplete
                ? "You can run searches immediately"
                : "Do not refresh while embedding"}
          </p>
          {!running && (
            <Button variant={isError ? "secondary" : "primary"} onClick={onDismiss}>
              {isComplete ? "Done" : "Close"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
