import { Router } from "express";
import { z } from "zod";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { config } from "../config.js";
import { CatalogService } from "../services/catalog.service.js";
import { EmbeddingsService } from "../services/embeddings.service.js";
import { parseLLMConfig } from "../schemas/llm.js";
import { AppError } from "../utils/errors.js";
import { parseBody } from "../utils/validation.js";

const reindexBodySchema = z.object({
  llmConfig: z.unknown(),
});

export const adminRouter = Router();

const reindexRateLimit = createRateLimiter({
  name: "reindex",
  ...config.rateLimit.reindex,
});

adminRouter.get("/catalog-meta", (_req, res) => {
  res.json(CatalogService.getMeta());
});

adminRouter.get("/reindex-progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (payload: unknown) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  send(EmbeddingsService.getStatus());

  const unsubscribe = EmbeddingsService.subscribeProgress((event) => {
    send(event);
    if (event.phase === "done" || event.phase === "error") {
      send(EmbeddingsService.getStatus());
    }
  });

  req.on("close", () => {
    unsubscribe();
    res.end();
  });
});

adminRouter.post("/reindex", reindexRateLimit, async (req, res, next) => {
  try {
    const body = parseBody(reindexBodySchema, req.body);
    const llmConfig = parseLLMConfig(body.llmConfig);

    if (!llmConfig.apiKey) {
      throw new AppError("MISSING_API_KEY", "API key is required to rebuild embeddings", 400);
    }

    await EmbeddingsService.buildIndex(llmConfig);
    res.json({
      ok: true,
      status: EmbeddingsService.getStatus(),
    });
  } catch (err) {
    next(err);
  }
});
