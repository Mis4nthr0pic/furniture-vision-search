import { describe, expect, it } from "vitest";
import { computeCatalogHash, embeddingText } from "../utils/catalog-hash.js";
import type { EnrichedProduct } from "../types.js";
import { CachedEmbeddingRetriever } from "../services/embedding-retriever.js";
import type { LLMClient } from "../llm/client.js";

const sample: EnrichedProduct = {
  _id: "abc",
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

describe("catalog hash + embedding text", () => {
  it("builds stable catalog hash regardless of product order", () => {
    const a = computeCatalogHash([sample, { ...sample, _id: "def" }]);
    const b = computeCatalogHash([{ ...sample, _id: "def" }, sample]);
    expect(a).toBe(b);
  });

  it("changes hash when catalog content changes", () => {
    const before = computeCatalogHash([sample]);
    const after = computeCatalogHash([{ ...sample, title: "Updated title" }]);
    expect(before).not.toBe(after);
  });

  it("formats embedding text with title, description, category, and type", () => {
    expect(embeddingText(sample)).toBe(
      "Minimalist Walnut Wide Bookshelf. Charcoal minimalist wide bookshelf made from premium walnut. Category: Bookshelves. Type: Wide Bookshelf.",
    );
  });
});

describe("CachedEmbeddingRetriever", () => {
  it("returns cached product vectors and embeds query text", async () => {
    const vectors = { abc: [1, 0, 0] };
    const client: LLMClient = {
      vision: async () => ({}),
      embed: async ({ input }) => {
        const text = Array.isArray(input) ? input[0] : input;
        expect(text).toBe("query text");
        return [[0, 1, 0]];
      },
      chat: async () => "",
    };

    const retriever = new CachedEmbeddingRetriever(vectors, client);
    expect(retriever.isAvailable()).toBe(true);
    expect(retriever.getProductVector("abc")).toEqual([1, 0, 0]);
    await expect(retriever.getQueryVector("query text")).resolves.toEqual([0, 1, 0]);
  });
});
