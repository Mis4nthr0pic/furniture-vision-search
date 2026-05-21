import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { multerErrorHandler, upload } from "../middleware/upload.js";
import { parseLLMConfig } from "../schemas/llm.js";
import { parseRetrievalConfig } from "../schemas/retrieval.js";
import { SearchService } from "../services/search.service.js";
import { AppError } from "../utils/errors.js";
import { validateImageUpload } from "../utils/upload-mime.js";
import { parseBody, parseJsonField } from "../utils/validation.js";

const searchPayloadSchema = z.object({
  userPrompt: z.string().optional(),
  llmConfig: z.unknown(),
  retrievalConfig: z.unknown().optional(),
});

export const searchRouter = Router();

const searchRateLimit = createRateLimiter({
  name: "search",
  ...config.rateLimit.search,
});

searchRouter.post(
  "/",
  searchRateLimit,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        next(multerErrorHandler(err));
        return;
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError("MISSING_IMAGE", "Image file is required (field name: image)", 400);
      }

      const rawPayload = req.body.payload
        ? parseJsonField(req.body.payload)
        : {
            userPrompt: req.body.userPrompt,
            llmConfig: parseJsonField(req.body.llmConfig),
            retrievalConfig: req.body.retrievalConfig
              ? parseJsonField(req.body.retrievalConfig)
              : undefined,
          };

      const payload = parseBody(searchPayloadSchema, rawPayload);
      const llmConfig = parseLLMConfig(payload.llmConfig);
      const retrievalConfig = parseRetrievalConfig(payload.retrievalConfig ?? {});

      const mimeType = validateImageUpload(req.file.buffer, req.file.mimetype);
      const result = await SearchService.search({
        imageBuffer: req.file.buffer,
        mimeType,
        userPrompt: payload.userPrompt,
        llmConfig,
        retrievalConfig,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
