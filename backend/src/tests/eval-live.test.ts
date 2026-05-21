import { beforeEach, describe, expect, it } from "vitest";
import type { VisionFeatures } from "../schemas/llm.js";
import { parseRetrievalConfig } from "../schemas/retrieval.js";
import { LiveEvalService } from "../services/eval-live.service.js";

const vision: VisionFeatures = {
  category: "Bookshelves",
  type: "Wide Bookshelf",
  style: "Minimalist",
  color: "Espresso",
  material: "Walnut",
  description: "A tall espresso bookshelf",
  keywords: ["bookshelf"],
  confidence: { category: 0.9, type: 0.8, color: 0.7, style: 0.6 },
};

const config = parseRetrievalConfig({});

describe("LiveEvalService", () => {
  beforeEach(() => {
    LiveEvalService.reset();
  });

  it("records searches and ratings", () => {
    const searchId = LiveEvalService.recordSearch({
      visionFeatures: vision,
      resultIds: ["a", "b", "c"],
      configUsed: config,
    });

    LiveEvalService.rate({ searchId, productId: "b", relevant: true });
    LiveEvalService.rate({ searchId, productId: "c", relevant: false });

    const logs = LiveEvalService.getLogs(10);
    expect(logs[0]?.ratings).toEqual({ b: true, c: false });
  });

  it("computes rolling metrics from rated logs", () => {
    const searchId = LiveEvalService.recordSearch({
      visionFeatures: vision,
      resultIds: ["a", "b", "c", "d", "e"],
      configUsed: config,
    });

    LiveEvalService.rate({ searchId, productId: "b", relevant: true });
    LiveEvalService.rate({ searchId, productId: "c", relevant: false });

    const metrics = LiveEvalService.getMetrics();
    expect(metrics.totalSearches).toBe(1);
    expect(metrics.totalRatings).toBe(2);
    expect(metrics.avgPrecisionAt5).toBe(0.5);
    expect(metrics.avgMRR).toBe(0.5);
  });

  it("rejects rating a product outside the result set", () => {
    const searchId = LiveEvalService.recordSearch({
      visionFeatures: vision,
      resultIds: ["a"],
      configUsed: config,
    });

    expect(() =>
      LiveEvalService.rate({ searchId, productId: "missing", relevant: true }),
    ).toThrow();
  });
});
