import { getCatalogProducts, getCatalogVocab } from "../catalog/load.js";
import type { AppState } from "../app/state.js";
import type { CatalogMeta } from "../types.js";

export const CatalogService = {
  getMeta(app: Pick<AppState, "embeddingsReady">): CatalogMeta {
    const products = getCatalogProducts();
    const { vocab, counts } = getCatalogVocab();

    return {
      ...vocab,
      productCount: products.length,
      categoryCounts: counts.categoryCounts,
      typeCounts: counts.typeCounts,
      embeddingsReady: app.embeddingsReady,
      embeddingsItemCount: 0,
      embeddingsLastIndexed: null,
    };
  },
};
