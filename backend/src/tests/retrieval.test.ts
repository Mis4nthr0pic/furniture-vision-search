import { describe, expect, it } from "vitest";
import {
  dimProximity,
  equalsIgnoreCase,
  resolveEffectiveWeights,
  scoreProduct,
} from "../services/retrieval.service.js";
import type { EnrichedProduct } from "../types.js";
import type { VisionFeatures } from "../schemas/llm.js";
import { DEFAULT_SCORE_WEIGHTS } from "../schemas/retrieval.js";

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
});
