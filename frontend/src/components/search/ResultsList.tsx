import { memo } from "react";
import type { RankedProduct } from "../../types";
import { ResultCard } from "./ResultCard";

interface ResultsListProps {
  ranked: RankedProduct[];
  ratings: Record<string, boolean>;
  lastSearchId: string | null;
  searchLoading: boolean;
  onRate: (productId: string, relevant: boolean) => void;
}

export const ResultsList = memo(function ResultsList({
  ranked,
  ratings,
  lastSearchId,
  searchLoading,
  onRate,
}: ResultsListProps) {
  if (ranked.length === 0) return null;

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-kicker text-terracotta">
            ✦ No. 03 · Matches
          </p>
          <h2 className="mt-1 font-display text-3xl italic tracking-tight text-cream sm:text-4xl">
            From the catalog
          </h2>
          <p className="mt-2 font-serif text-sm italic text-cream/55">
            Ranked by hybrid score with optional rerank reasoning
          </p>
        </div>
        <span className="font-display text-4xl italic text-terracotta">{ranked.length}</span>
      </div>

      <div className="space-y-2">
        {ranked.map((product, index) => (
          <ResultCard
            key={product.id}
            rank={index + 1}
            product={product}
            rating={ratings[product.id]}
            disabled={!lastSearchId || searchLoading}
            onRate={(relevant) => onRate(product.id, relevant)}
          />
        ))}
      </div>
    </section>
  );
});
