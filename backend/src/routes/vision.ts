import { Router } from "express";
import { z } from "zod";
import { multerErrorHandler, upload } from "../middleware/upload.js";
import { parseLLMConfig } from "../schemas/llm.js";
import { extractVisionFeatures } from "../services/vision.js";
import { AppError } from "../utils/errors.js";

const debugBodySchema = z.object({
  llmConfig: z.unknown(),
  userPrompt: z.string().optional(),
  systemPrompt: z.string().optional(),
});

function parseJsonField(value: unknown): unknown {
  if (typeof value === "string") {
    return JSON.parse(value);
  }
  return value;
}

export const visionRouter = Router();

visionRouter.post("/debug", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      next(multerErrorHandler(err));
      return;
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("MISSING_IMAGE", "Image file is required (field name: image)", 400);
    }

    const rawPayload = req.body.payload
      ? parseJsonField(req.body.payload)
      : {
          llmConfig: parseJsonField(req.body.llmConfig),
          userPrompt: req.body.userPrompt,
          systemPrompt: req.body.systemPrompt,
        };

    const payload = debugBodySchema.parse(rawPayload);
    const llmConfig = parseLLMConfig(payload.llmConfig);
    const mimeType = req.file.mimetype || "image/jpeg";

    const features = await extractVisionFeatures({
      imageBuffer: req.file.buffer,
      mimeType,
      llmConfig,
      userPrompt: payload.userPrompt,
      systemPrompt: payload.systemPrompt,
    });

    res.json({ visionFeatures: features });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new AppError("VALIDATION_ERROR", err.errors[0]?.message ?? "Invalid request", 400));
      return;
    }
    next(err);
  }
});
