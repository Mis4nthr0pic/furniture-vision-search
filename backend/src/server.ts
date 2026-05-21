import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { bootstrapApplication } from "./app/bootstrap.js";
import { getAppState } from "./app/state.js";
import { config } from "../config.js";
import { adminRouter } from "./routes/admin.js";
import { evalRouter } from "./routes/eval.js";
import { lexicalRouter } from "./routes/lexical.js";
import { searchRouter } from "./routes/search.js";
import { visionRouter } from "./routes/vision.js";
import { AppError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

export function createServer(): express.Application {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: config.cors.origin === "*" ? true : config.cors.origin,
    }),
  );
  app.use(express.json({ limit: config.http.jsonBodyLimit }));

  app.get("/api/health", (_req, res) => {
    const appState = getAppState();
    res.json({
      ok: appState.mongoOk,
      productCount: appState.productCount,
      lexicalReady: appState.lexicalReady,
      embeddingsReady: appState.embeddingsReady,
    });
  });

  app.use("/api/admin", adminRouter);
  if (!config.security.disableDebugRoutes) {
    app.use("/api/lexical", lexicalRouter);
    app.use("/api/vision", visionRouter);
  }
  app.use("/api/search", searchRouter);
  app.use("/api/eval", evalRouter);

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

export async function startServer(): Promise<void> {
  await bootstrapApplication();
}
