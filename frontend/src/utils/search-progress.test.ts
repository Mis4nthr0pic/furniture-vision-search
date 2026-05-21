import { describe, expect, it } from "vitest";
import { computeSearchProgress, getSearchProgressSteps } from "./search-progress";

describe("getSearchProgressSteps", () => {
  it("includes rerank when enabled", () => {
    expect(getSearchProgressSteps(true)).toHaveLength(3);
  });

  it("omits rerank when disabled", () => {
    expect(getSearchProgressSteps(false).map((step) => step.id)).toEqual(["vision", "retrieval"]);
  });
});

describe("computeSearchProgress", () => {
  it("starts in the vision phase", () => {
    const progress = computeSearchProgress(500, true);
    expect(progress.step.id).toBe("vision");
    expect(progress.percent).toBeGreaterThan(0);
    expect(progress.percent).toBeLessThan(30);
  });

  it("advances into retrieval and rerank phases", () => {
    expect(computeSearchProgress(5000, true).step.id).toBe("retrieval");
    expect(computeSearchProgress(7000, true).step.id).toBe("rerank");
  });

  it("never reaches 100 while in progress", () => {
    expect(computeSearchProgress(20000, true).percent).toBeLessThanOrEqual(98);
  });
});
