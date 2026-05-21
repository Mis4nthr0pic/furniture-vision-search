import { useEffect, useState } from "react";
import { subscribeReindexProgress, triggerReindex } from "../api/client";
import { getLlmConfigForRequest, useStore } from "../store";
import type { EmbeddingsProgress } from "../types";

function isEmbeddingsProgress(event: unknown): event is EmbeddingsProgress {
  return (
    typeof event === "object" &&
    event !== null &&
    "phase" in event &&
    "current" in event &&
    "total" in event
  );
}

export function useReindex() {
  const [progress, setProgress] = useState<EmbeddingsProgress | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeReindexProgress((event) => {
      if (!isEmbeddingsProgress(event)) return;

      setProgress(event);

      if (event.phase === "start" || event.phase === "embedding" || event.phase === "writing") {
        setRunning(true);
        setProgressOpen(true);
        setError(null);
      }

      if (event.phase === "done") {
        setRunning(false);
        setError(null);
      }

      if (event.phase === "error") {
        setRunning(false);
        setError(event.message ?? "Reindex failed");
      }
    });

    return unsubscribe;
  }, []);

  async function startReindex() {
    const { apiKey, llmConfig } = useStore.getState();
    if (!apiKey.trim()) {
      setError("API key is required to rebuild embeddings.");
      setProgressOpen(true);
      return;
    }

    setRunning(true);
    setError(null);
    setProgressOpen(true);
    setProgress({ phase: "start", current: 0, total: 0, message: "Connecting to embedding service…" });

    try {
      await triggerReindex(getLlmConfigForRequest({ apiKey, llmConfig }));
    } catch (err) {
      setRunning(false);
      setError(err instanceof Error ? err.message : "Reindex request failed");
      setProgress((current) =>
        current ?? { phase: "error", current: 0, total: 0, message: "Request failed" },
      );
    }
  }

  function dismissProgress() {
    if (running) return;
    setProgressOpen(false);
    setProgress(null);
    setError(null);
  }

  return { progress, running, error, progressOpen, startReindex, dismissProgress };
}
