import pino from "pino";
import { config } from "../config.js";

export const logger = pino({
  level: config.logLevel,
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
  transport: !config.isProduction ? { target: "pino-pretty", options: { colorize: true } } : undefined,
});
