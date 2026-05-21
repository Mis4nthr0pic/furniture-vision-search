import { createOpenAICompatibleClient } from "../llm/openai-compatible.js";
import { DEFAULT_RERANK_SYSTEM_PROMPT, buildRerankUserPrompt } from "../llm/prompts.js";
import type { LLMConfig, VisionFeatures } from "../schemas/llm.js";
import { type RerankResponse, parseRerankResponse } from "../schemas/rerank.js";
import { extractJsonFromText } from "../utils/json-parse.js";
import { logger } from "../utils/logger.js";
import type { toRankedResult } from "./retrieval.service.js";

export type RankedSearchResult = ReturnType<typeof toRankedResult> & {
  reason?: string;
  rerankScore?: number;
};

export interface DiscardedSearchResult {
  id: string;
  title: string;
  category: string;
  type: string;
  reason: string;
}

function toRerankCandidate(result: ReturnType<typeof toRankedResult>) {
  return {
    id: result.id,
    title: result.title,
    description: result.description,
    category: result.category,
    type: result.type,
    price: result.price,
    width: result.width,
    height: result.height,
    depth: result.depth,
  };
}

export function applyRerankOrder(
  response: RerankResponse,
  candidates: ReturnType<typeof toRankedResult>[],
): { ranked: RankedSearchResult[]; discarded: DiscardedSearchResult[] } {
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const seen = new Set<string>();

  const ranked: RankedSearchResult[] = [];
  for (const item of response.ranked) {
    const candidate = byId.get(item.id);
    if (!candidate || seen.has(item.id)) continue;
    seen.add(item.id);
    ranked.push({
      ...candidate,
      rerankScore: item.score,
      reason: item.reason,
    });
  }

  const discarded: DiscardedSearchResult[] = [];
  for (const item of response.discarded) {
    const candidate = byId.get(item.id);
    if (!candidate || seen.has(item.id)) continue;
    seen.add(item.id);
    discarded.push({
      id: candidate.id,
      title: candidate.title,
      category: candidate.category,
      type: candidate.type,
      reason: item.reason,
    });
  }

  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue;
    ranked.push({ ...candidate });
  }

  return { ranked, discarded };
}

async function callRerankModel(args: {
  imageBuffer: Buffer;
  mimeType: string;
  visionFeatures: VisionFeatures;
  userPrompt?: string;
  candidates: ReturnType<typeof toRankedResult>[];
  llmConfig: LLMConfig;
  systemPrompt: string;
  useImage: boolean;
}): Promise<RerankResponse> {
  const client = createOpenAICompatibleClient(args.llmConfig);
  const userPrompt = buildRerankUserPrompt({
    visionFeatures: args.visionFeatures,
    userPrompt: args.userPrompt,
    candidates: args.candidates.map(toRerankCandidate),
  });

  const text = await client.chat({
    messages: [
      { role: "system", content: args.systemPrompt },
      { role: "user", content: userPrompt },
    ],
    images: args.useImage
      ? [{ base64: args.imageBuffer.toString("base64"), mimeType: args.mimeType }]
      : undefined,
    jsonMode: true,
  });

  const parsed = extractJsonFromText(text);
  return parseRerankResponse(parsed);
}

export const RerankService = {
  async rerank(args: {
    imageBuffer: Buffer;
    mimeType: string;
    visionFeatures: VisionFeatures;
    userPrompt?: string;
    candidates: ReturnType<typeof toRankedResult>[];
    llmConfig: LLMConfig;
    systemPrompt?: string;
    useImage: boolean;
  }): Promise<{ ranked: RankedSearchResult[]; discarded: DiscardedSearchResult[] }> {
    const systemPrompt = args.systemPrompt ?? DEFAULT_RERANK_SYSTEM_PROMPT;

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await callRerankModel({ ...args, systemPrompt });
        return applyRerankOrder(response, args.candidates);
      } catch (err) {
        lastError = err;
        logger.warn({ err, attempt: attempt + 1 }, "Rerank parse or validation failed");
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Rerank failed");
  },
};
