import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { rateResult, searchProducts } from "../api/client";
import { getLlmConfigForRequest, getRetrievalConfigForRequest, useStore } from "../store";

export function useSearchActions() {
  const {
    apiKey,
    llmConfig,
    retrievalConfig,
    setSearchLoading,
    setSearchError,
    applySearchResult,
    setRating,
    clearRating,
  } = useStore(
    useShallow((state) => ({
      apiKey: state.apiKey,
      llmConfig: state.llmConfig,
      retrievalConfig: state.retrievalConfig,
      setSearchLoading: state.setSearchLoading,
      setSearchError: state.setSearchError,
      applySearchResult: state.applySearchResult,
      setRating: state.setRating,
      clearRating: state.clearRating,
    })),
  );

  const runSearch = useCallback(
    async (image: File, userPrompt: string) => {
      setSearchLoading(true);
      setSearchError(null);

      if (!apiKey.trim()) {
        setSearchError("Add your OpenRouter API key in Admin → Config before searching.");
        setSearchLoading(false);
        return;
      }

      try {
        const result = await searchProducts({
          image,
          userPrompt,
          llmConfig: getLlmConfigForRequest({ apiKey, llmConfig }),
          retrievalConfig: getRetrievalConfigForRequest({ retrievalConfig }),
        });
        applySearchResult(result);
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setSearchLoading(false);
      }
    },
    [apiKey, llmConfig, retrievalConfig, setSearchLoading, setSearchError, applySearchResult],
  );

  const rateProduct = useCallback(
    async (searchId: string, productId: string, relevant: boolean) => {
      const previous = useStore.getState().ratings[productId];
      setRating(productId, relevant);
      try {
        await rateResult({ searchId, productId, relevant });
      } catch (err) {
        if (previous === undefined) {
          clearRating(productId);
        } else {
          setRating(productId, previous);
        }
        setSearchError(err instanceof Error ? err.message : "Failed to save rating");
      }
    },
    [setRating, clearRating, setSearchError],
  );

  return { runSearch, rateProduct };
}

export function useSearchState() {
  return useStore(
    useShallow((state) => ({
      apiKey: state.apiKey,
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
