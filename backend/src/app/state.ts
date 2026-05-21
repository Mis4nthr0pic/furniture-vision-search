export interface AppState {
  mongoOk: boolean;
  productCount: number;
  lexicalReady: boolean;
  embeddingsReady: boolean;
}

const initialState: AppState = {
  mongoOk: false,
  productCount: 0,
  lexicalReady: false,
  embeddingsReady: false,
};

let state: AppState = { ...initialState };

export function getAppState(): AppState {
  return state;
}

export function setAppState(partial: Partial<AppState>): AppState {
  state = { ...state, ...partial };
  return state;
}

export function resetAppState(): void {
  state = { ...initialState };
}
