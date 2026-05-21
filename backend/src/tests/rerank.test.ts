import { describe, expect, it } from "vitest";
import { parseRerankResponse } from "../schemas/rerank.js";
import { applyRerankOrder } from "../services/rerank.service.js";
import { extractJsonFromText } from "../utils/json-parse.js";

const candidates = [
  {
    id: "a",
    title: "Product A",
    description: "desc a",
    category: "Chairs",
    type: "Accent Chair",
    price: 100,
    width: 50,
    height: 80,
    depth: 50,
    attrs: { style: "Modern", material: "Oak", color: "White" },
    score: 0.8,
    breakdown: {
      vec: 0,
      lex: 0.8,
      cat: 1,
      type: 1,
      color: 0,
      style: 0,
      mat: 0,
      dim: 0,
    },
    contributions: {
      vec: 0,
      lex: 0.16,
      cat: 0.15,
      type: 0.15,
      color: 0,
      style: 0,
      mat: 0,
      dim: 0,
    },
  },
  {
    id: "b",
    title: "Product B",
    description: "desc b",
    category: "Sofas",
    type: "Sectional Sofa",
    price: 900,
    width: 200,
    height: 80,
    depth: 90,
    attrs: { style: "Minimalist", material: "Leather", color: "Black" },
    score: 0.5,
    breakdown: {
      vec: 0,
      lex: 0.5,
      cat: 0,
      type: 0,
      color: 0,
      style: 0,
      mat: 0,
      dim: 0,
    },
    contributions: {
      vec: 0,
      lex: 0.1,
      cat: 0,
      type: 0,
      color: 0,
      style: 0,
      mat: 0,
      dim: 0,
    },
  },
];

describe("parseRerankResponse", () => {
  it("parses ranked and discarded arrays from tolerant JSON", () => {
    const raw = extractJsonFromText(`\`\`\`json
{
  "ranked": [{ "id": "a", "score": 0.95, "reason": "Strong match" }],
  "discarded": [{ "id": "b", "reason": "Wrong category" }]
}
\`\`\``);

    expect(parseRerankResponse(raw)).toEqual({
      ranked: [{ id: "a", score: 0.95, reason: "Strong match" }],
      discarded: [{ id: "b", reason: "Wrong category" }],
    });
  });

  it("defaults discarded to empty when omitted", () => {
    expect(
      parseRerankResponse({
        ranked: [{ id: "a", score: 0.5, reason: "ok" }],
      }),
    ).toEqual({
      ranked: [{ id: "a", score: 0.5, reason: "ok" }],
      discarded: [],
    });
  });
});

describe("applyRerankOrder", () => {
  it("reorders candidates and attaches rerank metadata", () => {
    const result = applyRerankOrder(
      {
        ranked: [{ id: "b", score: 0.9, reason: "Better visual match" }],
        discarded: [{ id: "a", reason: "Different silhouette" }],
      },
      candidates,
    );

    expect(result.ranked[0]?.id).toBe("b");
    expect(result.ranked[0]?.rerankScore).toBe(0.9);
    expect(result.ranked[0]?.reason).toBe("Better visual match");
    expect(result.discarded).toEqual([
      {
        id: "a",
        title: "Product A",
        category: "Chairs",
        type: "Accent Chair",
        reason: "Different silhouette",
      },
    ]);
  });

  it("appends unmentioned candidates in hybrid order", () => {
    const result = applyRerankOrder(
      {
        ranked: [{ id: "b", score: 0.9, reason: "Best match" }],
        discarded: [],
      },
      candidates,
    );

    expect(result.ranked.map((item) => item.id)).toEqual(["b", "a"]);
  });

  it("drops over-budget candidates when user prompt sets a max price", () => {
    const result = applyRerankOrder(
      {
        ranked: [
          { id: "b", score: 0.9, reason: "Looks great but expensive" },
          { id: "a", score: 0.7, reason: "In budget" },
        ],
        discarded: [],
      },
      candidates,
      "under $500",
    );

    expect(result.ranked.map((item) => item.id)).toEqual(["a"]);
  });
});
