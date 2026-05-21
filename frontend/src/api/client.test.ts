import { afterEach, describe, expect, it, vi } from "vitest";
import { BACKEND_OFFLINE_MESSAGE } from "../utils/api-errors";
import { fetchHealth, searchProducts, triggerReindex } from "./client";

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
      text: async () =>
        JSON.stringify({
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

  it("maps HTML gateway responses to a backend-offline message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => "<!DOCTYPE html><html><body>502</body></html>",
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      triggerReindex({
        apiKey: "sk-test",
        baseUrl: "https://openrouter.ai/api/v1",
        visionModel: "openai/gpt-4o",
        chatModel: "openai/gpt-4o",
        embedModel: "openai/text-embedding-3-small",
      }),
    ).rejects.toThrow(BACKEND_OFFLINE_MESSAGE);
  });

  it("fetches health from the API route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          ok: true,
          productCount: 2500,
          lexicalReady: true,
          embeddingsReady: false,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const health = await fetchHealth();
    expect(health.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/health", {
      signal: expect.any(AbortSignal),
    });
  });
});
