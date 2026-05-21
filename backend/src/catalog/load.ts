import type { Db } from "mongodb";
import { enrichProducts } from "./enrich.js";
import { deriveCounts, deriveVocab } from "./vocab.js";
import type { CatalogMeta, EnrichedProduct, Product } from "../types.js";
import { logger } from "../utils/logger.js";

let cachedProducts: EnrichedProduct[] | null = null;
let cachedVocab: ReturnType<typeof deriveVocab> | null = null;
let cachedCounts: ReturnType<typeof deriveCounts> | null = null;

function toProduct(doc: Record<string, unknown>): Product {
  return {
    _id: String(doc._id),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    category: String(doc.category ?? ""),
    type: String(doc.type ?? ""),
    price: Number(doc.price ?? 0),
    width: Number(doc.width ?? 0),
    height: Number(doc.height ?? 0),
    depth: Number(doc.depth ?? 0),
  };
}

export async function loadCatalog(db: Db): Promise<EnrichedProduct[]> {
  if (cachedProducts) return cachedProducts;

  const docs = await db.collection("products").find({}).toArray();
  const products = docs.map((doc) => toProduct(doc as Record<string, unknown>));
  cachedProducts = enrichProducts(products);
  cachedVocab = deriveVocab(cachedProducts);
  cachedCounts = deriveCounts(cachedProducts);

  logger.info(
    {
      productCount: cachedProducts.length,
      categories: cachedVocab.categories.length,
      types: cachedVocab.types.length,
    },
    "Catalog loaded and enriched",
  );

  return cachedProducts;
}

export function getCatalogProducts(): EnrichedProduct[] {
  if (!cachedProducts) {
    throw new Error("Catalog not loaded");
  }
  return cachedProducts;
}

export function getCatalogVocab() {
  if (!cachedVocab || !cachedCounts) {
    throw new Error("Catalog not loaded");
  }
  return { vocab: cachedVocab, counts: cachedCounts };
}

export function getCatalogMeta(): CatalogMeta {
  const products = getCatalogProducts();
  const { vocab, counts } = getCatalogVocab();

  return {
    ...vocab,
    productCount: products.length,
    categoryCounts: counts.categoryCounts,
    typeCounts: counts.typeCounts,
    embeddingsReady: false,
    embeddingsItemCount: 0,
    embeddingsLastIndexed: null,
  };
}

export function clearCatalogCache(): void {
  cachedProducts = null;
  cachedVocab = null;
  cachedCounts = null;
}
