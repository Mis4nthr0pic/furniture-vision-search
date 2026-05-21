import type { z } from "zod";
import { AppError } from "./errors.js";

export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      parsed.error.errors[0]?.message ?? "Invalid request",
      400,
    );
  }
  return parsed.data;
}

export function parseJsonField(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new AppError("INVALID_JSON", "Request payload must be valid JSON", 400);
  }
}
