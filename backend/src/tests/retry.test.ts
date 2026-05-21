import { describe, expect, it, vi } from "vitest";
import { AppError } from "../utils/errors.js";
import {
  computeRetryDelayMs,
  isRateLimitError,
  parseRetryAfterMs,
  retryWithBackoff,
} from "../utils/retry.js";

describe("retry utils", () => {
  it("parses Retry-After seconds", () => {
    expect(parseRetryAfterMs("2")).toBe(2000);
  });

  it("computes exponential backoff with cap", () => {
    expect(
      computeRetryDelayMs({ attempt: 3, baseMs: 1000, maxMs: 5000, retryAfterMs: null }),
    ).toBeLessThanOrEqual(5000);
  });

  it("prefers Retry-After delay when provided", () => {
    expect(computeRetryDelayMs({ attempt: 1, baseMs: 1000, maxMs: 5000, retryAfterMs: 3500 })).toBe(
      3500,
    );
  });

  it("detects rate limit errors", () => {
    expect(isRateLimitError(new AppError("LLM_RATE_LIMITED", "slow down", 429))).toBe(true);
    expect(isRateLimitError(new AppError("LLM_PROVIDER_ERROR", "rate limit exceeded", 400))).toBe(
      true,
    );
  });

  it("retries until success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new AppError("LLM_RATE_LIMITED", "429", 429))
      .mockResolvedValueOnce("ok");

    const result = await retryWithBackoff(fn, {
      maxAttempts: 3,
      baseDelayMs: 1,
      maxDelayMs: 5,
      shouldRetry: isRateLimitError,
    });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
