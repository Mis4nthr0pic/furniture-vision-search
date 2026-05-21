import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";

export function useAdminConfig() {
  return useStore(
    useShallow((state) => ({
      apiKey: state.apiKey,
      llmConfig: state.llmConfig,
      retrievalConfig: state.retrievalConfig,
      setApiKey: state.setApiKey,
      setLlmConfig: state.setLlmConfig,
      setRetrievalConfig: state.setRetrievalConfig,
      setScoreWeights: state.setScoreWeights,
      resetToDefaults: state.resetToDefaults,
    })),
  );
}

export function useHasApiKey() {
  return useStore((state) => state.apiKey.trim().length > 0);
}
