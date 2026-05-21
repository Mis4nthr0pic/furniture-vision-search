import { create } from "zustand";
import type { RankedProduct, RetrievalConfig, SearchResponse, VisionFeatures } from "./types";

const defaultRetrievalConfig: RetrievalConfig = {
  mode: "hybrid",
  k: 30,
  n: 10,
  enableRerank: true,
  useImageInRerank: true,
  filterMode: "auto",
  confidenceThreshold: 0.7,
};

const defaultLlmConfig = {
  baseUrl: "https://openrouter.ai/api/v1",
  visionModel: "openai/gpt-4o",
  chatModel: "openai/gpt-4o",
  embedModel: "openai/text-embedding-3-small",
};

interface AppState {
  apiKey: string;
  llmConfig: typeof defaultLlmConfig;
  retrievalConfig: RetrievalConfig;
  searchLoading: boolean;
  searchError: string | null;
  lastSearchId: string | null;
  visionFeatures: VisionFeatures | null;
  ranked: RankedProduct[];
  warnings: string[];
  rerankError: string | null;
  timings: SearchResponse["timings"] | null;
  ratings: Record<string, boolean>;

  setApiKey: (key: string) => void;
  setRetrievalConfig: (partial: Partial<RetrievalConfig>) => void;
  setSearchLoading: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  applySearchResult: (result: SearchResponse) => void;
  setRating: (productId: string, relevant: boolean) => void;
  resetSearch: () => void;
}

export const useStore = create<AppState>((set) => ({
  apiKey: "",
  llmConfig: defaultLlmConfig,
  retrievalConfig: defaultRetrievalConfig,
  searchLoading: false,
  searchError: null,
  lastSearchId: null,
  visionFeatures: null,
  ranked: [],
  warnings: [],
  rerankError: null,
  timings: null,
  ratings: {},

  setApiKey: (apiKey) => set({ apiKey }),
  setRetrievalConfig: (partial) =>
    set((state) => ({
      retrievalConfig: { ...state.retrievalConfig, ...partial },
    })),
  setSearchLoading: (searchLoading) => set({ searchLoading }),
  setSearchError: (searchError) => set({ searchError }),
  applySearchResult: (result) =>
    set({
      lastSearchId: result.searchId,
      visionFeatures: result.visionFeatures,
      ranked: result.ranked,
      warnings: result.warnings,
      rerankError: result.rerank_error ?? null,
      timings: result.timings,
      ratings: {},
      searchError: null,
    }),
  setRating: (productId, relevant) =>
    set((state) => ({
      ratings: { ...state.ratings, [productId]: relevant },
    })),
  resetSearch: () =>
    set({
      searchLoading: false,
      searchError: null,
      lastSearchId: null,
      visionFeatures: null,
      ranked: [],
      warnings: [],
      rerankError: null,
      timings: null,
      ratings: {},
    }),
}));

export function getLlmConfigForRequest(state: Pick<AppState, "apiKey" | "llmConfig">) {
  return {
    apiKey: state.apiKey,
    ...state.llmConfig,
  };
}
