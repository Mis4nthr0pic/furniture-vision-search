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
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-stone-900">Matches</h2>
          <p className="mt-1 text-sm text-stone-500">
            Ranked by hybrid score with optional rerank reasoning
          </p>
        </div>
        <span className="text-sm font-medium text-stone-500">{ranked.length} results</span>
      </div>

      <div className="space-y-4">
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
