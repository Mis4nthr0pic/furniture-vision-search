import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { initLexicalIndex } from "./catalog/lexical.js";
import { loadCatalog } from "./catalog/load.js";
import { connectMongo } from "./db/mongo.js";
import { adminRouter } from "./routes/admin.js";
import { lexicalRouter } from "./routes/lexical.js";
import { visionRouter } from "./routes/vision.js";
import { AppError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

export interface AppState {
  productCount: number;
  lexicalReady: boolean;
  embeddingsReady: boolean;
  mongoOk: boolean;
}

let appState: AppState = {
  productCount: 0,
  lexicalReady: false,
  embeddingsReady: false,
  mongoOk: false,
};

export function getAppState(): AppState {
  return appState;
}

export function setAppState(partial: Partial<AppState>): void {
  appState = { ...appState, ...partial };
}

export function createServer(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: appState.mongoOk,
      productCount: appState.productCount,
      lexicalReady: appState.lexicalReady,
      embeddingsReady: appState.embeddingsReady,
    });
  });

  app.use("/api/admin", adminRouter);
  app.use("/api/lexical", lexicalRouter);
  app.use("/api/vision", visionRouter);

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

export async function bootstrap(): Promise<void> {
  try {
    const db = await connectMongo();
    const products = await loadCatalog(db);
    initLexicalIndex(products);
    setAppState({
      mongoOk: true,
      productCount: products.length,
      lexicalReady: true,
    });
  } catch (err) {
    logger.error({ err }, "Failed to bootstrap catalog — health will report ok=false");
    setAppState({ mongoOk: false, productCount: 0 });
  }
}
