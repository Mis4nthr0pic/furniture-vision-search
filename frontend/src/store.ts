import { create } from "zustand";
import type {
  RankedProduct,
  RetrievalConfig,
  ScoreWeights,
  SearchResponse,
  VisionFeatures,
} from "./types";

export const defaultScoreWeights: ScoreWeights = {
  w_vec: 0.25,
  w_lex: 0.2,
  w_cat: 0.15,
  w_type: 0.15,
  w_color: 0.15,
  w_style: 0.05,
  w_mat: 0,
  w_dim: 0.05,
};

export const defaultRetrievalConfig: RetrievalConfig = {
  mode: "hybrid",
  k: 30,
  n: 10,
  enableRerank: true,
  useImageInRerank: true,
  filterMode: "auto",
  confidenceThreshold: 0.7,
  weights: defaultScoreWeights,
};

export const defaultLlmConfig = {
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
  setLlmConfig: (partial: Partial<typeof defaultLlmConfig>) => void;
  setRetrievalConfig: (partial: Partial<RetrievalConfig>) => void;
  setScoreWeights: (partial: Partial<ScoreWeights>) => void;
  resetToDefaults: () => void;
  setSearchLoading: (loading: boolean) => void;
  setSearchError: (error: string | null) => void;
  applySearchResult: (result: SearchResponse) => void;
  setRating: (productId: string, relevant: boolean) => void;
  clearRating: (productId: string) => void;
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
  setLlmConfig: (partial) =>
    set((state) => ({
      llmConfig: { ...state.llmConfig, ...partial },
    })),
  setRetrievalConfig: (partial) =>
    set((state) => ({
      retrievalConfig: { ...state.retrievalConfig, ...partial },
    })),
  setScoreWeights: (partial) =>
    set((state) => ({
      retrievalConfig: {
        ...state.retrievalConfig,
        weights: { ...defaultScoreWeights, ...state.retrievalConfig.weights, ...partial },
      },
    })),
  resetToDefaults: () =>
    set({
      llmConfig: defaultLlmConfig,
      retrievalConfig: defaultRetrievalConfig,
    }),
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
  clearRating: (productId) =>
    set((state) => {
      const { [productId]: _removed, ...ratings } = state.ratings;
      return { ratings };
    }),
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

export function getRetrievalConfigForRequest(state: Pick<AppState, "retrievalConfig">) {
  return {
    ...state.retrievalConfig,
    weights: { ...defaultScoreWeights, ...state.retrievalConfig.weights },
  };
}
