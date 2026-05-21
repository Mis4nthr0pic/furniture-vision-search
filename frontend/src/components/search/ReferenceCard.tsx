import { memo } from "react";
import type { VisionFeatures } from "../../types";
import { confidenceTone, confidenceToneClass, formatConfidencePercent } from "../../utils/vision";
import { FurnitureSilhouette } from "../editorial/FurnitureSilhouette";

interface ReferenceCardProps {
  previewUrl: string | null;
  fileName?: string | null;
  visionFeatures: VisionFeatures | null;
}

export const ReferenceCard = memo(function ReferenceCard({
  previewUrl,
  fileName,
  visionFeatures,
}: ReferenceCardProps) {
  const rows: Array<[string, string | null | undefined, number | null]> = [
    ["type", visionFeatures?.type, visionFeatures?.confidence.type ?? null],
    ["material", visionFeatures?.material, null],
    ["color", visionFeatures?.color, visionFeatures?.confidence.color ?? null],
    ["style", visionFeatures?.style, visionFeatures?.confidence.style ?? null],
  ];

  return (
    <aside className="instrument-panel flex h-full flex-col overflow-hidden">
      {/* Image / silhouette panel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-panelInk">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fileName ?? "uploaded reference"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-8">
            <FurnitureSilhouette
              category={visionFeatures?.category ?? null}
              className="text-accent/60"
            />
          </div>
        )}

        {visionFeatures?.description && (
          <div className="absolute inset-x-2 bottom-2 border border-bg/20 bg-panelInk/85 px-2 py-1.5 backdrop-blur-sm">
            <p className="line-clamp-3 font-emphasis text-[11px] italic leading-snug text-bg/90">
              &ldquo;{visionFeatures.description}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Extracted attributes */}
      <div className="flex flex-col gap-2 px-3 py-3">
        {visionFeatures ? (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              {visionFeatures.category && (
                <span className="border border-accent/40 bg-accent/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                  {visionFeatures.category}
                </span>
              )}
              {visionFeatures.keywords.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="border border-hair bg-bg px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft"
                >
                  {kw}
                </span>
              ))}
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-hair pt-2">
              {rows.map(([label, value, confidence]) => (
                <div key={label} className="flex items-baseline justify-between gap-2">
                  <dt className="font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                    {label}
                  </dt>
                  <dd className="flex items-center gap-1">
                    <span className="text-[12px] text-ink">{value ?? "—"}</span>
                    {confidence != null && (
                      <span
                        className={`border px-1 py-px font-mono text-[9px] tabular-nums ${confidenceToneClass[confidenceTone(confidence)]}`}
                      >
                        {formatConfidencePercent(confidence)}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Upload a photo to see the extracted attributes here.
          </p>
        )}
      </div>
    </aside>
  );
});
