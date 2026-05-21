import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it } from "vitest";
import { createRateLimiter, resetRateLimitersForTests } from "../middleware/rate-limit.js";
import type { AppError } from "../utils/errors.js";

function mockReq(ip = "127.0.0.1"): Request {
  return { ip, socket: { remoteAddress: ip } } as Request;
}

function runLimiter(
  limiter: ReturnType<typeof createRateLimiter>,
  ip = "127.0.0.1",
): Promise<void> {
  return new Promise((resolve, reject) => {
    limiter(
      mockReq(ip),
      {} as Response,
      ((err?: unknown) => {
        if (err) reject(err);
        else resolve();
      }) as NextFunction,
    );
  });
}

describe("createRateLimiter", () => {
  beforeEach(() => {
    resetRateLimitersForTests();
  });

  it("allows requests under the limit", async () => {
    const limiter = createRateLimiter({ name: "test", windowMs: 60_000, max: 2 });
    await expect(runLimiter(limiter)).resolves.toBeUndefined();
    await expect(runLimiter(limiter)).resolves.toBeUndefined();
  });

  it("blocks requests over the limit with 429", async () => {
    const limiter = createRateLimiter({ name: "test-block", windowMs: 60_000, max: 1 });
    await runLimiter(limiter);

    await expect(runLimiter(limiter)).rejects.toMatchObject({
      code: "RATE_LIMITED",
      httpStatus: 429,
    } satisfies Partial<AppError>);
  });

  it("tracks limits per IP", async () => {
    const limiter = createRateLimiter({ name: "test-ip", windowMs: 60_000, max: 1 });
    await runLimiter(limiter, "1.1.1.1");
    await expect(runLimiter(limiter, "2.2.2.2")).resolves.toBeUndefined();
  });
});
