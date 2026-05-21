import type { LLMConfig, VisionFeatures } from "../schemas/llm.js";
import type { RetrievalConfig } from "../schemas/retrieval.js";
import { EmbeddingsService } from "./embeddings.service.js";
import { retrieveTopK, toRankedResult, type Retriever } from "./retrieval.service.js";
import { VisionService } from "./vision.service.js";

export interface SearchTimings {
  visionMs: number;
  retrievalMs: number;
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
    visionFeatures: VisionFeatures;
    ranked: ReturnType<typeof toRankedResult>[];
    candidates: ReturnType<typeof toRankedResult>[];
    discarded: [];
    timings: SearchTimings;
    warnings: string[];
  }> {
    const started = Date.now();

    const visionStarted = Date.now();
    const visionFeatures = await VisionService.extractFeatures({
      imageBuffer: args.imageBuffer,
      mimeType: args.mimeType,
      llmConfig: args.llmConfig,
      userPrompt: args.userPrompt,
      systemPrompt: args.retrievalConfig.visionSystemPrompt,
    });
    const visionMs = Date.now() - visionStarted;

    const retriever =
      args.retriever ?? (await EmbeddingsService.ensureReady(args.llmConfig));

    const retrievalStarted = Date.now();
    const { results, warnings } = await retrieveTopK({
      vision: visionFeatures,
      userPrompt: args.userPrompt,
      config: args.retrievalConfig,
      retriever,
    });
    const retrievalMs = Date.now() - retrievalStarted;

    const candidates = results.map(toRankedResult);
    const ranked = candidates.slice(0, args.retrievalConfig.n);

    return {
      visionFeatures,
      ranked,
      candidates,
      discarded: [],
      timings: {
        visionMs,
        retrievalMs,
        totalMs: Date.now() - started,
      },
      warnings,
    };
  },
};
