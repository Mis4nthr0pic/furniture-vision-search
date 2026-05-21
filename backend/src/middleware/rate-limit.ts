import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  name: string;
}

function clientKey(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

export function createRateLimiter(options: RateLimitOptions) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = `${options.name}:${clientKey(req)}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > options.max) {
      next(
        new AppError(
          "RATE_LIMITED",
          `Too many requests — limit is ${options.max} per ${Math.round(options.windowMs / 1000)}s`,
          429,
        ),
      );
      return;
    }

    next();
  };
}

/** Test helper — clears in-memory counters between tests. */
export function resetRateLimitersForTests(): void {
  buckets.clear();
}
