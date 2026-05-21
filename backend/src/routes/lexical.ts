import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { LexicalService } from "../services/lexical.service.js";
import { parseBody } from "../utils/validation.js";

const debugBodySchema = z.object({
  query: z.string().min(1),
  limit: z
    .number()
    .int()
    .min(1)
    .max(config.lexical.maxLimit)
    .optional()
    .default(config.lexical.defaultLimit),
});

export const lexicalRouter = Router();

lexicalRouter.post("/debug", (req, res) => {
  const { query, limit } = parseBody(debugBodySchema, req.body);
  const results = LexicalService.debugSearch(query, limit);
  res.json({ query, count: results.length, results });
});
