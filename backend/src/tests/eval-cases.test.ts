import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadEvalCases, resolveEvalImagePath } from "../services/eval-static.service.js";

describe("static eval cases", () => {
  it("loads 6 cases from cases.json", () => {
    const cases = loadEvalCases();
    expect(cases).toHaveLength(6);
    expect(cases[0]?.id).toBe("case_01");
  });

  it("resolves image paths that exist on disk", () => {
    for (const evalCase of loadEvalCases()) {
      expect(existsSync(resolveEvalImagePath(evalCase.image_path))).toBe(true);
    }
  });
});
