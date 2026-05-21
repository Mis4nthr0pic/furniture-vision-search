import { describe, expect, it } from "vitest";
import { extractJsonFromText } from "../utils/json-parse.js";

describe("extractJsonFromText", () => {
  it("parses raw JSON", () => {
    expect(extractJsonFromText('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses fenced JSON", () => {
    const input = 'Here is the result:\n```json\n{"category":"Benches"}\n```';
    expect(extractJsonFromText(input)).toEqual({ category: "Benches" });
  });

  it("parses JSON with trailing prose", () => {
    const input = '{"score":0.9}\n\nHope that helps!';
    expect(extractJsonFromText(input)).toEqual({ score: 0.9 });
  });
});
