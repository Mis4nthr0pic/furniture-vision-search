import { loadCatalog } from "../catalog/load.js";
import { connectMongo } from "../db/mongo.js";
import { CatalogService } from "../services/catalog.service.js";
import { EmbeddingsService } from "../services/embeddings.service.js";
import { LexicalService } from "../services/lexical.service.js";
import { logger } from "../utils/logger.js";
import { getAppState, setAppState } from "./state.js";

export async function bootstrapApplication(): Promise<void> {
  try {
    const db = await connectMongo();
    const products = await loadCatalog(db);
    LexicalService.init(products);
    EmbeddingsService.tryLoadFromDisk();

    setAppState({
      mongoOk: true,
      productCount: products.length,
      lexicalReady: LexicalService.isReady(),
      embeddingsReady: EmbeddingsService.getStatus().ready,
    });

    logger.info(
      {
        productCount: products.length,
        categories: CatalogService.getMeta().categories.length,
      },
      "Application bootstrap complete",
    );
  } catch (err) {
    logger.error({ err }, "Application bootstrap failed — health will report ok=false");
    setAppState({ mongoOk: false, productCount: 0, lexicalReady: false });
  }
}
