import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { rateResult, searchProducts } from "../api/client";
import { getLlmConfigForRequest, useStore } from "../store";

export function useSearchActions() {
  const {
    apiKey,
    llmConfig,
    retrievalConfig,
    setSearchLoading,
    setSearchError,
    applySearchResult,
    setRating,
  } = useStore(
    useShallow((state) => ({
      apiKey: state.apiKey,
      llmConfig: state.llmConfig,
      retrievalConfig: state.retrievalConfig,
      setSearchLoading: state.setSearchLoading,
      setSearchError: state.setSearchError,
      applySearchResult: state.applySearchResult,
      setRating: state.setRating,
    })),
  );

  const runSearch = useCallback(
    async (image: File, userPrompt: string) => {
      setSearchLoading(true);
      setSearchError(null);

      try {
        const result = await searchProducts({
          image,
          userPrompt,
          llmConfig: getLlmConfigForRequest({ apiKey, llmConfig }),
          retrievalConfig,
        });
        applySearchResult(result);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setSearchLoading(false);
      }
    },
    [
      apiKey,
      llmConfig,
      retrievalConfig,
      setSearchLoading,
      setSearchError,
      applySearchResult,
    ],
  );

  const rateProduct = useCallback(
    async (searchId: string, productId: string, relevant: boolean) => {
      setRating(productId, relevant);
      try {
        await rateResult({ searchId, productId, relevant });
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : "Failed to save rating");
      }
    },
    [setRating, setSearchError],
  );

  return { runSearch, rateProduct };
}

export function useSearchState() {
  return useStore(
    useShallow((state) => ({
      apiKey: state.apiKey,
      setApiKey: state.setApiKey,
      searchLoading: state.searchLoading,
      searchError: state.searchError,
      lastSearchId: state.lastSearchId,
      visionFeatures: state.visionFeatures,
      ranked: state.ranked,
      warnings: state.warnings,
      rerankError: state.rerankError,
      timings: state.timings,
      ratings: state.ratings,
    })),
  );
}
