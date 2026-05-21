import { memo, useState } from "react";
import type { RankedProduct } from "../../types";
import { cn, formatPrice } from "../../utils/format";
import { FurnitureSilhouette } from "../editorial/FurnitureSilhouette";
import { ScoreGauge } from "../editorial/ScoreGauge";
import { Button } from "../ui/Button";

interface ResultCardProps {
  rank: number;
  product: RankedProduct;
  rating?: boolean;
  onRate: (relevant: boolean) => void;
  disabled?: boolean;
}

interface ScoreRow {
  label: string;
  value: number;
}

export const ResultCard = memo(function ResultCard({
  rank,
  product,
  rating,
  onRate,
  disabled,
}: ResultCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const selected = rating === true;
  const dismissed = rating === false;

  const displayScore = product.rerankScore ?? product.score;
  const scoreLabel = product.rerankScore != null ? "rerank" : "hybrid";

  const rows: ScoreRow[] = [
    { label: "vector", value: product.contributions.vec },
    { label: "lexical", value: product.contributions.lex },
    { label: "category", value: product.contributions.cat },
    { label: "type", value: product.contributions.type },
    { label: "color", value: product.contributions.color },
    { label: "style", value: product.contributions.style },
  ];
  const maxRow = Math.max(...rows.map((r) => r.value), 0.01);

  const chips = [product.attrs.material, product.attrs.color, product.attrs.style].filter(Boolean);

  return (
    <article
      className={cn(
        "group flex flex-col border border-hair bg-panel transition",
        "hover:border-hairStrong",
        selected && "border-accent/50 ring-1 ring-accent/30",
        dismissed && "opacity-60",
      )}
    >
      {/* Image area — silhouette placeholder on dark panel */}
      <div className="relative aspect-[5/3] overflow-hidden bg-panelInk">
        <div className="flex h-full w-full items-center justify-center px-10 py-6">
          <FurnitureSilhouette category={product.category} className="text-accent/80" />
        </div>

        <span className="absolute left-0 top-0 border-b border-r border-hair bg-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          № {String(rank).padStart(2, "0")} / {product.id.slice(-4)}
        </span>

        <span className="absolute right-0 top-0 border-b border-l border-hair bg-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
          {product.category} · {product.type}
        </span>

        <span className="absolute bottom-1.5 left-1.5 inline-flex items-center bg-accent px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-bg">
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-3">
        <div>
          <h3 className="text-[13px] font-medium leading-snug tracking-[-0.01em] text-ink">
            {product.title}
          </h3>
          {chips.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="border border-hair bg-bg px-1 py-px font-mono text-[9px] uppercase tracking-wide text-ink-soft"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score + breakdown */}
        <button
          type="button"
          onClick={() => setShowBreakdown((open) => !open)}
          aria-expanded={showBreakdown}
          className="flex items-center gap-2.5 border border-hair bg-bg px-2 py-1.5 text-left transition hover:border-hairStrong"
          style={{ borderRadius: 4 }}
        >
          <ScoreGauge score={displayScore} label={scoreLabel} size={40} />
          <div className="min-w-0 flex-1 space-y-0.5">
            {product.rerankScore != null && (
              <p className="font-mono text-[9px] tabular-nums text-ink-muted">
                hybrid {product.score.toFixed(2)}
              </p>
            )}
            {rows.slice(0, 4).map((row) => (
              <div key={row.label} className="flex items-center gap-1.5">
                <span className="w-12 font-mono text-[9px] uppercase tracking-wider text-ink-muted">
                  {row.label}
                </span>
                <div className="h-1 flex-1 overflow-hidden bg-panelDeep">
                  <div
                    className="h-full bg-accent/70"
                    style={{ width: `${Math.min(100, (row.value / maxRow) * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] tabular-nums text-ink-soft">
                  {row.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </button>

        {showBreakdown && (
          <div className="space-y-1 border border-hair bg-bg px-3 py-2 font-mono text-[10px] text-ink-muted">
            {rows.slice(4).map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="w-14 uppercase tracking-wider">{row.label}</span>
                <div className="h-1 flex-1 overflow-hidden bg-panelDeep">
                  <div
                    className="h-full bg-accent/60"
                    style={{ width: `${Math.min(100, (row.value / maxRow) * 100)}%` }}
                  />
                </div>
                <span className="tabular-nums">{row.value.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-hair pt-1">
              raw vec {product.breakdown.vec.toFixed(2)} · lex {product.breakdown.lex.toFixed(2)}
              {product.rerankScore != null && ` · rerank ${product.rerankScore.toFixed(2)}`}
            </div>
          </div>
        )}

        {product.reason && (
          <blockquote className="border-l-2 border-accent/60 pl-2 font-emphasis text-[12px] italic leading-snug text-ink-soft">
            &ldquo;{product.reason}&rdquo;
          </blockquote>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-hair pt-2">
          <Button
            variant={rating === true ? "success" : "secondary"}
            disabled={disabled}
            className="!px-2.5 !py-1.5 !text-[11px]"
            onClick={() => onRate(true)}
          >
            Relevant
          </Button>
          <Button
            variant={rating === false ? "danger" : "secondary"}
            disabled={disabled}
            className="!px-2.5 !py-1.5 !text-[11px]"
            onClick={() => onRate(false)}
          >
            Not relevant
          </Button>
        </div>
      </div>
    </article>
  );
});
