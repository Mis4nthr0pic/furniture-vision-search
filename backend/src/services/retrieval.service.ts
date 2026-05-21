import { getLexicalScoresForQuery } from "../catalog/lexical.js";
import { getCatalogProducts, getCatalogVocab } from "../catalog/load.js";
import type { VisionFeatures } from "../schemas/llm.js";
import type { RetrievalConfig, ScoreWeights } from "../schemas/retrieval.js";
import type { EnrichedProduct } from "../types.js";
import { cosineSimilarity } from "../utils/cosine.js";

export interface ScoreBreakdown {
  vec: number;
  lex: number;
  cat: number;
  type: number;
  color: number;
  style: number;
  mat: number;
  dim: number;
}

export interface ScoredProduct {
  product: EnrichedProduct;
  score: number;
  breakdown: ScoreBreakdown;
  contributions: ScoreBreakdown;
}

/** Seam for swapping in-memory cosine → Atlas Vector Search / pgvector. */
export interface Retriever {
  isAvailable(): boolean;
  getProductVector(productId: string): number[] | null;
  getQueryVector(text: string): Promise<number[] | null>;
}

export class NullRetriever implements Retriever {
  isAvailable(): boolean {
    return false;
  }

  getProductVector(_productId: string): number[] | null {
    return null;
  }

  async getQueryVector(_text: string): Promise<number[] | null> {
    return null;
  }
}

export function buildLexicalQueryText(vision: VisionFeatures, userPrompt?: string): string {
  const parts = [vision.description, ...vision.keywords];
  if (userPrompt?.trim()) {
    parts.push(userPrompt.trim());
  }
  return parts.join(" ");
}

