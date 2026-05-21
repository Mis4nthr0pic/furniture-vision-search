import { memo } from "react";
import type { SearchTimings, VisionFeatures } from "../../types";
import { formatMs } from "../../utils/format";
import {
  confidenceTone,
  confidenceToneClass,
  formatConfidencePercent,
  isLowVisionConfidence,
} from "../../utils/vision";
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
      <Card className="lg:sticky lg:top-16">
        <CardHeader
          sectionId="§ 1.2 · VISION"
          title="Extraction"
          description="awaiting query"
        />
        <p className="font-mono text-[11px] text-ink-muted">0 fields · idx_idle</p>
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
    <Card className="lg:sticky lg:top-16">
      <CardHeader sectionId="§ 1.2 · VISION" title="Extraction" description="catalog-constrained" />

      {lowConfidence && (
        <p className="mb-3 border border-warn/30 bg-warn/5 px-2 py-1.5 font-mono text-[11px] text-ink-soft">
          [warn] low confidence — filters relaxed · rank via hybrid
        </p>
      )}

      <p className="border border-hair bg-bg px-2 py-2 font-mono text-[11px] leading-relaxed text-ink-soft">
        {visionFeatures.description}
      </p>

      <table className="mt-3 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-hair bg-panelDeep">
            <th className="px-2 py-1.5 font-mono text-[10px] font-medium uppercase text-ink-muted">
              Field
            </th>
            <th className="px-2 py-1.5 font-mono text-[10px] font-medium uppercase text-ink-muted">
              Value
            </th>
            <th className="px-2 py-1.5 text-right font-mono text-[10px] font-medium uppercase text-ink-muted">
              Conf
            </th>
          </tr>
        </thead>
        <tbody>
          {attributes.map(([label, value, confidence]) => (
            <tr key={label} className="border-b border-hair hover:bg-panel">
              <td className="px-2 py-2 font-mono text-[10px] uppercase text-ink-muted">{label}</td>
              <td className="px-2 py-2 text-[13px] text-ink">{value ?? "—"}</td>
              <td className="px-2 py-2 text-right">
                {confidence != null && (
                  <span
                    className={`inline-block border px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${confidenceToneClass[confidenceTone(confidence)]}`}
                  >
                    {formatConfidencePercent(confidence)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visionFeatures.keywords.length > 0 && (
        <div className="mt-3 border-t border-hair pt-3">
          <p className="instrument-kicker">Keywords</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {visionFeatures.keywords.map((keyword) => (
              <span key={keyword} className="instrument-code">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {timings && (
        <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-hair pt-3 font-mono text-[10px] uppercase text-ink-muted">
          <span>Vision {formatMs(timings.visionMs)}</span>
          <span>Retrieval {formatMs(timings.retrievalMs)}</span>
          <span>Rerank {formatMs(timings.rerankMs)}</span>
          <span className="text-accent">Total {formatMs(timings.totalMs)}</span>
        </div>
      )}
    </Card>
  );
});
