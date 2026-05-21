import { describe, expect, it } from "vitest";
import type { VisionFeatures } from "../schemas/llm.js";
import { DEFAULT_SCORE_WEIGHTS } from "../schemas/retrieval.js";
import {
  dimProximity,
  equalsIgnoreCase,
  filterProductsByPriceIntent,
  parsePriceIntent,
  resolveEffectiveWeights,
  scoreProduct,
} from "../services/retrieval.service.js";
import type { EnrichedProduct } from "../types.js";

const product: EnrichedProduct = {
  _id: "1",
  title: "Minimalist Walnut Wide Bookshelf",
  description: "Charcoal minimalist wide bookshelf made from premium walnut.",
  category: "Bookshelves",
  type: "Wide Bookshelf",
  price: 400,
  width: 180,
  height: 200,
  depth: 40,
  _attrs: { style: "Minimalist", material: "Walnut", color: "Charcoal" },
};

const vision: VisionFeatures = {
  category: "Bookshelves",
  type: "Wide Bookshelf",
  style: "Minimalist",
  color: "Charcoal",
  material: "Walnut",
  description: "A tall charcoal bookshelf with walnut frame",
  keywords: ["bookshelf", "walnut", "minimalist"],
  confidence: { category: 0.9, type: 0.85, color: 0.8, style: 0.7 },
  est_dimensions: { width_cm: 180, height_cm: 200, depth_cm: 40 },
};

describe("retrieval scoring", () => {
  it("matches category and type case-insensitively", () => {
    expect(equalsIgnoreCase("Bookshelves", "bookshelves")).toBe(true);
  });

  it("redistributes vector weight to lexical when embeddings unavailable", () => {
    const weights = resolveEffectiveWeights(DEFAULT_SCORE_WEIGHTS, false);
    expect(weights.w_vec).toBe(0);
    expect(weights.w_lex).toBeCloseTo(0.45);
  });

  it("scores strong attribute matches higher than weak ones", () => {
    const strong = scoreProduct({
      product,
      vision,
      weights: resolveEffectiveWeights(DEFAULT_SCORE_WEIGHTS, false),
      lexicalScore: 0.9,
      vectorScore: 0,
      materials: ["Walnut"],
    });

    const weak = scoreProduct({
      product: { ...product, _id: "2", category: "Sofas", type: "Sectional Sofa" },
      vision,
      weights: resolveEffectiveWeights(DEFAULT_SCORE_WEIGHTS, false),
      lexicalScore: 0.1,
      vectorScore: 0,
      materials: ["Walnut"],
    });

    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.breakdown.cat).toBe(1);
    expect(strong.breakdown.type).toBe(1);
    expect(dimProximity(vision.est_dimensions, product)).toBeCloseTo(1);
  });

  it("parses price constraints from natural language prompts", () => {
    expect(parsePriceIntent("walnut bookshelf under $500")).toEqual({ maxPrice: 500 });
    expect(parsePriceIntent("between $300 and $600")).toEqual({
      minPrice: 300,
      maxPrice: 600,
    });
    expect(parsePriceIntent("about 1,200 dollars")).toEqual({ targetPrice: 1200 });
  });

  it("filters products with prompt price intent and tolerance", () => {
    const products: EnrichedProduct[] = [
      { ...product, _id: "budget", price: 450 },
      { ...product, _id: "stretch", price: 520 },
      { ...product, _id: "premium", price: 900 },
    ];

    const strict = filterProductsByPriceIntent(products, { maxPrice: 500 }, 0);
    expect(strict.map((item) => item._id)).toEqual(["budget"]);

    const tolerant = filterProductsByPriceIntent(products, { maxPrice: 500 }, 10);
    expect(tolerant.map((item) => item._id)).toEqual(["budget", "stretch"]);

    const around = filterProductsByPriceIntent(products, { targetPrice: 500 }, 0);
    expect(around.map((item) => item._id)).toEqual(["budget", "stretch"]);
  });

  it("uses prompt-mentioned material for material score", () => {
    const result = scoreProduct({
      product,
      vision: { ...vision, material: null },
      weights: { ...DEFAULT_SCORE_WEIGHTS, w_mat: 0.2 },
      lexicalScore: 0,
      vectorScore: 0,
      materials: ["Walnut", "Oak"],
      userPrompt: "show me walnut options",
    });

    expect(result.breakdown.mat).toBe(1);
    expect(result.contributions.mat).toBeCloseTo(0.2);
  });
});
