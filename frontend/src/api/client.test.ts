import { afterEach, describe, expect, it, vi } from "vitest";
import { searchProducts } from "./client";

describe("searchProducts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts multipart form data to the search endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        searchId: "s1",
        visionFeatures: {
          description: "A chair",
          keywords: ["chair"],
          confidence: { category: 1, type: 1, color: 1, style: 1 },
        },
        ranked: [],
        warnings: [],
        timings: { visionMs: 1, retrievalMs: 1, rerankMs: 0, totalMs: 2 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["abc"], "chair.jpg", { type: "image/jpeg" });
    const result = await searchProducts({
      image: file,
      userPrompt: "modern chair",
      llmConfig: { apiKey: "sk-test" },
      retrievalConfig: { n: 5 },
    });

    expect(result.searchId).toBe("s1");
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/search");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
  });
});
