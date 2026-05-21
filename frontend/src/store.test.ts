import { describe, expect, it, beforeEach } from "vitest";
import { getLlmConfigForRequest, useStore } from "./store";

describe("useStore", () => {
  beforeEach(() => {
    useStore.setState({
      apiKey: "",
      searchLoading: false,
      ranked: [],
      ratings: {},
    });
  });

  it("stores api key in memory", () => {
    useStore.getState().setApiKey("sk-test-key");
    expect(useStore.getState().apiKey).toBe("sk-test-key");
  });

  it("builds llm config for API requests", () => {
    useStore.getState().setApiKey("sk-test-key");
    const config = getLlmConfigForRequest(useStore.getState());
    expect(config.apiKey).toBe("sk-test-key");
    expect(config.visionModel).toBe("openai/gpt-4o");
  });

  it("applies search results and clears prior ratings", () => {
    useStore.getState().setRating("abc", true);
    useStore.getState().applySearchResult({
      searchId: "search-1",
      visionFeatures: {
        description: "A bookshelf",
        keywords: ["bookshelf"],
        confidence: { category: 1, type: 1, color: 1, style: 1 },
      },
      ranked: [],
      warnings: [],
      timings: { visionMs: 1, retrievalMs: 1, rerankMs: 0, totalMs: 2 },
    });

    expect(useStore.getState().lastSearchId).toBe("search-1");
    expect(useStore.getState().ratings).toEqual({});
  });
});
