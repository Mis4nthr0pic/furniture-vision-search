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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reindex-progress-title"
    >
      <div className="w-full max-w-lg border border-hair bg-bg">
        <div className="border-b border-hair px-4 py-3">
          <p className="instrument-kicker">§ 4.5 · EMBED_INDEX</p>
          <h2 id="reindex-progress-title" className="text-[15px] font-medium text-ink">
            {isError ? "Reindex failed" : isComplete ? "Index rebuilt" : "Building vector index"}
          </h2>
        </div>

        <div className="p-4">
          <p className="font-mono text-[11px] text-ink-soft">
            {isComplete
              ? "Embeddings cached · hybrid search ready"
              : "Keep tab open · ~30–90s default batch"}
          </p>

          <ol className="mt-4 grid grid-cols-4 divide-x divide-hair border border-hair">
            {reindexSteps.map((step, index) => {
              const done = !isError && activeStep > index;
              const active = !isError && activeStep === index && (running || isComplete);
              return (
                <li key={step.id} className="px-1 py-2 text-center">
                  <div
                    className={cn(
                      "mx-auto flex h-7 w-7 items-center justify-center font-mono text-[11px] transition",
                      done && "bg-signal/10 text-signal",
                      active && "bg-accent/10 text-accent",
                      !done && !active && "text-ink-muted",
                      isError && index === activeStep && "bg-danger/10 text-danger",
                    )}
                  >
                    {done ? "✓" : index + 1}
                  </div>
                  <p
                    className={cn(
                      "mt-1 font-mono text-[9px] uppercase leading-tight",
                      active || done ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {step.label}
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 border-t border-hair pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="instrument-kicker">
                {isError ? "error" : getReindexPhaseLabel(phase)}
              </span>
              <span className="font-mono text-[13px] tabular-nums text-ink">{percent}%</span>
            </div>
            <div className="h-1 bg-hair">
              <div
                className={cn(
                  "h-full transition-all duration-500",
                  isError ? "bg-danger" : isComplete ? "bg-signal" : "bg-accent",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 min-h-[1.25rem] font-mono text-[11px] text-ink-soft">{statusLine}</p>
            {progress && progress.total > 0 && !isError && (
              <p className="mt-1 font-mono text-[10px] text-ink-muted">
                batch {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-hair pt-4">
            <p className="font-mono text-[10px] uppercase text-ink-muted">
              {running && startedAt != null
                ? `elapsed ${formatElapsed(elapsedMs)}`
                : isComplete
                  ? "ready"
                  : "do not refresh"}
            </p>
            {!running && (
              <Button variant={isError ? "secondary" : "primary"} onClick={onDismiss}>
                {isComplete ? "Done" : "Close"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
