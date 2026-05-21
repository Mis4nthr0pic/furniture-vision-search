import { describe, expect, it } from "vitest";
import { cosineSimilarity } from "../utils/cosine.js";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns 0 for length mismatch", () => {
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
  });
});
