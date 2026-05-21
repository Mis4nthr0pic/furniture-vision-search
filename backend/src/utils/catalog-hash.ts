import { createHash } from "node:crypto";
import type { EnrichedProduct } from "../types.js";

export function computeCatalogHash(products: EnrichedProduct[]): string {
  const payload = products
    .map((product) => `${product._id}|${product.title}|${product.description}`)
    .sort()
    .join("\n");

  return createHash("sha256").update(payload).digest("hex");
}

export function embeddingText(product: EnrichedProduct): string {
  return `${product.title}. ${product.description} Category: ${product.category}. Type: ${product.type}.`;
}
