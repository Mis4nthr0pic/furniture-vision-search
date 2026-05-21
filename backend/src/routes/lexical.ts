import { Router } from "express";
import { z } from "zod";
import { searchLexical, isLexicalReady } from "../catalog/lexical.js";
import { AppError } from "../utils/errors.js";

const debugBodySchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export const lexicalRouter = Router();

lexicalRouter.post("/debug", (req, res) => {
  if (!isLexicalReady()) {
    throw new AppError("LEXICAL_NOT_READY", "Lexical index is not ready", 503);
  }

  const parsed = debugBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError("VALIDATION_ERROR", parsed.error.errors[0]?.message ?? "Invalid request", 400);
  }

  const { query, limit } = parsed.data;
  const results = searchLexical(query, limit);

  res.json({ query, count: results.length, results });
});
