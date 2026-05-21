import { Router } from "express";
import { z } from "zod";
import { parseLLMConfig } from "../schemas/llm.js";
import { parseRetrievalConfig } from "../schemas/retrieval.js";
import { LiveEvalService } from "../services/eval-live.service.js";
import { StaticEvalService } from "../services/eval-static.service.js";
import { parseBody } from "../utils/validation.js";

const runBodySchema = z.object({
  llmConfig: z.unknown(),
  retrievalConfig: z.unknown().optional(),
});

const rateBodySchema = z.object({
  searchId: z.string().min(1),
  productId: z.string().min(1),
  relevant: z.boolean(),
});

export const evalRouter = Router();

evalRouter.post("/run", async (req, res, next) => {
  try {
    const body = parseBody(runBodySchema, req.body);
    const llmConfig = parseLLMConfig(body.llmConfig);
    const retrievalConfig = parseRetrievalConfig(body.retrievalConfig ?? {});

    const result = await StaticEvalService.run({ llmConfig, retrievalConfig });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

evalRouter.post("/rate", (req, res, next) => {
  try {
    const body = parseBody(rateBodySchema, req.body);
    const log = LiveEvalService.rate(body);
    res.json({ ok: true, searchId: log.id, ratings: log.ratings });
  } catch (err) {
    next(err);
  }
});

evalRouter.get("/metrics", (_req, res) => {
  res.json(LiveEvalService.getMetrics());
});

evalRouter.get("/logs", (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json({ logs: LiveEvalService.getLogs(Number.isFinite(limit) ? limit : 50) });
});
