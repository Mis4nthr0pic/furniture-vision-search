import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "apiKey",
      "authorization",
      "bearer",
      "api-key",
      "x-api-key",
      "req.headers.authorization",
      "req.headers['x-api-key']",
      "llmConfig.apiKey",
    ],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
