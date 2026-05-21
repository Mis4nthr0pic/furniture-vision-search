import { getCatalogVocab } from "../catalog/load.js";
import { createOpenAICompatibleClient } from "../llm/openai-compatible.js";
import { buildVisionSystemPrompt, buildVisionUserPrompt } from "../llm/prompts.js";
import type { LLMConfig, VisionFeatures } from "../schemas/llm.js";
import { parseVisionFeatures } from "../schemas/llm.js";
import { AppError } from "../utils/errors.js";
import { extractJsonFromText } from "../utils/json-parse.js";

export async function extractVisionFeatures(args: {
  imageBuffer: Buffer;
  mimeType: string;
  llmConfig: LLMConfig;
  userPrompt?: string;
  systemPrompt?: string;
}): Promise<VisionFeatures> {
  const { vocab } = getCatalogVocab();
  const systemPrompt = args.systemPrompt ?? buildVisionSystemPrompt(vocab);
  const userPrompt = buildVisionUserPrompt(args.userPrompt);

  const client = createOpenAICompatibleClient(args.llmConfig);

  let raw: unknown;
  try {
    raw = await client.vision({
      imageBase64: args.imageBuffer.toString("base64"),
      mimeType: args.mimeType,
      systemPrompt,
      userPrompt,
    });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      "VISION_FAILED",
      err instanceof Error ? err.message : "Vision extraction failed",
      502,
    );
  }

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = extractJsonFromText(raw);
    } catch {
      throw new AppError("VISION_PARSE_ERROR", "Vision model returned invalid JSON", 422);
    }
  }

  try {
    return parseVisionFeatures(parsed);
  } catch {
    throw new AppError(
      "VISION_VALIDATION_ERROR",
      "Vision model JSON did not match expected schema",
      422,
    );
  }
}
