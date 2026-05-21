import { memo, useState } from "react";
import { polaroidRotation } from "../../design/salon";
import type { RankedProduct } from "../../types";
import { cn, formatPrice, formatScoreBreakdown } from "../../utils/format";
import { FurnitureSilhouette } from "../editorial/FurnitureSilhouette";
import { ScoreGauge } from "../editorial/ScoreGauge";
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
  const rotation = polaroidRotation(rank - 1);

  return (
    <article
      className="animate-fade-in p-3 sm:p-4"
      style={{
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${Math.min(rank - 1, 8) * 50}ms`,
      }}
    >
      <div className="bg-butter p-4 text-ink shadow-polaroid sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <div className="relative">
              <span className="absolute -left-2 -top-3 font-display text-5xl italic leading-none text-terracotta sm:text-6xl">
                {String(rank).padStart(2, "0")}
              </span>
              <div className="ml-6 h-24 w-28 overflow-hidden rounded-arch border border-ink/10 bg-plum/20 sm:h-28 sm:w-32">
                <FurnitureSilhouette category={product.category} />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{product.category}</Badge>
              <span className="font-mono text-[9px] uppercase tracking-wider text-ink/45">
                lot no. {product.id.slice(-6)}
              </span>
            </div>
            <h3 className="mt-2 font-display text-xl italic leading-snug tracking-tight text-ink sm:text-2xl">
              {product.title}
            </h3>
            <p className="mt-1 font-serif text-sm italic text-ink/70">{product.type}</p>
            <p className="mt-2 font-mono text-xs text-ink/55">
              {product.attrs.color} · {product.attrs.material} · {product.attrs.style}
            </p>
          </div>

          <div className="flex shrink-0 flex-row items-end gap-4 sm:flex-col sm:items-center">
            <button
              type="button"
              onClick={() => setShowBreakdown((open) => !open)}
              className="transition hover:opacity-80"
              aria-expanded={showBreakdown}
            >
              <ScoreGauge score={product.score} label="hybrid" max={1} className="score-gauge" />
              {product.rerankScore != null && (
                <p className="mt-1 text-center font-mono text-[9px] text-ink/50">
                  rerank {product.rerankScore.toFixed(2)}
                </p>
              )}
            </button>
            <p className="font-display text-lg italic text-terracotta">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        {showBreakdown && (
          <div
            className="mt-4 border border-dashed border-ink/20 px-3 py-2 font-mono text-[10px] leading-relaxed text-ink/65"
            style={{ transform: "rotate(-1deg)" }}
          >
            {breakdownLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        {product.reason && (
          <p className="mt-4 border-l-2 border-terracotta/50 pl-3 font-serif text-sm italic leading-relaxed text-ink/80">
            {product.reason}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button
            variant={rating === true ? "success" : "secondary"}
            disabled={disabled}
            className={cn(
              "!text-xs",
              rating !== true && "!border-ink/25 !text-ink/70 hover:!text-ink",
            )}
            onClick={() => onRate(true)}
          >
            Relevant
          </Button>
          <Button
            variant={rating === false ? "danger" : "secondary"}
            disabled={disabled}
            className={cn(
              "!text-xs",
              rating !== true && rating !== false && "!border-ink/25 !text-ink/70 hover:!text-ink",
            )}
            onClick={() => onRate(false)}
          >
            Not relevant
          </Button>
          <span className="ml-auto font-hand text-sm text-ochre">tap score for notes</span>
        </div>
      </div>
    </article>
  );
});
