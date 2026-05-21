import { z } from "zod";
import { getDevLLMApiKey, getLLMDefaults } from "../config.js";

const llmDefaults = getLLMDefaults();

export const llmConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url().default(llmDefaults.baseUrl),
  visionModel: z.string().default(llmDefaults.visionModel),
  embedModel: z.string().default(llmDefaults.embedModel),
  chatModel: z.string().default(llmDefaults.chatModel),
  embedBaseUrl: z.string().url().optional(),
});

export type LLMConfig = z.infer<typeof llmConfigSchema>;

const confidenceScoreSchema = z.number().min(0).max(1);

export const visionConfidenceSchema = z.object({
  category: confidenceScoreSchema,
  type: confidenceScoreSchema,
  color: confidenceScoreSchema,
  style: confidenceScoreSchema,
});

export const visionFeaturesSchema = z.object({
  category: z.string().nullish(),
  type: z.string().nullish(),
  style: z.string().nullish(),
  color: z.string().nullish(),
  material: z.string().nullish(),
  est_dimensions: z
    .object({
      width_cm: z.number().optional(),
      height_cm: z.number().optional(),
      depth_cm: z.number().optional(),
    })
    .nullish(),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1).max(15),
  confidence: visionConfidenceSchema,
});

export type VisionFeatures = z.infer<typeof visionFeaturesSchema>;

function clampConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Tolerant normalization before zod — models often return null confidence fields. */
export function normalizeVisionInput(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;

  const raw = { ...(input as Record<string, unknown>) };

  if (typeof raw.confidence === "number") {
    const score = clampConfidence(raw.confidence);
    raw.confidence = { category: score, type: score, color: score, style: score };
  } else if (raw.confidence && typeof raw.confidence === "object") {
    const conf = raw.confidence as Record<string, unknown>;
    raw.confidence = {
      category: clampConfidence(conf.category),
      type: clampConfidence(conf.type),
      color: clampConfidence(conf.color),
      style: clampConfidence(conf.style),
    };
  } else {
    raw.confidence = { category: 0, type: 0, color: 0, style: 0 };
  }

  if (!Array.isArray(raw.keywords) || raw.keywords.length === 0) {
    const desc = typeof raw.description === "string" ? raw.description : "";
    raw.keywords = desc
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2)
      .slice(0, 10);
  }

  return raw;
}

export function resolveLLMApiKey(partial: { apiKey?: string }): string | undefined {
  if (partial.apiKey?.trim()) return partial.apiKey.trim();
  return getDevLLMApiKey();
}

export function parseLLMConfig(input: unknown): LLMConfig {
  const partial = typeof input === "object" && input !== null ? input : {};
  const apiKey = resolveLLMApiKey(partial as { apiKey?: string });
  return llmConfigSchema.parse({ ...llmDefaults, ...partial, apiKey });
}

export function parseVisionFeatures(input: unknown): VisionFeatures {
  return visionFeaturesSchema.parse(normalizeVisionInput(input));
}
