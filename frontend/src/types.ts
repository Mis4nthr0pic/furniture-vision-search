export interface ScoreBreakdown {
  vec: number;
  lex: number;
  cat: number;
  type: number;
  color: number;
  style: number;
  mat: number;
  dim: number;
}

export interface VisionFeatures {
  category?: string | null;
  type?: string | null;
  style?: string | null;
  color?: string | null;
  material?: string | null;
  description: string;
  keywords: string[];
  confidence: {
    category: number;
    type: number;
    color: number;
    style: number;
  };
  est_dimensions?: {
    width_cm?: number;
    height_cm?: number;
    depth_cm?: number;
  };
}

export interface RankedProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: number;
  width: number;
  height: number;
  depth: number;
  attrs: {
    style: string;
    material: string;
    color: string;
  };
  score: number;
  breakdown: ScoreBreakdown;
  contributions: ScoreBreakdown;
  reason?: string;
  rerankScore?: number;
}

export interface SearchTimings {
  visionMs: number;
  retrievalMs: number;
  rerankMs: number;
  totalMs: number;
}

export interface SearchResponse {
  searchId: string;
  visionFeatures: VisionFeatures;
  ranked: RankedProduct[];
  warnings: string[];
  rerank_error?: string;
  timings: SearchTimings;
}

export interface LLMConfig {
  apiKey: string;
  baseUrl?: string;
  visionModel?: string;
  chatModel?: string;
  embedModel?: string;
}

export interface ScoreWeights {
  w_vec: number;
  w_lex: number;
  w_cat: number;
  w_type: number;
  w_color: number;
  w_style: number;
  w_mat: number;
  w_dim: number;
}

export interface RetrievalConfig {
  mode?: "hybrid" | "vector_only" | "lexical_only" | "filter_only";
  k?: number;
  n?: number;
  enableRerank?: boolean;
  useImageInRerank?: boolean;
  filterMode?: "auto" | "strict" | "off";
  confidenceThreshold?: number;
  weights?: ScoreWeights;
  priceTolerancePercent?: number;
  visionSystemPrompt?: string;
  rerankSystemPrompt?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface CatalogMeta {
  categories: string[];
  types: string[];
  styles: string[];
  materials: string[];
  colors: string[];
  priceRange: { min: number; max: number };
  dimRanges: {
    width: { min: number; max: number };
    height: { min: number; max: number };
    depth: { min: number; max: number };
  };
  productCount: number;
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  embeddingsReady: boolean;
  embeddingsItemCount: number;
  embeddingsLastIndexed: string | null;
}

export interface EmbeddingsProgress {
  phase: "start" | "embedding" | "writing" | "done" | "error";
  current: number;
  total: number;
  message?: string;
}

export interface StaticEvalSummary {
  top1_category_match: number;
  top1_type_match: number;
  top1_color_match: number;
  top10_category_match: number;
  top10_type_match: number;
  attribute_recall_top1: number;
  mrr: number;
  avg_latency_ms: number;
}

export interface StaticEvalCaseResult {
  id: string;
  passed: boolean;
  top: Array<{
    id: string;
    title: string;
    category: string;
    type: string;
    color: string;
    style: string;
    material: string;
    score: number;
  }>;
  expected: Record<string, string | undefined>;
  latencyMs: number;
}

export interface StaticEvalResponse {
  summary: StaticEvalSummary;
  cases: StaticEvalCaseResult[];
}

export interface LiveEvalMetrics {
  totalSearches: number;
  totalRatings: number;
  avgPrecisionAt5: number;
  avgPrecisionAt10: number;
  avgMRR: number;
}

export interface SearchLogEntry {
  id: string;
  timestamp: string;
  userPrompt?: string;
  resultIds: string[];
  ratings: Record<string, boolean>;
  visionFeatures: Pick<VisionFeatures, "category" | "type" | "description">;
}
