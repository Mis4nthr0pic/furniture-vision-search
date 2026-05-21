import type { CatalogVocab, EnrichedProduct } from "../types.js";

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function countBy(items: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1;
  }
  return counts;
}

function range(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function deriveVocab(products: EnrichedProduct[]): CatalogVocab {
  return {
    categories: uniqueSorted(products.map((p) => p.category)),
    types: uniqueSorted(products.map((p) => p.type)),
    styles: uniqueSorted(products.map((p) => p._attrs.style)),
    materials: uniqueSorted(products.map((p) => p._attrs.material)),
    colors: uniqueSorted(products.map((p) => p._attrs.color)),
    priceRange: range(products.map((p) => p.price)),
    dimRanges: {
      width: range(products.map((p) => p.width)),
      height: range(products.map((p) => p.height)),
      depth: range(products.map((p) => p.depth)),
    },
  };
}

export function deriveCounts(products: EnrichedProduct[]): {
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
} {
  return {
    categoryCounts: countBy(products.map((p) => p.category)),
    typeCounts: countBy(products.map((p) => p.type)),
  };
}
