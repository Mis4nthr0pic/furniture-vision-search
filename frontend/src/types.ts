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

export interface RetrievalConfig {
  mode?: "hybrid" | "vector_only" | "lexical_only" | "filter_only";
  k?: number;
  n?: number;
  enableRerank?: boolean;
  useImageInRerank?: boolean;
  filterMode?: "auto" | "strict" | "off";
  confidenceThreshold?: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
