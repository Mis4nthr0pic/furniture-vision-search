import { AppError } from "./errors.js";

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const dateMs = Date.parse(value);
  if (Number.isFinite(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }

  return null;
}

export function computeRetryDelayMs(args: {
  attempt: number;
  baseMs: number;
  maxMs: number;
  retryAfterMs?: number | null;
}): number {
  if (args.retryAfterMs != null && args.retryAfterMs > 0) {
    return Math.min(args.retryAfterMs, args.maxMs);
  }

  const exponential = args.baseMs * 2 ** Math.max(0, args.attempt - 1);
  const jitter = Math.floor(Math.random() * Math.min(500, args.baseMs));
  return Math.min(args.maxMs, exponential + jitter);
}

export function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof AppError)) return false;
  if (err.code === "LLM_RATE_LIMITED" || err.httpStatus === 429) return true;

  const message = err.message.toLowerCase();
  return message.includes("rate limit") || message.includes("too many requests");
}

export function isTransientProviderError(err: unknown): boolean {
  if (!(err instanceof AppError)) return false;
  if (isRateLimitError(err)) return true;
  return err.httpStatus === 502 || err.httpStatus === 503;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    shouldRetry: (err: unknown, attempt: number) => boolean;
    onRetry?: (info: { attempt: number; delayMs: number; err: unknown }) => void | Promise<void>;
  },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= options.maxAttempts || !options.shouldRetry(err, attempt)) {
        throw err;
      }

      const retryAfterMs =
        err instanceof AppError ? err.retryAfterMs ?? null : null;
      const delayMs = computeRetryDelayMs({
        attempt,
        baseMs: options.baseDelayMs,
        maxMs: options.maxDelayMs,
        retryAfterMs,
      });

      await options.onRetry?.({ attempt, delayMs, err });
      await sleep(delayMs);
    }
  }

  throw lastError;
}
