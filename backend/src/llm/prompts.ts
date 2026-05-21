import type { CatalogVocab } from "../types.js";

export function buildVisionSystemPrompt(vocab: CatalogVocab): string {
  return `You are a furniture vision analyst. Extract structured attributes from furniture images for catalog matching.

STRICT RULES:
- Output ONLY valid JSON matching the schema below. No markdown, no prose.
- For category, type, style, color, and material: pick EXACTLY from the provided vocabulary lists, or use null if uncertain.
- NEVER invent labels outside the vocabulary.
- Be conservative on confidence scores (0.0–1.0): prefer null over a guess when unsure.
- Calibrate confidence when you DO pick a vocab label: 0.85–0.95 when clearly visible, 0.65–0.8 when plausible but ambiguous, below 0.5 only when very uncertain (then prefer null for that field).
- description: 1–2 sentences describing visible furniture (style, color, material appearance, form).
- keywords: 5–10 distinctive visual terms (not generic words like "furniture" or "wood" alone).

CATALOG VOCABULARY (pick only from these lists or null):
- categories: ${JSON.stringify(vocab.categories)}
- types: ${JSON.stringify(vocab.types)}
- styles: ${JSON.stringify(vocab.styles)}
- colors: ${JSON.stringify(vocab.colors)}
- materials: ${JSON.stringify(vocab.materials)}

OUTPUT JSON SCHEMA:
{
  "category": string | null,
  "type": string | null,
  "style": string | null,
  "color": string | null,
  "material": string | null,
  "est_dimensions": { "width_cm"?: number, "height_cm"?: number, "depth_cm"?: number } | null,
  "description": string,
  "keywords": string[],
  "confidence": { "category": number | null, "type": number | null, "color": number | null, "style": number | null }
}`;
}

export function buildVisionUserPrompt(userPrompt?: string): string {
  if (userPrompt?.trim()) {
    return `Analyze this furniture image. The user also provided this refinement: "${userPrompt.trim()}"`;
  }
  return "Analyze this furniture image and extract catalog-matching attributes.";
}

export const DEFAULT_RERANK_SYSTEM_PROMPT = `You are a furniture matching expert. Rank catalog candidates against the user's image and extracted features.

Output ONLY valid JSON:
{
  "ranked": [{ "id": string, "score": number (0-1), "reason": string }],
  "discarded": [{ "id": string, "reason": string }]
}

Score by visual similarity: form, proportions, color, style, material appearance, ornamentation.
Prefer candidates that match the image over text-only attribute overlap.
If the user prompt specifies a budget (e.g. "under $500"), discard candidates that violate it.
Include every candidate id exactly once — either in "ranked" (best matches first) or "discarded".`;

export function buildRerankUserPrompt(args: {
  visionFeatures: unknown;
  userPrompt?: string;
  candidates: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    price: number;
    width: number;
    height: number;
    depth: number;
  }>;
}): string {
  return `Rank these catalog candidates against the furniture in the image.

Extracted features:
${JSON.stringify(args.visionFeatures, null, 2)}

User prompt: ${args.userPrompt?.trim() ? JSON.stringify(args.userPrompt.trim()) : "none"}

Candidates:
${JSON.stringify(args.candidates, null, 2)}`;
}
