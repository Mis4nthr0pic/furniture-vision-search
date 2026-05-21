import { defaultScoreWeights } from "../../store";
import { useAdminConfig } from "../../hooks/useAdminConfig";
import { useReindex } from "../../hooks/useReindex";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardHeader } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { TextArea } from "../ui/TextArea";
import { cn } from "../../utils/format";
import type { ScoreWeights } from "../../types";

const modelOptions = [
  { value: "openai/gpt-4o", label: "openai/gpt-4o" },
  { value: "openai/gpt-4o-mini", label: "openai/gpt-4o-mini" },
  { value: "anthropic/claude-3.5-sonnet", label: "anthropic/claude-3.5-sonnet" },
  { value: "google/gemini-2.0-flash-001", label: "google/gemini-2.0-flash-001" },
];

const weightLabels: Array<{ key: keyof ScoreWeights; label: string }> = [
  { key: "w_vec", label: "Vector" },
  { key: "w_lex", label: "Lexical" },
  { key: "w_cat", label: "Category" },
  { key: "w_type", label: "Type" },
  { key: "w_color", label: "Color" },
  { key: "w_style", label: "Style" },
  { key: "w_mat", label: "Material" },
  { key: "w_dim", label: "Dimensions" },
];

export function ConfigTab() {
  const {
    apiKey,
    llmConfig,
    retrievalConfig,
    setApiKey,
    setLlmConfig,
    setRetrievalConfig,
    setScoreWeights,
    resetToDefaults,
  } = useAdminConfig();

  const { progress, running, error: reindexError, startReindex } = useReindex();
  const weights = { ...defaultScoreWeights, ...retrievalConfig.weights };

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : progress?.phase === "done"
        ? 100
        : 0;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="OpenRouter connection"
          description="API keys are stored only in memory and cleared on refresh."
        />
        <Input
          label="OpenRouter API key"
          type="password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="sk-or-v1-…"
          hint="Never written to disk, localStorage, or server logs."
          autoComplete="off"
        />
      </Card>

      <Card>
        <CardHeader title="Models" description="Vision, chat/rerank, and embedding models via OpenRouter." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Vision model"
            value={llmConfig.visionModel}
            onChange={(event) => setLlmConfig({ visionModel: event.target.value })}
            options={modelOptions}
          />
          <Select
            label="Chat / rerank model"
            value={llmConfig.chatModel}
            onChange={(event) => setLlmConfig({ chatModel: event.target.value })}
            options={modelOptions}
          />
          <Input
            label="Embedding model"
            value={llmConfig.embedModel}
            onChange={(event) => setLlmConfig({ embedModel: event.target.value })}
          />
          <Input
            label="API base URL"
            value={llmConfig.baseUrl}
            onChange={(event) => setLlmConfig({ baseUrl: event.target.value })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Retrieval" description="Candidate pool size and hybrid mode." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Mode"
            value={retrievalConfig.mode ?? "hybrid"}
            onChange={(event) =>
              setRetrievalConfig({
                mode: event.target.value as typeof retrievalConfig.mode,
              })
            }
            options={[
              { value: "hybrid", label: "Hybrid" },
              { value: "vector_only", label: "Vector only" },
              { value: "lexical_only", label: "Lexical only" },
              { value: "filter_only", label: "Filter only" },
            ]}
          />
          <Input
            label="Top K (candidates)"
            type="number"
            min={1}
            max={500}
            value={retrievalConfig.k ?? 30}
            onChange={(event) => setRetrievalConfig({ k: Number(event.target.value) })}
          />
          <Input
            label="Top N (results)"
            type="number"
            min={1}
            max={100}
            value={retrievalConfig.n ?? 10}
            onChange={(event) => setRetrievalConfig({ n: Number(event.target.value) })}
          />
          <Select
            label="Category/type filter"
            value={retrievalConfig.filterMode ?? "auto"}
            onChange={(event) =>
              setRetrievalConfig({
                filterMode: event.target.value as typeof retrievalConfig.filterMode,
              })
            }
            options={[
              { value: "auto", label: "Auto" },
              { value: "strict", label: "Strict" },
              { value: "off", label: "Off" },
            ]}
          />
          <Input
            label="Confidence threshold"
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={retrievalConfig.confidenceThreshold ?? 0.7}
            onChange={(event) =>
              setRetrievalConfig({ confidenceThreshold: Number(event.target.value) })
            }
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Ranking weights" description="Hybrid score component weights (0–1)." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weightLabels.map(({ key, label }) => (
            <Input
              key={key}
              label={label}
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={weights[key]}
              onChange={(event) => setScoreWeights({ [key]: Number(event.target.value) })}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Rerank" description="LLM rerank runs on the top-K hybrid candidates." />
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={retrievalConfig.enableRerank ?? false}
              onChange={(event) => setRetrievalConfig({ enableRerank: event.target.checked })}
              className="rounded border-surface-border text-brand-800 focus:ring-brand-500"
            />
            Enable LLM rerank
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={retrievalConfig.useImageInRerank ?? true}
              onChange={(event) => setRetrievalConfig({ useImageInRerank: event.target.checked })}
              className="rounded border-surface-border text-brand-800 focus:ring-brand-500"
            />
            Include image in rerank prompt
          </label>
        </div>
        <div className="mt-4 grid gap-4">
          <TextArea
            label="Vision system prompt (optional override)"
            rows={3}
            value={retrievalConfig.visionSystemPrompt ?? ""}
            onChange={(event) =>
              setRetrievalConfig({ visionSystemPrompt: event.target.value || undefined })
            }
          />
          <TextArea
            label="Rerank system prompt (optional override)"
            rows={3}
            value={retrievalConfig.rerankSystemPrompt ?? ""}
            onChange={(event) =>
              setRetrievalConfig({ rerankSystemPrompt: event.target.value || undefined })
            }
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Embeddings index"
          description="Rebuild the local embedding cache (~2–3 min for 2,500 products)."
          action={
            <Button variant="secondary" onClick={resetToDefaults}>
              Reset defaults
            </Button>
          }
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={startReindex} loading={running} disabled={!apiKey.trim()}>
            Re-index catalog
          </Button>
          {progress && (
            <span className="text-sm text-stone-600">
              {progress.message ??
                (progress.total > 0
                  ? `${progress.current} / ${progress.total}`
                  : progress.phase)}
            </span>
          )}
        </div>
        {(running || progressPercent > 0) && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progress?.phase === "error" ? "bg-rose-500" : "bg-brand-700",
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        {reindexError && (
          <div className="mt-3">
            <Alert tone="error">{reindexError}</Alert>
          </div>
        )}
        {progress?.phase === "done" && (
          <p className="mt-3 text-sm text-emerald-700">Embeddings index rebuilt successfully.</p>
        )}
      </Card>
    </div>
  );
}