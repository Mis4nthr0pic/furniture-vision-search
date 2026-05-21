import type { LLMClient } from "../llm/client.js";
import type { Retriever } from "./retrieval.service.js";

export interface EmbeddingsCacheFile {
  catalogHash: string;
  createdAt: string;
  model: string;
  vectors: Record<string, number[]>;
}

export class CachedEmbeddingRetriever implements Retriever {
  constructor(
    private readonly vectors: Record<string, number[]>,
    private readonly client: LLMClient,
  ) {}

  isAvailable(): boolean {
    return Object.keys(this.vectors).length > 0;
  }

  getProductVector(productId: string): number[] | null {
    return this.vectors[productId] ?? null;
  }

  async getQueryVector(text: string): Promise<number[] | null> {
    const embeddings = await this.client.embed({ input: text });
    return embeddings[0] ?? null;
  }
}
