import { memo } from "react";
import type { SearchTimings, VisionFeatures } from "../../types";
import { formatMs } from "../../utils/format";
import { confidenceTone, formatConfidencePercent, isLowVisionConfidence } from "../../utils/vision";
import { Card, CardHeader } from "../ui/Card";

interface FeaturesPanelProps {
  visionFeatures: VisionFeatures | null;
  timings: SearchTimings | null;
}

const confidenceSalonClass: Record<string, string> = {
  high: "border-teal/50 text-teal",
  medium: "border-ochre/50 text-ochre",
  low: "border-plum/50 text-plum",
};

export const FeaturesPanel = memo(function FeaturesPanel({
  visionFeatures,
  timings,
}: FeaturesPanelProps) {
  if (!visionFeatures) {
    return (
      <Card className="lg:sticky lg:top-24 animate-fade-in">
        <CardHeader
          kicker="✦ No. 02"
          title="Tasting notes"
          description="Vision extraction appears here after a search."
        />
        <div className="rounded-lg border border-dashed border-cream/15 px-4 py-10 text-center font-serif text-sm italic text-cream/45">
          Upload an image and search to inspect category, style, color, and more.
        </div>
        <p className="mt-4 font-hand text-lg text-ochre" style={{ transform: "rotate(3deg)" }}>
          waiting…
        </p>
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
    <Card className="lg:sticky lg:top-24 animate-fade-in">
      <CardHeader
        kicker="✦ No. 02"
        title="Tasting notes"
        description="Catalog-aware vision extraction"
      />

      {lowConfidence && (
        <p className="mb-4 rounded-lg border border-ochre/40 bg-ochre/10 px-3 py-2 font-serif text-xs italic leading-relaxed text-cream/90">
          Confidence is low — filters won&apos;t narrow the catalog. Ranking still uses vectors,
          lexical, and rerank.
        </p>
      )}

      <p className="rounded-lg border border-cream/10 bg-burgundy/50 px-3 py-3 font-serif text-sm italic leading-relaxed text-cream/85">
        {visionFeatures.description}
      </p>

      <dl className="mt-5 space-y-3">
        {attributes.map(([label, value, confidence]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-cream/45">
              {label}
            </dt>
            <dd className="flex items-center gap-2 font-serif italic text-cream">
              <span>{value ?? "—"}</span>
              {confidence != null && (
                <span
                  className={`rounded-pill border px-2 py-0.5 font-mono text-[10px] not-italic ${confidenceSalonClass[confidenceTone(confidence)]}`}
                  title="Model confidence (not match quality)"
                >
                  {formatConfidencePercent(confidence)}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {visionFeatures.keywords.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-kicker text-terracotta">
            Keywords
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {visionFeatures.keywords.map((keyword) => (
              <span key={keyword} className="salon-chip">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {timings && (
        <div className="mt-6 grid grid-cols-2 gap-2 border-t border-cream/10 pt-4 font-mono text-[10px] uppercase tracking-wider text-cream/45">
          <span>Vision {formatMs(timings.visionMs)}</span>
          <span>Retrieval {formatMs(timings.retrievalMs)}</span>
          <span>Rerank {formatMs(timings.rerankMs)}</span>
          <span className="text-terracotta">Total {formatMs(timings.totalMs)}</span>
        </div>
      )}
    </Card>
  );
});
