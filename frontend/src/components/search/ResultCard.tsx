import { memo, useState } from "react";
import type { RankedProduct } from "../../types";
import { cn, formatPrice, formatScoreBreakdown } from "../../utils/format";
import { ScoreBar } from "../instrument/ScoreBar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface ResultCardProps {
  rank: number;
  product: RankedProduct;
  rating?: boolean;
  onRate: (relevant: boolean) => void;
  disabled?: boolean;
}

export const ResultCard = memo(function ResultCard({
  rank,
  product,
  rating,
  onRate,
  disabled,
}: ResultCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownLines = formatScoreBreakdown(product);
  const selected = rating === true;

  return (
    <article
      className={cn(
        "border-b border-hair bg-bg transition hover:bg-panel",
        selected && "border-l-2 border-l-accent bg-panel pl-[calc(1rem-2px)]",
        !selected && "pl-4",
      )}
    >
      <div className="grid grid-cols-[48px_1fr_auto] gap-3 py-3 pr-4">
        <div className="font-mono text-[13px] font-medium tabular-nums text-ink-muted">
          {String(rank).padStart(2, "0")}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{product.category}</Badge>
            <span className="font-mono text-[10px] text-ink-muted">id_{product.id.slice(-8)}</span>
          </div>
          <h3 className="mt-1 text-[14px] font-medium leading-snug text-ink">{product.title}</h3>
          <p className="mt-0.5 font-mono text-[11px] text-ink-soft">{product.type}</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-ink-muted">
            {product.attrs.color} · {product.attrs.material} · {product.attrs.style}
          </p>
          {product.reason && (
            <p className="mt-2 border-l border-hair pl-2 font-mono text-[11px] leading-relaxed text-ink-soft">
              → {product.reason}
            </p>
          )}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowBreakdown((open) => !open)}
            className="font-mono text-[13px] font-medium tabular-nums text-ink hover:text-accent"
            aria-expanded={showBreakdown}
          >
            {product.score.toFixed(3)}
          </button>
          {product.rerankScore != null && (
            <p className="font-mono text-[10px] tabular-nums text-ink-muted">
              rerank {product.rerankScore.toFixed(3)}
            </p>
          )}
          <p className="mt-1 font-mono text-[12px] tabular-nums text-ink">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      {showBreakdown && (
        <div className="border-t border-hair bg-panelDeep px-4 py-3">
          <ScoreBar label="hybrid" value={product.score} className="mb-2" />
          <div className="space-y-0.5 font-mono text-[10px] text-ink-muted">
            {breakdownLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-hair px-4 py-2">
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
        <span className="ml-auto font-mono text-[10px] text-ink-muted">◆ score → breakdown</span>
      </div>
    </article>
  );
});
