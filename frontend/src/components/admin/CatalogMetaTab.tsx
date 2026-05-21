import { useCallback, useEffect, useState } from "react";
import { fetchCatalogMeta } from "../../api/client";
import type { CatalogMeta } from "../../types";
import { formatDateTime, formatPrice } from "../../utils/format";
import { MetricCard } from "./MetricCard";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";

export function CatalogMetaTab() {
  const [meta, setMeta] = useState<CatalogMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMeta(await fetchCatalogMeta());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalog metadata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const topCategories = meta
    ? Object.entries(meta.categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
    : [];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Catalog metadata"
          description="Read-only MongoDB catalog stats and embedding index status."
          action={
            <Button variant="secondary" onClick={refresh} loading={loading}>
              Refresh
            </Button>
          }
        />
        {error && <Alert tone="error">{error}</Alert>}
      </Card>

      {meta && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Products" value={meta.productCount.toLocaleString()} />
            <MetricCard
              label="Embeddings"
              value={meta.embeddingsReady ? "Ready" : "Not built"}
              tone={meta.embeddingsReady ? "success" : "warning"}
              hint={`${meta.embeddingsItemCount.toLocaleString()} vectors indexed`}
            />
            <MetricCard
              label="Last indexed"
              value={formatDateTime(meta.embeddingsLastIndexed)}
            />
            <MetricCard
              label="Price range"
              value={`${formatPrice(meta.priceRange.min)} – ${formatPrice(meta.priceRange.max)}`}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Vocabulary" description="Distinct attribute values in catalog." />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-500">Categories</dt>
                  <dd className="font-semibold text-stone-900">{meta.categories.length}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Types</dt>
                  <dd className="font-semibold text-stone-900">{meta.types.length}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Colors</dt>
                  <dd className="font-semibold text-stone-900">{meta.colors.length}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Materials</dt>
                  <dd className="font-semibold text-stone-900">{meta.materials.length}</dd>
                </div>
              </dl>
            </Card>

            <Card>
              <CardHeader title="Top categories" />
              <ul className="space-y-2">
                {topCategories.map(([category, count]) => (
                  <li key={category} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700">{category}</span>
                    <Badge>{count.toLocaleString()}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
