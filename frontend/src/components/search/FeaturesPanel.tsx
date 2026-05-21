import { memo } from "react";
import type { SearchTimings, VisionFeatures } from "../../types";
import { formatMs } from "../../utils/format";
import {
  confidenceTone,
  confidenceToneClass,
  formatConfidencePercent,
  isLowVisionConfidence,
} from "../../utils/vision";
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
    ["Category", visionFeatures.category, visionFeatures.confidence.category],
    ["Type", visionFeatures.type, visionFeatures.confidence.type],
    ["Style", visionFeatures.style, visionFeatures.confidence.style],
    ["Color", visionFeatures.color, visionFeatures.confidence.color],
    ["Material", visionFeatures.material, null],
  ] as const;

  const lowConfidence = isLowVisionConfidence(visionFeatures);

  return (
    <Card className="sticky top-24 animate-fade-in">
      <CardHeader title="Vision analysis" description="Catalog-aware extraction" />

      {lowConfidence && (
        <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
          Extraction confidence is low — category/type filters won&apos;t narrow the catalog. Ranking
          still uses description, keywords, vectors, and rerank. Try a clearer photo or lower{" "}
          <strong>Confidence threshold</strong> in Admin.
        </p>
      )}

      <p className="rounded-xl bg-brand-50 px-3 py-2.5 text-sm leading-relaxed text-stone-700">
        {visionFeatures.description}
      </p>

      <dl className="mt-4 space-y-2">
        {attributes.map(([label, value, confidence]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-stone-500">{label}</dt>
            <dd className="flex items-center gap-2 font-medium text-stone-900">
              <span>{value ?? "—"}</span>
              {confidence != null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${confidenceToneClass[confidenceTone(confidence)]}`}
                  title="Model confidence for this field (not match quality)"
                >
                  {formatConfidencePercent(confidence)}
                </span>
              )}
            </dd>
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
