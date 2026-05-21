import { useEffect, useState } from "react";
import type { EmbeddingsProgress } from "../../types";
import {
  formatReindexStatusLine,
  getActiveStepIndex,
  getReindexPhaseLabel,
  getReindexProgressPercent,
  reindexSteps,
} from "../../utils/reindex";
import { cn } from "../../utils/format";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/45 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reindex-progress-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-surface-border bg-white p-6 shadow-lift sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Embeddings rebuild
            </p>
            <h2
              id="reindex-progress-title"
              className="mt-1 font-display text-2xl font-semibold text-stone-900"
            >
              {isError ? "Reindex failed" : isComplete ? "Index rebuilt" : "Building vector index"}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {isComplete
                ? "Hybrid search can now use cached embeddings for all catalog products."
                : "This usually takes 2–3 minutes for ~2,500 products. Keep this tab open."}
            </p>
          </div>
          {running && (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
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
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                    done && "bg-emerald-600 text-white",
                    active && "bg-brand-800 text-white ring-4 ring-brand-100",
                    !done && !active && "bg-stone-100 text-stone-400",
                    isError && index === activeStep && "bg-rose-600 text-white",
                  )}
                >
                  {done ? "✓" : index + 1}
                </div>
                <p
                  className={cn(
                    "mt-2 text-[11px] font-medium leading-tight",
                    active || done ? "text-stone-800" : "text-stone-400",
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
            <span className="font-medium text-stone-700">
              {isError ? "Error" : getReindexPhaseLabel(phase)}
            </span>
            <span className="tabular-nums text-stone-500">{percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-200">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isError ? "bg-rose-500" : isComplete ? "bg-emerald-600" : "bg-brand-700",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 min-h-[1.25rem] text-sm text-stone-600">{statusLine}</p>
          {progress && progress.total > 0 && !isError && (
            <p className="mt-1 text-xs text-stone-400">
              Batch progress: {progress.current.toLocaleString()} / {progress.total.toLocaleString()}{" "}
              products
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-surface-border pt-4">
          <p className="text-xs text-stone-500">
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
