import { randomUUID } from "node:crypto";
import type { VisionFeatures } from "../schemas/llm.js";
import type { RetrievalConfig } from "../schemas/retrieval.js";
import { AppError } from "../utils/errors.js";

export interface SearchLog {
  id: string;
  timestamp: string;
  visionFeatures: VisionFeatures;
  userPrompt?: string;
  resultIds: string[];
  configUsed: RetrievalConfig;
  ratings: Record<string, boolean>;
}

export interface LiveEvalMetrics {
  totalSearches: number;
  totalRatings: number;
  avgPrecisionAt5: number;
  avgPrecisionAt10: number;
  avgMRR: number;
}

const MAX_LOGS = 200;

let logs: SearchLog[] = [];

function precisionAtK(log: SearchLog, k: number): number | null {
  const topK = log.resultIds.slice(0, k);
  const rated = topK.filter((id) => id in log.ratings);
  if (rated.length === 0) return null;

  const relevant = rated.filter((id) => log.ratings[id] === true).length;
  return relevant / rated.length;
}

function reciprocalRank(log: SearchLog): number {
  for (let i = 0; i < log.resultIds.length; i++) {
    const id = log.resultIds[i]!;
    if (log.ratings[id] === true) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export const LiveEvalService = {
  reset(): void {
    logs = [];
  },

  recordSearch(args: {
    visionFeatures: VisionFeatures;
    userPrompt?: string;
    resultIds: string[];
    configUsed: RetrievalConfig;
  }): string {
    const entry: SearchLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      visionFeatures: args.visionFeatures,
      userPrompt: args.userPrompt,
      resultIds: args.resultIds,
      configUsed: args.configUsed,
      ratings: {},
    };

    logs.unshift(entry);
    if (logs.length > MAX_LOGS) {
      logs = logs.slice(0, MAX_LOGS);
    }

    return entry.id;
  },

  rate(args: { searchId: string; productId: string; relevant: boolean }): SearchLog {
    const log = logs.find((entry) => entry.id === args.searchId);
    if (!log) {
      throw new AppError("SEARCH_NOT_FOUND", "Search log not found", 404);
    }

    if (!log.resultIds.includes(args.productId)) {
      throw new AppError("PRODUCT_NOT_IN_RESULTS", "Product was not in this search result set", 400);
    }

    log.ratings[args.productId] = args.relevant;
    return log;
  },

  getMetrics(): LiveEvalMetrics {
    const totalRatings = logs.reduce((sum, log) => sum + Object.keys(log.ratings).length, 0);

    const precision5 = logs
      .map((log) => precisionAtK(log, 5))
      .filter((value): value is number => value !== null);
    const precision10 = logs
      .map((log) => precisionAtK(log, 10))
      .filter((value): value is number => value !== null);

    const mrrValues = logs
      .filter((log) => Object.values(log.ratings).some(Boolean))
      .map(reciprocalRank);

    return {
      totalSearches: logs.length,
      totalRatings,
      avgPrecisionAt5: average(precision5),
      avgPrecisionAt10: average(precision10),
      avgMRR: average(mrrValues),
    };
  },

  getLogs(limit = 50): SearchLog[] {
    const capped = Math.min(Math.max(limit, 1), MAX_LOGS);
    return logs.slice(0, capped);
  },
};
