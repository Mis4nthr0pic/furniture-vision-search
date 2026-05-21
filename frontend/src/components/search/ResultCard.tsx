import { memo, useState } from "react";
import type { RankedProduct } from "../../types";
import { cn, formatPrice, formatScoreBreakdown } from "../../utils/format";
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

  return (
    <article
      className="animate-fade-in rounded-2xl border border-surface-border bg-white p-5 shadow-card transition hover:shadow-lift"
      style={{ animationDelay: `${Math.min(rank - 1, 8) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">#{rank}</Badge>
            <Badge>{product.category}</Badge>
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-stone-900">
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-stone-600">{product.type}</p>
          <p className="mt-2 text-sm text-stone-500">
            {product.attrs.color} · {product.attrs.material} · {product.attrs.style}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <button
            type="button"
            onClick={() => setShowBreakdown((open) => !open)}
            className="rounded-lg px-2 py-1 text-right transition hover:bg-brand-50"
            aria-expanded={showBreakdown}
          >
            <p className="font-display text-xl font-semibold text-brand-800">
              {product.score.toFixed(3)}
            </p>
            {product.rerankScore != null && (
              <p className="text-xs font-medium text-stone-500">
                rerank {product.rerankScore.toFixed(2)}
              </p>
            )}
            <p className="text-[10px] text-stone-400">hybrid score</p>
          </button>
          <p className="mt-1 text-sm font-medium text-stone-700">{formatPrice(product.price)}</p>
        </div>
      </div>

      {showBreakdown && (
        <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs text-stone-600">
          {breakdownLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      {product.reason && (
        <p className="mt-3 rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-2.5 text-sm leading-relaxed text-stone-700">
          {product.reason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant={rating === true ? "success" : "secondary"}
          disabled={disabled}
          className={cn("px-3 py-2", rating !== true && "bg-stone-50")}
          onClick={() => onRate(true)}
        >
          Relevant
        </Button>
        <Button
          variant={rating === false ? "danger" : "secondary"}
          disabled={disabled}
          className={cn("px-3 py-2", rating !== true && rating !== false && "bg-stone-50")}
          onClick={() => onRate(false)}
        >
          Not relevant
        </Button>
        <span className="ml-auto text-xs text-stone-400">Tap score for breakdown</span>
      </div>
    </article>
  );
});
