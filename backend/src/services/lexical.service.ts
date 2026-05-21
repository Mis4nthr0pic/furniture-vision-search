import {
  initLexicalIndex,
  isLexicalReady,
  searchLexical,
  type LexicalSearchResult,
} from "../catalog/lexical.js";
import { config } from "../config.js";
import type { EnrichedProduct } from "../types.js";
import { AppError } from "../utils/errors.js";

export const LexicalService = {
  init(products: EnrichedProduct[]): void {
    initLexicalIndex(products);
  },

  isReady(): boolean {
    return isLexicalReady();
  },

  debugSearch(query: string, limit = config.lexical.defaultLimit): LexicalSearchResult[] {
    if (!isLexicalReady()) {
      throw new AppError("LEXICAL_NOT_READY", "Lexical index is not ready", 503);
    }
    return searchLexical(query, limit);
  },
};
