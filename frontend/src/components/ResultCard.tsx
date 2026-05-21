import type { RankedProduct } from "../types";

interface ResultCardProps {
  rank: number;
  product: RankedProduct;
  rating?: boolean;
  onRate: (relevant: boolean) => void;
  disabled?: boolean;
}

function formatBreakdown(product: RankedProduct): string {
  const { breakdown, contributions } = product;
  const lines = [
    `Hybrid score: ${product.score.toFixed(3)}`,
    product.rerankScore != null ? `Rerank: ${product.rerankScore.toFixed(2)}` : null,
    `vec ${contributions.vec.toFixed(3)} · lex ${contributions.lex.toFixed(3)} · cat ${contributions.cat.toFixed(3)}`,
    `type ${contributions.type.toFixed(3)} · color ${contributions.color.toFixed(3)} · style ${contributions.style.toFixed(3)}`,
    `dim ${contributions.dim.toFixed(3)} · raw vec ${breakdown.vec.toFixed(2)} · raw lex ${breakdown.lex.toFixed(2)}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function ResultCard({ rank, product, rating, onRate, disabled }: ResultCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">#{rank}</p>
          <h3 className="mt-1 font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {product.category} · {product.type}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {product.attrs.color} · {product.attrs.material} · {product.attrs.style}
          </p>
        </div>
        <div className="text-right">
          <p
            className="cursor-help text-sm font-semibold text-slate-800"
            title={formatBreakdown(product)}
          >
            {product.score.toFixed(3)}
          </p>
          {product.rerankScore != null && (
            <p className="text-xs text-indigo-600">rerank {product.rerankScore.toFixed(2)}</p>
          )}
        </div>
      </div>

      {product.reason && (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {product.reason}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRate(true)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            rating === true
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          } disabled:opacity-50`}
        >
          Relevant
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRate(false)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            rating === false
              ? "bg-rose-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          } disabled:opacity-50`}
        >
          Not relevant
        </button>
        <span className="ml-auto text-xs text-slate-400" title={formatBreakdown(product)}>
          Hover score for breakdown
        </span>
      </div>
    </article>
  );
}
