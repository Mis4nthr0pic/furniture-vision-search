import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../store";
import { useSearchActions } from "./useSearch";

vi.mock("../api/client", () => ({
  searchProducts: vi.fn(),
  rateResult: vi.fn(),
}));

import { rateResult, searchProducts } from "../api/client";

const mockedSearch = vi.mocked(searchProducts);
const mockedRate = vi.mocked(rateResult);

describe("useSearchActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      apiKey: "",
      searchLoading: false,
      searchError: null,
      ranked: [],
      ratings: {},
    });
  });

  it("sets error when API key is missing", async () => {
    const { result } = renderHook(() => useSearchActions());

    await act(async () => {
      await result.current.runSearch(new File(["x"], "x.png", { type: "image/png" }), "");
    });

    expect(useStore.getState().searchError).toMatch(/API key/i);
    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it("applies search results on success", async () => {
    useStore.getState().setApiKey("sk-test");
    mockedSearch.mockResolvedValueOnce({
      searchId: "s1",
      visionFeatures: {
        description: "A chair",
        keywords: ["chair"],
        confidence: { category: 1, type: 1, color: 1, style: 1 },
      },
      ranked: [],
      warnings: [],
      timings: { visionMs: 1, retrievalMs: 1, rerankMs: 0, totalMs: 2 },
    });

    const { result } = renderHook(() => useSearchActions());

    await act(async () => {
      await result.current.runSearch(new File(["x"], "x.png", { type: "image/png" }), "modern");
    });

    expect(useStore.getState().lastSearchId).toBe("s1");
    expect(useStore.getState().searchError).toBeNull();
  });

  it("reverts optimistic rating when API fails", async () => {
    useStore.getState().setRating("prod-1", true);
    mockedRate.mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => useSearchActions());

    await act(async () => {
      await result.current.rateProduct("search-1", "prod-1", false);
    });

    await waitFor(() => {
      expect(useStore.getState().ratings["prod-1"]).toBe(true);
    });
    expect(useStore.getState().searchError).toMatch(/Failed to save rating|network/);
  });
});