export function equalsIgnoreCase(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export function vocabHasValue(vocabList: string[], value?: string | null): boolean {
  if (!value) return false;
  return vocabList.some((item) => equalsIgnoreCase(item, value));
}

export function userPromptMentionsMaterial(
  userPrompt: string | undefined,
  materials: string[],
): boolean {
  if (!userPrompt?.trim()) return false;
  const lower = userPrompt.toLowerCase();
  return materials.some((material) => lower.includes(material.toLowerCase()));
}

export function dimProximity(
  est: VisionFeatures["est_dimensions"],
  product: EnrichedProduct,
): number {
  if (!est) return 0;

  const pairs: Array<[number | undefined, number]> = [
    [est.width_cm, product.width],
    [est.height_cm, product.height],
    [est.depth_cm, product.depth],
  ];

  let total = 0;
  let count = 0;

  for (const [estimated, actual] of pairs) {
    if (estimated != null && estimated > 0 && actual > 0) {
      total += Math.min(estimated, actual) / Math.max(estimated, actual);
      count++;
    }
  }

  return count === 0 ? 0 : total / count;
}

export function resolveEffectiveWeights(
  weights: ScoreWeights,
  embeddingsAvailable: boolean,
): ScoreWeights {
  if (embeddingsAvailable) {
    return { ...weights };
  }

  return {
    ...weights,
    w_vec: 0,
    w_lex: weights.w_lex + weights.w_vec,
  };
}

export function filterProducts(
  products: EnrichedProduct[],
  vision: VisionFeatures,
  config: RetrievalConfig,
): EnrichedProduct[] {
  if (config.filterMode === "off") {
    return products;
  }

  const { vocab } = getCatalogVocab();
  let filtered = products;

  const shouldFilterCategory =
    config.filterMode === "strict"
      ? vocabHasValue(vocab.categories, vision.category)
      : vision.confidence.category >= config.confidenceThreshold &&
        vocabHasValue(vocab.categories, vision.category);

  if (shouldFilterCategory && vision.category) {
    filtered = filtered.filter((product) => equalsIgnoreCase(product.category, vision.category));
  }

  const shouldFilterType =
    config.filterMode === "strict"
      ? vocabHasValue(vocab.types, vision.type)
      : vision.confidence.type >= config.confidenceThreshold &&
        vocabHasValue(vocab.types, vision.type);

  if (shouldFilterType && vision.type) {
    filtered = filtered.filter((product) => equalsIgnoreCase(product.type, vision.type));
  }

  return filtered;
}

function modeWeights(mode: RetrievalConfig["mode"], weights: ScoreWeights): ScoreWeights {
  switch (mode) {
    case "vector_only":
      return {
        ...weights,
        w_lex: 0,
        w_cat: 0,
        w_type: 0,
        w_color: 0,
        w_style: 0,
        w_mat: 0,
        w_dim: 0,
      };
    case "lexical_only":
      return {
        ...weights,
        w_vec: 0,
        w_cat: 0,
        w_type: 0,
        w_color: 0,
        w_style: 0,
        w_mat: 0,
        w_dim: 0,
      };
    case "filter_only":
      return { ...weights, w_vec: 0, w_lex: 0 };
    default:
      return weights;
  }
}

export function scoreProduct(args: {
  product: EnrichedProduct;
  vision: VisionFeatures;
  userPrompt?: string;
  weights: ScoreWeights;
  lexicalScore: number;
  vectorScore: number;
  materials: string[];
}): ScoredProduct {
  const { product, vision, userPrompt, weights, lexicalScore, vectorScore, materials } = args;

  const breakdown: ScoreBreakdown = {
    vec: vectorScore,
    lex: lexicalScore,
    cat: equalsIgnoreCase(vision.category, product.category) ? 1 : 0,
    type: equalsIgnoreCase(vision.type, product.type) ? 1 : 0,
    color: equalsIgnoreCase(vision.color, product._attrs.color) ? 1 : 0,
    style: equalsIgnoreCase(vision.style, product._attrs.style) ? 1 : 0,
    mat:
      userPromptMentionsMaterial(userPrompt, materials) &&
      equalsIgnoreCase(vision.material, product._attrs.material)
        ? 1
        : 0,
    dim: dimProximity(vision.est_dimensions, product),
  };

  const contributions: ScoreBreakdown = {
    vec: weights.w_vec * breakdown.vec,
    lex: weights.w_lex * breakdown.lex,
    cat: weights.w_cat * breakdown.cat,
    type: weights.w_type * breakdown.type,
    color: weights.w_color * breakdown.color,
    style: weights.w_style * breakdown.style,
    mat: weights.w_mat * breakdown.mat,
    dim: weights.w_dim * breakdown.dim,
  };

  const score =
    contributions.vec +
    contributions.lex +
    contributions.cat +
    contributions.type +
    contributions.color +
    contributions.style +
    contributions.mat +
    contributions.dim;

  return { product, score, breakdown, contributions };
}

export async function retrieveTopK(args: {
  vision: VisionFeatures;
  userPrompt?: string;
  config: RetrievalConfig;
  retriever?: Retriever;
}): Promise<{ results: ScoredProduct[]; warnings: string[] }> {
  const retriever = args.retriever ?? new NullRetriever();
  const warnings: string[] = [];

  const embeddingsAvailable = retriever.isAvailable();
  if (!embeddingsAvailable) {
    warnings.push("embeddings unavailable, using lexical fallback");
  }

  let weights = resolveEffectiveWeights(args.config.weights, embeddingsAvailable);
  weights = modeWeights(args.config.mode, weights);

  const products = filterProducts(getCatalogProducts(), args.vision, args.config);
  const queryText = buildLexicalQueryText(args.vision, args.userPrompt);
  const lexicalScores = getLexicalScoresForQuery(queryText);
  const { vocab } = getCatalogVocab();

  let queryVector: number[] | null = null;
  if (embeddingsAvailable && weights.w_vec > 0) {
    queryVector = await retriever.getQueryVector(queryText);
    if (!queryVector) {
      warnings.push("query embedding failed, vector score omitted");
    }
  }

  const scored = products.map((product) => {
    const vectorScore =
      queryVector && weights.w_vec > 0
        ? cosineSimilarity(queryVector, retriever.getProductVector(product._id) ?? [])
        : 0;

    return scoreProduct({
      product,
      vision: args.vision,
      userPrompt: args.userPrompt,
      weights,
      lexicalScore: lexicalScores.get(product._id) ?? 0,
      vectorScore,
      materials: vocab.materials,
    });
  });

  scored.sort((a, b) => b.score - a.score);
  return { results: scored.slice(0, args.config.k), warnings };
}

export function toRankedResult(scored: ScoredProduct) {
  const { product, score, breakdown, contributions } = scored;
  return {
    id: product._id,
    title: product.title,
    description: product.description,
    category: product.category,
    type: product.type,
    price: product.price,
    width: product.width,
    height: product.height,
    depth: product.depth,
    attrs: product._attrs,
    score,
    breakdown,
    contributions,
  };
}
