import { create } from "zustand";

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const useStore = create<AppState>((set) => ({
  apiKey: "",
  setApiKey: (key) => set({ apiKey: key }),
}));
