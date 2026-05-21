import { memo } from "react";
import type { RankedProduct } from "../../types";
import { SectionStrip } from "../instrument/SectionStrip";
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
    <section className="instrument-panel">
      <SectionStrip
        sectionId="§ 1.3"
        label="MATCHES"
        controls={
          <span className="px-3 font-mono text-[11px] tabular-nums text-ink-muted">
            {ranked.length} results · hybrid + rerank
          </span>
        }
      />
      <div className="divide-y divide-hair">
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
