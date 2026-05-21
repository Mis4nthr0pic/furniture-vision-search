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
    <section>
      <header className="mb-4 flex items-end justify-between gap-4 border-b border-hair pb-2.5">
        <h2 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {ranked.length} matches
        </h2>
        <p className="font-mono text-[11px] text-ink-muted">hybrid · rerank</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
