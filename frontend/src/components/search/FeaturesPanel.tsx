import { memo } from "react";
import type { SearchTimings, VisionFeatures } from "../../types";
import { formatMs } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Card, CardHeader } from "../ui/Card";

interface FeaturesPanelProps {
  visionFeatures: VisionFeatures | null;
  timings: SearchTimings | null;
}

export const FeaturesPanel = memo(function FeaturesPanel({
  visionFeatures,
  timings,
}: FeaturesPanelProps) {
  if (!visionFeatures) {
    return (
      <Card className="sticky top-24 animate-fade-in">
        <CardHeader
          title="Vision analysis"
          description="Extracted attributes appear here after a search."
        />
        <div className="rounded-xl border border-dashed border-surface-border bg-brand-50/50 px-4 py-8 text-center text-sm text-stone-500">
          Upload an image and run search to inspect category, style, color, and more.
        </div>
      </Card>
    );
  }

  const attributes = [
    ["Category", visionFeatures.category],
    ["Type", visionFeatures.type],
    ["Style", visionFeatures.style],
    ["Color", visionFeatures.color],
    ["Material", visionFeatures.material],
  ] as const;

  return (
    <Card className="sticky top-24 animate-fade-in">
      <CardHeader title="Vision analysis" description="Catalog-aware extraction" />

      <p className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm leading-relaxed text-stone-700">
        {visionFeatures.description}
      </p>

      <dl className="mt-4 space-y-2">
        {attributes.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-stone-500">{label}</dt>
            <dd className="font-medium text-stone-900">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {visionFeatures.keywords.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Keywords</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visionFeatures.keywords.map((keyword) => (
              <Badge key={keyword} tone="brand">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {timings && (
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-surface-border pt-4 text-xs text-stone-500">
          <span>Vision {formatMs(timings.visionMs)}</span>
          <span>Retrieval {formatMs(timings.retrievalMs)}</span>
          <span>Rerank {formatMs(timings.rerankMs)}</span>
          <span className="font-medium text-stone-700">Total {formatMs(timings.totalMs)}</span>
        </div>
      )}
    </Card>
  );
});
