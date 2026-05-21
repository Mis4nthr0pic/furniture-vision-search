import { describe, expect, it } from "vitest";
import { tokenize } from "../utils/tokenize.js";

describe("tokenize", () => {
  it("lowercases and strips punctuation", () => {
    expect(tokenize("Walnut, Bookshelf!")).toEqual(["walnut", "bookshelf"]);
  });

  it("removes stopwords", () => {
    expect(tokenize("a walnut bookshelf for the home")).toEqual(["walnut", "bookshelf", "home"]);
  });

  it("handles empty input", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});
