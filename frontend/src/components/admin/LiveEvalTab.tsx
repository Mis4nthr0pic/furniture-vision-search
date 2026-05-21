import { useCallback, useEffect, useState } from "react";
import { fetchLiveLogs, fetchLiveMetrics } from "../../api/client";
import type { LiveEvalMetrics, SearchLogEntry } from "../../types";
import { formatDateTime } from "../../utils/format";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { MetricCard } from "./MetricCard";

export function LiveEvalTab() {
  const [metrics, setMetrics] = useState<LiveEvalMetrics | null>(null);
  const [logs, setLogs] = useState<SearchLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextMetrics, nextLogs] = await Promise.all([fetchLiveMetrics(), fetchLiveLogs(50)]);
      setMetrics(nextMetrics);
      setLogs(nextLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live eval data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Live evaluation metrics"
          description="Rolling stats from in-memory search logs and thumbs up/down ratings."
          action={
            <Button variant="secondary" onClick={refresh} loading={loading}>
              Refresh
            </Button>
          }
        />
        {error && <Alert tone="error">{error}</Alert>}
      </Card>

      {metrics && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Total searches" value={String(metrics.totalSearches)} />
          <MetricCard label="Total ratings" value={String(metrics.totalRatings)} />
          <MetricCard label="Precision@5" value={metrics.avgPrecisionAt5.toFixed(3)} />
          <MetricCard label="Precision@10" value={metrics.avgPrecisionAt10.toFixed(3)} />
          <MetricCard label="MRR" value={metrics.avgMRR.toFixed(3)} />
        </div>
      )}

      <Card padding="sm" className="overflow-x-auto">
        <CardHeader title="Recent search logs" description="Last 50 searches with ratings." />
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-stone-500">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Vision</th>
              <th className="px-4 py-3">Prompt</th>
              <th className="px-4 py-3">Results</th>
              <th className="px-4 py-3">Ratings</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500" role="status">
                  Loading live eval data…
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-stone-500">
                  No searches logged yet. Run a search and rate results.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-surface-border/70">
                  <td className="px-4 py-3 text-xs text-stone-500">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {log.visionFeatures.category ?? "—"} · {log.visionFeatures.type ?? "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-stone-600">
                    {log.userPrompt || "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{log.resultIds.length}</td>
                  <td className="px-4 py-3 text-stone-600">{Object.keys(log.ratings).length}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
