import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { AppError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

export function createServer(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.httpStatus).json({ error: { code: err.code, message: err.message } });
      return;
    }

    logger.error({ err }, "Unhandled error");
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    });
  });

  return app;
}
