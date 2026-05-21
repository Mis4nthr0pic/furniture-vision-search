import { Router } from "express";
import { z } from "zod";
import { parseLLMConfig } from "../schemas/llm.js";
import { parseRetrievalConfig } from "../schemas/retrieval.js";
import { StaticEvalService } from "../services/eval-static.service.js";
import { parseBody } from "../utils/validation.js";

const runBodySchema = z.object({
  llmConfig: z.unknown(),
  retrievalConfig: z.unknown().optional(),
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
