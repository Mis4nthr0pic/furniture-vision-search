import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { LLMConfig } from "../schemas/llm.js";
import type { RetrievalConfig } from "../schemas/retrieval.js";
import { equalsIgnoreCase } from "./retrieval.service.js";
import { SearchService } from "./search.service.js";

const evalDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../eval");

const expectedSchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
  material: z.string().optional(),
});

const evalCaseSchema = z.object({
  id: z.string(),
  image_path: z.string(),
  user_prompt: z.string().default(""),
  expected: expectedSchema,
});

export type EvalCase = z.infer<typeof evalCaseSchema>;

export function loadEvalCases(): EvalCase[] {
  const raw = readFileSync(path.join(evalDir, "cases.json"), "utf-8");
  return z.array(evalCaseSchema).parse(JSON.parse(raw));
}

export function resolveEvalImagePath(imagePath: string): string {
  return path.join(evalDir, imagePath);
}

function countExpectedMatches(
  result: {
    category: string;
    type: string;
    attrs: { color: string; style: string; material: string };
  },
  expected: EvalCase["expected"],
): { matched: number; total: number } {
  const keys = Object.entries(expected).filter(([, value]) => value != null);
  let matched = 0;

  for (const [key, value] of keys) {
    if (key === "category" && equalsIgnoreCase(result.category, value)) matched++;
    else if (key === "type" && equalsIgnoreCase(result.type, value)) matched++;
    else if (key === "color" && equalsIgnoreCase(result.attrs.color, value)) matched++;
    else if (key === "style" && equalsIgnoreCase(result.attrs.style, value)) matched++;
    else if (key === "material" && equalsIgnoreCase(result.attrs.material, value)) matched++;
  }

  return { matched, total: keys.length };
}

function reciprocalRank(
  ranked: Array<{
    category: string;
    type: string;
    attrs: { color: string; style: string; material: string };
  }>,
  expected: EvalCase["expected"],
): number {
  for (let i = 0; i < ranked.length; i++) {
    const { matched, total } = countExpectedMatches(ranked[i]!, expected);
    if (total > 0 && matched === total) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

export const StaticEvalService = {
  async run(args: { llmConfig: LLMConfig; retrievalConfig: RetrievalConfig }) {
    const cases = loadEvalCases();
    const config: RetrievalConfig = {
      ...args.retrievalConfig,
      enableRerank: false,
      n: Math.max(args.retrievalConfig.n, 10),
    };

    const caseResults = [];
    let totalLatency = 0;

    for (const evalCase of cases) {
      const imagePath = resolveEvalImagePath(evalCase.image_path);
      const imageBuffer = readFileSync(imagePath);
      const started = Date.now();

      const search = await SearchService.search({
        imageBuffer,
        mimeType: "image/jpeg",
        userPrompt: evalCase.user_prompt || undefined,
        llmConfig: args.llmConfig,
        retrievalConfig: config,
      });

      totalLatency += Date.now() - started;
      const top = search.ranked.slice(0, 10);
      const top1 = top[0];
      const expected = evalCase.expected;

      const top1Recall = top1 ? countExpectedMatches(top1, expected) : { matched: 0, total: 0 };

      caseResults.push({
        id: evalCase.id,
        passed: top1Recall.total > 0 && top1Recall.matched === top1Recall.total,
        top: top.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          type: item.type,
          color: item.attrs.color,
          style: item.attrs.style,
          material: item.attrs.material,
          score: item.score,
        })),
        expected,
        visionFeatures: search.visionFeatures,
        latencyMs: search.timings.totalMs,
      });
    }

    const n = cases.length;
    const top1 = caseResults.map((c) => c.top[0]).filter(Boolean);

    const summary = {
      top1_category_match:
        top1.filter((r, i) => equalsIgnoreCase(r!.category, cases[i]!.expected.category)).length /
        n,
      top1_type_match:
        top1.filter((r, i) => equalsIgnoreCase(r!.type, cases[i]!.expected.type)).length / n,
      top1_color_match:
        top1.filter((r, i) => equalsIgnoreCase(r!.color, cases[i]!.expected.color)).length / n,
      top10_category_match:
        caseResults.filter((c, i) =>
          c.top.some((r) => equalsIgnoreCase(r.category, cases[i]!.expected.category)),
        ).length / n,
      top10_type_match:
        caseResults.filter((c, i) =>
          c.top.some((r) => equalsIgnoreCase(r.type, cases[i]!.expected.type)),
        ).length / n,
      attribute_recall_top1:
        caseResults.reduce((sum, c, i) => {
          const topResult = c.top[0];
          if (!topResult) return sum;
          const { matched, total } = countExpectedMatches(
            {
              category: topResult.category,
              type: topResult.type,
              attrs: {
                color: topResult.color,
                style: topResult.style,
                material: topResult.material,
              },
            },
            cases[i]!.expected,
          );
          return sum + (total === 0 ? 0 : matched / total);
        }, 0) / n,
      mrr:
        caseResults.reduce((sum, c, i) => {
          const ranked = c.top.map((r) => ({
            category: r.category,
            type: r.type,
            attrs: { color: r.color, style: r.style, material: r.material },
          }));
          return sum + reciprocalRank(ranked, cases[i]!.expected);
        }, 0) / n,
      avg_latency_ms: Math.round(totalLatency / n),
    };

    return { summary, cases: caseResults };
  },
};
