import { z } from "zod";
import { getLLMDefaults } from "../config.js";

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
    .optional(),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1).max(15),
  confidence: z.object({
    category: z.number().min(0).max(1),
    type: z.number().min(0).max(1),
    color: z.number().min(0).max(1),
    style: z.number().min(0).max(1),
  }),
});

export type VisionFeatures = z.infer<typeof visionFeaturesSchema>;

export function parseLLMConfig(input: unknown): LLMConfig {
  const partial = typeof input === "object" && input !== null ? input : {};
  return llmConfigSchema.parse({ ...llmDefaults, ...partial });
}

export function parseVisionFeatures(input: unknown): VisionFeatures {
  return visionFeaturesSchema.parse(input);
}
