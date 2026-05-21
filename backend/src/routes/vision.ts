import { Router } from "express";
import { z } from "zod";
import { multerErrorHandler, upload } from "../middleware/upload.js";
import { parseLLMConfig } from "../schemas/llm.js";
import { VisionService } from "../services/vision.service.js";
import { AppError } from "../utils/errors.js";
import { assertAllowedImageMime } from "../utils/upload-mime.js";
import { parseBody, parseJsonField } from "../utils/validation.js";

const debugBodySchema = z.object({
  llmConfig: z.unknown(),
  userPrompt: z.string().optional(),
  systemPrompt: z.string().optional(),
});

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

    const payload = parseBody(debugBodySchema, rawPayload);
    const llmConfig = parseLLMConfig(payload.llmConfig);
    const mimeType = assertAllowedImageMime(req.file.mimetype);

    const features = await VisionService.extractFeatures({
      imageBuffer: req.file.buffer,
      mimeType,
      llmConfig,
      userPrompt: payload.userPrompt,
      systemPrompt: payload.systemPrompt,
    });

    res.json({ visionFeatures: features });
  } catch (err) {
    next(err);
  }
});
