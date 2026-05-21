import { useBackendHealth } from "../../hooks/useBackendHealth";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";

export function BackendStatusBanner() {
  const { status, retry } = useBackendHealth();

  if (status !== "offline") return null;

  return (
    <div className="border-b border-warn/30 bg-warn/5 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Alert tone="warning" title="Backend API may be offline">
          On Render free tier the API sleeps after ~15 minutes of inactivity. The first request can
          take 30–60 seconds. Locally, run <code className="text-ink">docker compose up</code> or
          keep the backend on port 4000. Open{" "}
          <a
            href="/api/health"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink underline decoration-warn/60 underline-offset-2"
          >
            /api/health
          </a>{" "}
          in a new tab and wait until you see <code className="text-ink">"ok": true</code>, then
          retry re-index or search.
        </Alert>
        <Button variant="secondary" onClick={() => void retry()} className="shrink-0 self-start">
          Check again
        </Button>
      </div>
    </div>
  );
}
