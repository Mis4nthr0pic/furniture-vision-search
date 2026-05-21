import { memo } from "react";
import { Card } from "../ui/Card";

export const SearchLoadingPanel = memo(function SearchLoadingPanel() {
  return (
    <Card className="animate-fade-in border-brand-200 bg-gradient-to-br from-white to-brand-50">
      <div className="flex items-start gap-4">
        <span
          className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand-700 border-t-transparent"
          aria-hidden
        />
        <div>
          <p className="font-medium text-stone-900">Analyzing your image…</p>
          <p className="mt-1 text-sm text-stone-600">
            Vision extraction, hybrid retrieval, and rerank typically take 10–30 seconds. The first
            run may take longer while embeddings build.
          </p>
          <div className="mt-4 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 flex-1 animate-pulse-soft rounded-full bg-brand-200"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
});
