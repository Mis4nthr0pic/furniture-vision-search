import { useEffect, useState } from "react";
import { subscribeReindexProgress, triggerReindex } from "../api/client";
import { getLlmConfigForRequest, useStore } from "../store";
import type { EmbeddingsProgress } from "../types";

export function useReindex() {
  const [progress, setProgress] = useState<EmbeddingsProgress | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeReindexProgress((event) => {
      if ("phase" in event && "current" in event) {
        setProgress(event);
        if (event.phase === "done" || event.phase === "error") {
          setRunning(false);
          if (event.phase === "error") {
            setError(event.message ?? "Reindex failed");
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  async function startReindex() {
    const { apiKey, llmConfig } = useStore.getState();
    if (!apiKey.trim()) {
      setError("API key is required to rebuild embeddings.");
      return;
    }

    setRunning(true);
    setError(null);
    setProgress({ phase: "start", current: 0, total: 0, message: "Starting reindex…" });

    try {
      await triggerReindex(getLlmConfigForRequest({ apiKey, llmConfig }));
    } catch (err) {
      setRunning(false);
      setError(err instanceof Error ? err.message : "Reindex request failed");
    }
  }

  return { progress, running, error, startReindex };
}
