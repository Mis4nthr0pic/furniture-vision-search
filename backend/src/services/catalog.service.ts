import { getCatalogProducts, getCatalogVocab } from "../catalog/load.js";
import { EmbeddingsService } from "../services/embeddings.service.js";
import type { CatalogMeta } from "../types.js";

export const CatalogService = {
  getMeta(): CatalogMeta {
    const products = getCatalogProducts();
    const { vocab, counts } = getCatalogVocab();
    const embeddingStatus = EmbeddingsService.getStatus();

    return {
      ...vocab,
      productCount: products.length,
      categoryCounts: counts.categoryCounts,
      typeCounts: counts.typeCounts,
      embeddingsReady: embeddingStatus.ready,
      embeddingsItemCount: embeddingStatus.itemCount,
      embeddingsLastIndexed: embeddingStatus.lastIndexed,
    };
  },
};
