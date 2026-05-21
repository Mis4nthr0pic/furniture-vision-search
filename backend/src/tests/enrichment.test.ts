import { describe, expect, it } from "vitest";
import { enrichProduct, parseDescriptionColor, parseTitleAttrs } from "../catalog/enrich.js";
import type { Product } from "../types.js";

const sample: Product = {
  _id: "1",
  title: "Bohemian Cherry Entryway Bench",
  description: "Espresso bohemian entryway bench made from premium cherry.",
  category: "Benches",
  type: "Entryway Bench",
  price: 299,
  width: 120,
  height: 45,
  depth: 40,
};

describe("parseTitleAttrs", () => {
  it("parses style, material, type from title", () => {
    expect(parseTitleAttrs(sample.title, sample.type)).toEqual({
      style: "Bohemian",
      material: "Cherry",
    });
  });

  it("handles multi-word type", () => {
    const title = "Minimalist Walnut Wide Bookshelf";
    expect(parseTitleAttrs(title, "Wide Bookshelf")).toEqual({
      style: "Minimalist",
      material: "Walnut",
    });
  });
});

describe("parseDescriptionColor", () => {
  it("extracts first word as color", () => {
    expect(parseDescriptionColor(sample.description)).toBe("Espresso");
  });
});

describe("enrichProduct", () => {
  it("adds _attrs", () => {
    const enriched = enrichProduct(sample);
    expect(enriched._attrs).toEqual({
      style: "Bohemian",
      material: "Cherry",
      color: "Espresso",
    });
  });
});
