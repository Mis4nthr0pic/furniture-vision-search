import { z } from "zod";

export const scoreWeightsSchema = z.object({
  w_vec: z.number().min(0).max(1).default(0.25),
  w_lex: z.number().min(0).max(1).default(0.2),
  w_cat: z.number().min(0).max(1).default(0.15),
  w_type: z.number().min(0).max(1).default(0.15),
  w_color: z.number().min(0).max(1).default(0.15),
  w_style: z.number().min(0).max(1).default(0.05),
  w_mat: z.number().min(0).max(1).default(0),
  w_dim: z.number().min(0).max(1).default(0.05),
});

export const retrievalConfigSchema = z.object({
  mode: z.enum(["hybrid", "vector_only", "lexical_only", "filter_only"]).default("hybrid"),
  k: z.number().int().min(1).max(500).default(30),
  n: z.number().int().min(1).max(100).default(10),
  filterMode: z.enum(["auto", "strict", "off"]).default("auto"),
  confidenceThreshold: z.number().min(0).max(1).default(0.7),
  weights: scoreWeightsSchema.default({}),
  priceTolerancePercent: z.number().min(0).max(100).optional(),
  enableRerank: z.boolean().default(false),
  useImageInRerank: z.boolean().default(true),
  visionSystemPrompt: z.string().optional(),
  rerankSystemPrompt: z.string().optional(),
});

export type ScoreWeights = z.infer<typeof scoreWeightsSchema>;
export type RetrievalConfig = z.infer<typeof retrievalConfigSchema>;

export function parseRetrievalConfig(input: unknown): RetrievalConfig {
  const partial = typeof input === "object" && input !== null ? input : {};
  return retrievalConfigSchema.parse(partial);
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  w_vec: 0.25,
  w_lex: 0.2,
  w_cat: 0.15,
  w_type: 0.15,
  w_color: 0.15,
  w_style: 0.05,
  w_mat: 0,
  w_dim: 0.05,
};
