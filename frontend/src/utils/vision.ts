import type { VisionFeatures } from "../types";

export function formatConfidencePercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getMaxVisionConfidence(vision: VisionFeatures): number {
  const { confidence } = vision;
  return Math.max(confidence.category, confidence.type, confidence.color, confidence.style);
}

export function isLowVisionConfidence(vision: VisionFeatures, threshold = 0.7): boolean {
  return getMaxVisionConfidence(vision) < threshold;
}

export function confidenceTone(value: number): "strong" | "medium" | "weak" {
  if (value >= 0.7) return "strong";
  if (value >= 0.45) return "medium";
  return "weak";
}

export const confidenceToneClass: Record<ReturnType<typeof confidenceTone>, string> = {
  strong: "border-teal/50 text-teal",
  medium: "border-ochre/50 text-ochre",
  weak: "border-cream/20 text-cream/45",
};
