import type { SearchTimings, VisionFeatures } from "../types";

interface FeaturesPanelProps {
  visionFeatures: VisionFeatures | null;
  timings: SearchTimings | null;
}

function formatMs(ms: number | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function FeaturesPanel({ visionFeatures, timings }: FeaturesPanelProps) {
  if (!visionFeatures) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Vision features</h2>
        <p className="mt-2 text-sm text-slate-500">Run a search to see extracted attributes.</p>
      </aside>
    );
  }

  const rows = [
    ["Category", visionFeatures.category],
    ["Type", visionFeatures.type],
    ["Style", visionFeatures.style],
    ["Color", visionFeatures.color],
    ["Material", visionFeatures.material],
  ];

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Vision features</h2>
      <p className="mt-2 text-sm text-slate-600">{visionFeatures.description}</p>

      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium text-slate-800">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {visionFeatures.keywords.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Keywords</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visionFeatures.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {timings && (
        <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p>Vision {formatMs(timings.visionMs)} · Retrieval {formatMs(timings.retrievalMs)}</p>
          <p>
            Rerank {formatMs(timings.rerankMs)} · Total {formatMs(timings.totalMs)}
          </p>
        </div>
      )}
    </aside>
  );
}
