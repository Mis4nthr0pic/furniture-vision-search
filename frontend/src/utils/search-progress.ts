export interface SearchProgressStep {
  id: "vision" | "retrieval" | "rerank";
  kicker: string;
  label: string;
}

export const SEARCH_PROGRESS_STEPS: SearchProgressStep[] = [
  { id: "vision", kicker: "No. 01", label: "Reading the photograph" },
  { id: "retrieval", kicker: "No. 02", label: "Searching the catalog" },
  { id: "rerank", kicker: "No. 03", label: "Ranking with visual judgment" },
];

export function getSearchProgressSteps(enableRerank: boolean): SearchProgressStep[] {
  if (enableRerank) return SEARCH_PROGRESS_STEPS;
  return SEARCH_PROGRESS_STEPS.filter((step) => step.id !== "rerank");
}

/** Estimated phase durations (ms) used to animate progress while the API runs. */
const PHASE_MS = {
  vision: 4500,
  retrieval: 1200,
  rerank: 5000,
} as const;

export interface SearchProgressState {
  stepIndex: number;
  percent: number;
  step: SearchProgressStep;
}

export function computeSearchProgress(
  elapsedMs: number,
  enableRerank: boolean,
): SearchProgressState {
  const steps = getSearchProgressSteps(enableRerank);
  const phases = enableRerank
    ? ([
        { key: "vision", weight: PHASE_MS.vision, floor: 0, ceiling: 42 },
        { key: "retrieval", weight: PHASE_MS.retrieval, floor: 42, ceiling: 68 },
        { key: "rerank", weight: PHASE_MS.rerank, floor: 68, ceiling: 96 },
      ] as const)
    : ([
        { key: "vision", weight: PHASE_MS.vision, floor: 0, ceiling: 72 },
        { key: "retrieval", weight: PHASE_MS.retrieval, floor: 72, ceiling: 96 },
      ] as const);

  let remaining = elapsedMs;
  let stepIndex = steps.length - 1;
  let percent: number = phases[phases.length - 1]?.ceiling ?? 96;

  for (let index = 0; index < phases.length; index++) {
    const phase = phases[index]!;
    if (remaining <= phase.weight) {
      stepIndex = index;
      const ratio = remaining / phase.weight;
      percent = phase.floor + ratio * (phase.ceiling - phase.floor);
      break;
    }
    remaining -= phase.weight;
  }

  // Asymptotic creep so the bar keeps moving on slow responses.
  if (elapsedMs > phases.reduce((sum, phase) => sum + phase.weight, 0)) {
    const overtime = elapsedMs - phases.reduce((sum, phase) => sum + phase.weight, 0);
    percent = Math.min(98, (phases[phases.length - 1]?.ceiling ?? 96) + overtime / 400);
    stepIndex = steps.length - 1;
  }

  return {
    stepIndex,
    percent: Math.min(98, Math.max(4, percent)),
    step: steps[stepIndex] ?? steps[0]!,
  };
}
