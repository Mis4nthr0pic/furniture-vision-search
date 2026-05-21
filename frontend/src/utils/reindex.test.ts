import { describe, expect, it } from "vitest";
import {
  formatReindexStatusLine,
  getActiveStepIndex,
  getReindexProgressPercent,
} from "./reindex";
import type { EmbeddingsProgress } from "../types";

describe("reindex utils", () => {
  it("computes percent from current and total", () => {
    const progress: EmbeddingsProgress = { phase: "embedding", current: 500, total: 2500 };
    expect(getReindexProgressPercent(progress)).toBe(20);
  });

  it("returns 100 when done", () => {
    expect(getReindexProgressPercent({ phase: "done", current: 2500, total: 2500 })).toBe(100);
  });

  it("maps phases to step index", () => {
    expect(getActiveStepIndex("embedding")).toBe(1);
    expect(getActiveStepIndex("done")).toBe(3);
  });

  it("formats status line with counts", () => {
    expect(
      formatReindexStatusLine({ phase: "embedding", current: 100, total: 2500 }),
    ).toBe("100 of 2,500 products embedded");
  });
});
