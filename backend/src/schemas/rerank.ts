import { z } from "zod";

export const rerankItemSchema = z.object({
  id: z.string(),
  score: z.number().min(0).max(1),
  reason: z.string(),
});

export const rerankDiscardedSchema = z.object({
  id: z.string(),
  reason: z.string(),
});

export const rerankResponseSchema = z.object({
  ranked: z.array(rerankItemSchema),
  discarded: z.array(rerankDiscardedSchema).default([]),
});

export type RerankItem = z.infer<typeof rerankItemSchema>;
export type RerankDiscarded = z.infer<typeof rerankDiscardedSchema>;
export type RerankResponse = z.infer<typeof rerankResponseSchema>;

export function parseRerankResponse(input: unknown): RerankResponse {
  return rerankResponseSchema.parse(input);
}
