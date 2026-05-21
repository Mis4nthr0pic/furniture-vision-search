import { describe, expect, it } from "vitest";
import { MinIntervalGate } from "../utils/min-interval-gate.js";

describe("MinIntervalGate", () => {
  it("spaces out consecutive waits", async () => {
    const gate = new MinIntervalGate(40);
    const startedAt = Date.now();

    await gate.wait();
    await gate.wait();

    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(35);
  });
});
