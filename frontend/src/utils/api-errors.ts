export const BACKEND_OFFLINE_MESSAGE =
  'Cannot reach the backend API. Local: run `docker compose up` (or backend on :4000 + frontend on :5173). Render: open /api/health in a new tab and wait for "ok": true.';

export function isGatewayHtml(body: string): boolean {
  const trimmed = body.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}

export function isNetworkFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    err.name === "TypeError" ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed")
  );
}
