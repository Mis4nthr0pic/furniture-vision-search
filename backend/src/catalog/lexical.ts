import MiniSearch from "minisearch";
import { getCatalogProducts } from "./load.js";
import type { EnrichedProduct } from "../types.js";
import { tokenize } from "../utils/tokenize.js";
import { logger } from "../utils/logger.js";

export interface LexicalSearchResult {
  id: string;
  score: number;
  rawScore: number;
  title: string;
  category: string;
  type: string;
}

interface LexicalDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  style: string;
  material: string;
  color: string;
}

const SEARCH_OPTIONS = {
  boost: { title: 3, type: 2, category: 2 },
  fuzzy: 0.2,
  prefix: true,
} as const;

let index: MiniSearch<LexicalDocument> | null = null;
let productById: Map<string, EnrichedProduct> | null = null;

function toLexicalDocument(product: EnrichedProduct): LexicalDocument {
  return {
    id: product._id,
    title: product.title,
    description: product.description,
    category: product.category,
    type: product.type,
    style: product._attrs.style,
    material: product._attrs.material,
    color: product._attrs.color,
  };
}

export function buildLexicalIndex(products: EnrichedProduct[]): MiniSearch<LexicalDocument> {
  const searchIndex = new MiniSearch<LexicalDocument>({
    fields: ["title", "description", "category", "type", "style", "material", "color"],
    storeFields: ["id", "title", "category", "type"],
    tokenize,
    searchOptions: SEARCH_OPTIONS,
  });

  searchIndex.addAll(products.map(toLexicalDocument));
  return searchIndex;
}

export function initLexicalIndex(products: EnrichedProduct[]): void {
  index = buildLexicalIndex(products);
  productById = new Map(products.map((product) => [product._id, product]));
  logger.info({ documentCount: products.length }, "Lexical index built");
}

export function isLexicalReady(): boolean {
  return index !== null && productById !== null;
}

function normalizeScores(
  hits: Array<{ id: string; score: number; title: string; category: string; type: string }>,
): LexicalSearchResult[] {
  if (hits.length === 0) return [];

  const maxScore = Math.max(...hits.map((hit) => hit.score));
  const minScore = Math.min(...hits.map((hit) => hit.score));
  const range = maxScore - minScore;

  return hits.map((hit) => ({
    id: hit.id,
    rawScore: hit.score,
    score: range === 0 ? 1 : (hit.score - minScore) / range,
    title: hit.title,
    category: hit.category,
    type: hit.type,
  }));
}

export function searchLexical(query: string, limit = 20): LexicalSearchResult[] {
  if (!index || !productById) {
    throw new Error("Lexical index not initialized");
  }

  const trimmed = query.trim();
  if (!trimmed) return [];

  const hits = index.search(trimmed, SEARCH_OPTIONS);
  const limited = hits.slice(0, limit).map((hit) => ({
    id: String(hit.id),
    score: hit.score,
    title: String(hit.title),
    category: String(hit.category),
    type: String(hit.type),
  }));

  return normalizeScores(limited);
}

export function getLexicalScoreForProduct(query: string, productId: string): number {
  const results = searchLexical(query, productById?.size ?? 2500);
  const match = results.find((result) => result.id === productId);
  return match?.score ?? 0;
}

export function getLexicalScoresForQuery(query: string): Map<string, number> {
  const results = searchLexical(query);
  return new Map(results.map((result) => [result.id, result.score]));
}

export function ensureLexicalIndex(): void {
  if (isLexicalReady()) return;
  initLexicalIndex(getCatalogProducts());
}
