import type { EmbeddingsProgress } from "../types";

export type ReindexPhase = EmbeddingsProgress["phase"];

export function getReindexProgressPercent(progress: EmbeddingsProgress | null): number {
  if (!progress) return 0;
  if (progress.phase === "done") return 100;
  if (progress.phase === "error") return progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  if (progress.total > 0) return Math.round((progress.current / progress.total) * 100);
  if (progress.phase === "writing") return 98;
  if (progress.phase === "start") return 2;
  return 0;
}

export function getReindexPhaseLabel(phase: ReindexPhase): string {
  switch (phase) {
    case "start":
      return "Preparing catalog";
    case "embedding":
      return "Generating embeddings";
    case "writing":
      return "Saving cache to disk";
    case "done":
      return "Index ready";
    case "error":
      return "Build failed";
    default:
      return "Working…";
  }
}

export const reindexSteps: Array<{ id: ReindexPhase | "ready"; label: string }> = [
  { id: "start", label: "Prepare" },
  { id: "embedding", label: "Embed products" },
  { id: "writing", label: "Save cache" },
  { id: "ready", label: "Complete" },
];

export function getActiveStepIndex(phase: ReindexPhase | undefined): number {
  switch (phase) {
    case "start":
      return 0;
    case "embedding":
      return 1;
    case "writing":
      return 2;
    case "done":
      return 3;
    case "error":
      return -1;
    default:
      return 0;
  }
}

export function formatReindexStatusLine(progress: EmbeddingsProgress | null): string {
  if (!progress) return "Starting…";
  if (progress.message) return progress.message;
  if (progress.total > 0) {
    return `${progress.current.toLocaleString()} of ${progress.total.toLocaleString()} products embedded`;
  }
  return getReindexPhaseLabel(progress.phase);
}
