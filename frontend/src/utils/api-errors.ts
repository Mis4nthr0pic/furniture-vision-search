export const BACKEND_OFFLINE_MESSAGE =
  'Backend unavailable (Render free tier may be waking up). Open /api/health in a new tab, wait for "ok": true, then retry.';

export function isGatewayHtml(body: string): boolean {
  const trimmed = body.trimStart().toLowerCase();
  return trimmed.startsWith("<!doctype") || trimmed.startsWith("<html");
}
