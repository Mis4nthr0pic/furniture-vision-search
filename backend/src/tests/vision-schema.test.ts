import { describe, expect, it } from "vitest";
import { normalizeVisionInput, parseVisionFeatures } from "../schemas/llm.js";

describe("parseVisionFeatures", () => {
  it("accepts null confidence fields from the model", () => {
    const features = parseVisionFeatures({
      category: "Bookshelves",
      type: null,
      style: "Minimalist",
      color: "Natural",
      material: "Walnut",
      description: "A tall natural wood bookshelf with open shelves.",
      keywords: ["bookshelf", "walnut", "minimalist"],
      confidence: {
        category: 0.8,
        type: null,
        color: 0.7,
        style: 0.6,
      },
    });

    expect(features.confidence.type).toBe(0);
    expect(features.confidence.category).toBe(0.8);
  });

  it("coerces scalar confidence into all fields", () => {
    const features = parseVisionFeatures(
      normalizeVisionInput({
        category: "Chairs",
        description: "A wooden stool with four legs.",
        keywords: ["stool"],
        confidence: 0.95,
      }),
    );

    expect(features.confidence).toEqual({
      category: 0.95,
      type: 0.95,
      color: 0.95,
      style: 0.95,
    });
  });
});
