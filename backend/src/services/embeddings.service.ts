import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setAppState } from "../app/state.js";
import { getCatalogProducts } from "../catalog/load.js";
import { createOpenAICompatibleClient } from "../llm/openai-compatible.js";
import type { LLMConfig } from "../schemas/llm.js";
import { computeCatalogHash, embeddingText } from "../utils/catalog-hash.js";
import { logger } from "../utils/logger.js";
import { CachedEmbeddingRetriever, type EmbeddingsCacheFile } from "./embedding-retriever.js";
import type { Retriever } from "./retrieval.service.js";
import { NullRetriever } from "./retrieval.service.js";

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data");
const cachePath = path.join(dataDir, "embeddings.json");

export interface EmbeddingsProgress {
  phase: "start" | "embedding" | "writing" | "done" | "error";
  current: number;
  total: number;
  message?: string;
}

export interface EmbeddingsStatus {
  ready: boolean;
  itemCount: number;
  lastIndexed: string | null;
  catalogHash: string | null;
  catalogHashMatch: boolean;
  model: string | null;
}

type ProgressListener = (event: EmbeddingsProgress) => void;

let inMemoryCache: EmbeddingsCacheFile | null = null;
let buildPromise: Promise<void> | null = null;
const progressListeners = new Set<ProgressListener>();

function emitProgress(event: EmbeddingsProgress): void {
  for (const listener of progressListeners) {
    listener(event);
  }
}

function ensureDataDir(): void {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

function syncAppState(status: EmbeddingsStatus): void {
  setAppState({ embeddingsReady: status.ready });
}

function parseCacheFile(raw: string): EmbeddingsCacheFile {
  return JSON.parse(raw) as EmbeddingsCacheFile;
}

export const EmbeddingsService = {
  getCachePath(): string {
    return cachePath;
  },

  subscribeProgress(listener: ProgressListener): () => void {
    progressListeners.add(listener);
    return () => progressListeners.delete(listener);
  },

  getStatus(): EmbeddingsStatus {
    const currentHash = computeCatalogHash(getCatalogProducts());
    const cache = inMemoryCache;

    if (!cache) {
      return {
        ready: false,
        itemCount: 0,
        lastIndexed: null,
        catalogHash: currentHash,
        catalogHashMatch: false,
        model: null,
      };
    }

    const hashMatch = cache.catalogHash === currentHash;
    const itemCount = Object.keys(cache.vectors).length;

    return {
      ready: hashMatch && itemCount > 0,
      itemCount,
      lastIndexed: cache.createdAt,
      catalogHash: currentHash,
      catalogHashMatch: hashMatch,
      model: cache.model,
    };
  },

  tryLoadFromDisk(): boolean {
    if (!existsSync(cachePath)) {
      inMemoryCache = null;
      syncAppState(EmbeddingsService.getStatus());
      return false;
    }

    try {
      const cache = parseCacheFile(readFileSync(cachePath, "utf-8"));
      inMemoryCache = cache;
      syncAppState(EmbeddingsService.getStatus());
      logger.info(
        { itemCount: Object.keys(cache.vectors).length, createdAt: cache.createdAt },
        "Embeddings cache loaded from disk",
      );
      return EmbeddingsService.getStatus().ready;
    } catch (err) {
      logger.error({ err }, "Failed to load embeddings cache");
      inMemoryCache = null;
      syncAppState(EmbeddingsService.getStatus());
      return false;
    }
  },

  createRetriever(llmConfig: LLMConfig): Retriever {
    const status = EmbeddingsService.getStatus();
    if (!status.ready || !inMemoryCache) {
      return new NullRetriever();
    }

    const client = createOpenAICompatibleClient(llmConfig);
    return new CachedEmbeddingRetriever(inMemoryCache.vectors, client);
  },

  async ensureReady(llmConfig: LLMConfig): Promise<Retriever> {
    if (EmbeddingsService.getStatus().ready) {
      return EmbeddingsService.createRetriever(llmConfig);
    }

    if (!llmConfig.apiKey) {
      return new NullRetriever();
    }

    try {
      await EmbeddingsService.buildIndex(llmConfig);
      if (EmbeddingsService.getStatus().ready) {
        return EmbeddingsService.createRetriever(llmConfig);
      }
    } catch (err) {
      logger.error({ err }, "Embeddings build failed");
    }

    return new NullRetriever();
  },

  async buildIndex(llmConfig: LLMConfig): Promise<void> {
    if (buildPromise) {
      await buildPromise;
      return;
    }

    buildPromise = EmbeddingsService.runBuild(llmConfig).finally(() => {
      buildPromise = null;
    });

    await buildPromise;
  },

  async runBuild(llmConfig: LLMConfig): Promise<void> {
    const products = getCatalogProducts();
    const catalogHash = computeCatalogHash(products);
    const client = createOpenAICompatibleClient(llmConfig);
    const batchSize = 100;
    const vectors: Record<string, number[]> = {};

    emitProgress({
      phase: "start",
      current: 0,
      total: products.length,
      message: "Starting embedding build",
    });

    try {
      for (let offset = 0; offset < products.length; offset += batchSize) {
        const batch = products.slice(offset, offset + batchSize);
        const texts = batch.map(embeddingText);
        const embeddings = await client.embed({ input: texts });

        batch.forEach((product, index) => {
          const vector = embeddings[index];
          if (vector) {
            vectors[product._id] = vector;
          }
        });

        emitProgress({
          phase: "embedding",
          current: Math.min(offset + batch.length, products.length),
          total: products.length,
        });
      }

      emitProgress({
        phase: "writing",
        current: products.length,
        total: products.length,
        message: "Writing cache file",
      });

      const cache: EmbeddingsCacheFile = {
        catalogHash,
        createdAt: new Date().toISOString(),
        model: llmConfig.embedModel,
        vectors,
      };

      ensureDataDir();
      writeFileSync(cachePath, JSON.stringify(cache), "utf-8");
      inMemoryCache = cache;
      syncAppState(EmbeddingsService.getStatus());

      emitProgress({
        phase: "done",
        current: products.length,
        total: products.length,
        message: "Embeddings index ready",
      });

      logger.info({ itemCount: Object.keys(vectors).length }, "Embeddings index built");
    } catch (err) {
      emitProgress({
        phase: "error",
        current: 0,
        total: products.length,
        message: err instanceof Error ? err.message : "Embedding build failed",
      });
      throw err;
    }
  },
};
