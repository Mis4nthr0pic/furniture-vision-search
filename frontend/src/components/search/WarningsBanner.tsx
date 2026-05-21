import { memo } from "react";
import { Alert } from "../ui/Alert";

interface WarningsBannerProps {
  warnings: string[];
  rerankError?: string | null;
}

export const WarningsBanner = memo(function WarningsBanner({
  warnings,
  rerankError,
}: WarningsBannerProps) {
  const items = [...warnings];
  if (rerankError) items.push(`Rerank error: ${rerankError}`);
  if (items.length === 0) return null;

  return (
    <Alert tone="warning" title="Pipeline notices">
      <ul className="list-inside list-disc space-y-0.5">
        {items.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </Alert>
  );
});
