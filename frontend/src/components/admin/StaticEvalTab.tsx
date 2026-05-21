import { useState } from "react";
import { runStaticEval } from "../../api/client";
import { useAdminConfig } from "../../hooks/useAdminConfig";
import { getLlmConfigForRequest, getRetrievalConfigForRequest } from "../../store";
import type { StaticEvalResponse } from "../../types";
import { formatMs, formatPercent } from "../../utils/format";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { MetricCard } from "./MetricCard";

export function StaticEvalTab() {
  const { apiKey, llmConfig, retrievalConfig } = useAdminConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StaticEvalResponse | null>(null);

  async function handleRun() {
    if (!apiKey.trim()) {
      setError("Add your OpenRouter API key in the Config tab first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await runStaticEval({
        llmConfig: getLlmConfigForRequest({ apiKey, llmConfig }),
        retrievalConfig: getRetrievalConfigForRequest({ retrievalConfig }),
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Static eval failed");
    } finally {
      setLoading(false);
    }
  }

  const summary = result?.summary;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Static evaluation harness"
          description="Runs 6 fixed cases (vision + hybrid, rerank off). Expect several minutes."
        />
        <Button onClick={handleRun} loading={loading} disabled={!apiKey.trim()}>
          Run static eval
        </Button>
        {error && (
          <div className="mt-3">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
      </Card>

      {summary && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Top-1 category" value={formatPercent(summary.top1_category_match)} />
            <MetricCard label="Top-1 type" value={formatPercent(summary.top1_type_match)} />
            <MetricCard label="Top-1 color" value={formatPercent(summary.top1_color_match)} />
            <MetricCard label="MRR" value={summary.mrr.toFixed(3)} />
            <MetricCard
              label="Top-10 category"
              value={formatPercent(summary.top10_category_match)}
            />
            <MetricCard label="Top-10 type" value={formatPercent(summary.top10_type_match)} />
            <MetricCard
              label="Attribute recall @1"
              value={formatPercent(summary.attribute_recall_top1)}
            />
            <MetricCard label="Avg latency" value={formatMs(summary.avg_latency_ms)} />
          </div>

          <Card padding="sm" className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-stone-500">
                  <th className="px-4 py-3">Case</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Top match</th>
                  <th className="px-4 py-3">Expected</th>
                  <th className="px-4 py-3">Latency</th>
                </tr>
              </thead>
              <tbody>
                {result.cases.map((evalCase) => {
                  const top = evalCase.top[0];
                  return (
                    <tr key={evalCase.id} className="border-b border-surface-border/70">
                      <td className="px-4 py-3 font-medium text-stone-800">{evalCase.id}</td>
                      <td className="px-4 py-3">
                        <Badge tone={evalCase.passed ? "success" : "warning"}>
                          {evalCase.passed ? "Pass" : "Miss"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {top ? (
                          <>
                            {top.title}
                            <span className="mt-0.5 block text-xs text-stone-400">
                              {top.category} · {top.type}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500">
                        {Object.entries(evalCase.expected)
                          .filter(([, value]) => value)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{formatMs(evalCase.latencyMs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
