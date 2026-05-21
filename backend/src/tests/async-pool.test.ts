import { describe, expect, it } from "vitest";
import { chunkArray, mapWithConcurrency } from "../utils/async-pool.js";

describe("async-pool", () => {
  it("chunks arrays into fixed-size batches", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("runs workers with a concurrency limit", async () => {
    let active = 0;
    let maxActive = 0;

    const results = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (value) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
      return value * 2;
    });

    expect(results).toEqual([2, 4, 6, 8, 10, 12]);
    expect(maxActive).toBeLessThanOrEqual(2);
    expect(maxActive).toBe(2);
  });
});
