import type { LLMConfig, VisionFeatures } from "../schemas/llm.js";
import type { RetrievalConfig } from "../schemas/retrieval.js";
import { EmbeddingsService } from "./embeddings.service.js";
import { LiveEvalService } from "./eval-live.service.js";
import {
  type DiscardedSearchResult,
  type RankedSearchResult,
  RerankService,
} from "./rerank.service.js";
import { type Retriever, retrieveTopK, toRankedResult } from "./retrieval.service.js";
import { VisionService } from "./vision.service.js";

export interface SearchTimings {
  visionMs: number;
  retrievalMs: number;
  rerankMs: number;
  totalMs: number;
}

export const SearchService = {
  async search(args: {
    imageBuffer: Buffer;
    mimeType: string;
    userPrompt?: string;
    llmConfig: LLMConfig;
    retrievalConfig: RetrievalConfig;
    retriever?: Retriever;
  }): Promise<{
    searchId: string;
    visionFeatures: VisionFeatures;
    ranked: RankedSearchResult[];
    candidates: ReturnType<typeof toRankedResult>[];
    discarded: DiscardedSearchResult[];
    timings: SearchTimings;
    warnings: string[];
    rerank_error?: string;
  }> {
    const started = Date.now();
    const warnings: string[] = [];

    const visionStarted = Date.now();
    const visionFeatures = await VisionService.extractFeatures({
      imageBuffer: args.imageBuffer,
      mimeType: args.mimeType,
      llmConfig: args.llmConfig,
      userPrompt: args.userPrompt,
      systemPrompt: args.retrievalConfig.visionSystemPrompt,
    });
    const visionMs = Date.now() - visionStarted;

    const retriever = args.retriever ?? (await EmbeddingsService.ensureReady(args.llmConfig));

    const retrievalStarted = Date.now();
    const { results, warnings: retrievalWarnings } = await retrieveTopK({
      vision: visionFeatures,
      userPrompt: args.userPrompt,
      config: args.retrievalConfig,
      retriever,
    });
    const retrievalMs = Date.now() - retrievalStarted;
    warnings.push(...retrievalWarnings);

    const candidates = results.map(toRankedResult);
    let ranked: RankedSearchResult[] = candidates.slice(0, args.retrievalConfig.n);
    let discarded: DiscardedSearchResult[] = [];
    let rerankMs = 0;
    let rerank_error: string | undefined;

    if (args.retrievalConfig.enableRerank && candidates.length > 0) {
      const rerankStarted = Date.now();
      try {
        const rerankResult = await RerankService.rerank({
          imageBuffer: args.imageBuffer,
          mimeType: args.mimeType,
          visionFeatures,
          userPrompt: args.userPrompt,
          candidates,
          llmConfig: args.llmConfig,
          systemPrompt: args.retrievalConfig.rerankSystemPrompt,
          useImage: args.retrievalConfig.useImageInRerank,
        });
        ranked = rerankResult.ranked.slice(0, args.retrievalConfig.n);
        discarded = rerankResult.discarded;
      } catch (err) {
        rerank_error = err instanceof Error ? err.message : "Rerank failed";
        warnings.push(`rerank failed, using hybrid order: ${rerank_error}`);
      }
      rerankMs = Date.now() - rerankStarted;
    }

    const searchId = LiveEvalService.recordSearch({
      visionFeatures,
      userPrompt: args.userPrompt,
      resultIds: ranked.map((item) => item.id),
      configUsed: args.retrievalConfig,
    });

    return {
      searchId,
      visionFeatures,
      ranked,
      candidates,
      discarded,
      timings: {
        visionMs,
        retrievalMs,
        rerankMs,
        totalMs: Date.now() - started,
      },
      warnings,
      ...(rerank_error ? { rerank_error } : {}),
    };
  },
};
