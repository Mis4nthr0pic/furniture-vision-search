import { describe, expect, it } from "vitest";
import {
  describePriceIntent,
  parsePriceIntent,
  priceBoundsFromIntent,
  productMatchesPriceIntent,
} from "../utils/price-intent.js";

describe("parsePriceIntent", () => {
  it("parses under $500", () => {
    expect(parsePriceIntent("under $500")).toEqual({ kind: "max", max: 500 });
    expect(parsePriceIntent("contemporary accent chair under $500")).toEqual({
      kind: "max",
      max: 500,
    });
  });

  it("parses over and between ranges", () => {
    expect(parsePriceIntent("over $800")).toEqual({ kind: "min", min: 800 });
    expect(parsePriceIntent("between $300 and $600")).toEqual({
      kind: "range",
      min: 300,
      max: 600,
    });
    expect(parsePriceIntent("$300-$600")).toEqual({ kind: "range", min: 300, max: 600 });
  });

  it("parses around with tolerance bounds", () => {
    const intent = parsePriceIntent("around $1200");
    expect(intent).toEqual({ kind: "approx", approx: 1200 });
    expect(priceBoundsFromIntent(intent!, 10)).toEqual({ min: 1080, max: 1320 });
  });

  it("returns null when no price phrase is present", () => {
    expect(parsePriceIntent("contemporary yellow linen")).toBeNull();
  });
});

describe("productMatchesPriceIntent", () => {
  it("enforces max price", () => {
    const intent = parsePriceIntent("under $500")!;
    expect(productMatchesPriceIntent(490, intent)).toBe(true);
    expect(productMatchesPriceIntent(500, intent)).toBe(true);
    expect(productMatchesPriceIntent(501, intent)).toBe(false);
    expect(productMatchesPriceIntent(1090, intent)).toBe(false);
  });

  it("describes intent for warnings", () => {
    const intent = parsePriceIntent("under $500")!;
    expect(describePriceIntent(intent)).toBe("under $500");
  });
});
