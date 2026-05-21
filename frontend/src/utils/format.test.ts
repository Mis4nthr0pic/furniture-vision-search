import { describe, expect, it } from "vitest";
import type { RankedProduct } from "../types";
import { formatMs, formatPrice, formatScoreBreakdown } from "./format";

const product: RankedProduct = {
  id: "1",
  title: "Test",
  description: "desc",
  category: "Chairs",
  type: "Accent Chair",
  price: 400,
  width: 50,
  height: 80,
  depth: 50,
  attrs: { style: "Modern", material: "Oak", color: "White" },
  score: 0.812,
  rerankScore: 0.91,
  reason: "Good match",
  breakdown: { vec: 0.5, lex: 0.8, cat: 1, type: 1, color: 0, style: 0, mat: 0, dim: 0 },
  contributions: { vec: 0.1, lex: 0.16, cat: 0.15, type: 0.15, color: 0, style: 0, mat: 0, dim: 0 },
};

describe("format utils", () => {
  it("formats milliseconds", () => {
    expect(formatMs(450)).toBe("450 ms");
    expect(formatMs(2400)).toBe("2.4s");
  });

  it("formats price", () => {
    expect(formatPrice(1299)).toBe("$1,299");
  });

  it("formats score breakdown lines", () => {
    const lines = formatScoreBreakdown(product);
    expect(lines[0]).toContain("0.812");
    expect(lines[1]).toContain("0.91");
  });
});
