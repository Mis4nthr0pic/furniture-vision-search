import { useEffect, useState } from "react";
import {
  type SearchProgressStep,
  computeSearchProgress,
  getSearchProgressSteps,
} from "../utils/search-progress";

export function useSearchProgress(active: boolean, enableRerank: boolean) {
  const [stepIndex, setStepIndex] = useState(0);
  const [percent, setPercent] = useState(0);
  const steps = getSearchProgressSteps(enableRerank);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setPercent(0);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const progress = computeSearchProgress(Date.now() - startedAt, enableRerank);
      setStepIndex(progress.stepIndex);
      setPercent(progress.percent);
    }, 120);

    return () => window.clearInterval(timer);
  }, [active, enableRerank]);

  const step: SearchProgressStep = steps[stepIndex] ?? steps[0]!;

  return { stepIndex, percent, steps, step };
}
