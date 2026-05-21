import type { RankedProduct } from "../types";

export function formatMs(ms: number | undefined | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatScoreBreakdown(product: RankedProduct): string[] {
  const { breakdown, contributions } = product;
  return [
    `Hybrid score: ${product.score.toFixed(3)}`,
    ...(product.rerankScore != null ? [`Rerank: ${product.rerankScore.toFixed(2)}`] : []),
    `Vector ${contributions.vec.toFixed(3)} · Lexical ${contributions.lex.toFixed(3)} · Category ${contributions.cat.toFixed(3)}`,
    `Type ${contributions.type.toFixed(3)} · Color ${contributions.color.toFixed(3)} · Style ${contributions.style.toFixed(3)}`,
    `Dimensions ${contributions.dim.toFixed(3)} (raw vec ${breakdown.vec.toFixed(2)}, lex ${breakdown.lex.toFixed(2)})`,
  ];
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
