import { useCallback, useEffect, useState } from "react";
import { fetchHealth } from "../api/client";
import type { HealthResponse } from "../types";

export type BackendHealthStatus = "checking" | "online" | "offline";

const OFFLINE_POLL_MS = 15_000;

export function useBackendHealth() {
  const [status, setStatus] = useState<BackendHealthStatus>("checking");
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const check = useCallback(async () => {
    setStatus((current) => (current === "offline" ? "checking" : current));

    try {
      const data = await fetchHealth();
      setHealth(data);
      setStatus(data.ok ? "online" : "offline");
    } catch {
      setHealth(null);
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  useEffect(() => {
    if (status !== "offline") return;

    const timer = window.setInterval(() => {
      void check();
    }, OFFLINE_POLL_MS);

    return () => window.clearInterval(timer);
  }, [check, status]);

  return { status, health, retry: check };
}
