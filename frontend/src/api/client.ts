import type {
  CatalogMeta,
  EmbeddingsProgress,
  LLMConfig,
  LiveEvalMetrics,
  RetrievalConfig,
  SearchLogEntry,
  StaticEvalResponse,
} from "../types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | { error?: { message?: string } };
  if (!response.ok) {
    const err = data as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Request failed (${response.status})`);
  }
  return data as T;
}

export async function searchProducts(args: {
  image: File;
  userPrompt?: string;
  llmConfig: LLMConfig;
  retrievalConfig: RetrievalConfig;
}): Promise<import("../types").SearchResponse> {
  const form = new FormData();
  form.append("image", args.image);
  form.append(
    "payload",
    JSON.stringify({
      userPrompt: args.userPrompt?.trim() || undefined,
      llmConfig: {
        apiKey: args.llmConfig.apiKey,
        baseUrl: args.llmConfig.baseUrl,
        visionModel: args.llmConfig.visionModel,
        chatModel: args.llmConfig.chatModel,
        embedModel: args.llmConfig.embedModel,
      },
      retrievalConfig: args.retrievalConfig,
    }),
  );

  const response = await fetch("/api/search", {
    method: "POST",
    body: form,
  });

  return parseJson(response);
}

export async function rateResult(args: {
  searchId: string;
  productId: string;
  relevant: boolean;
}): Promise<void> {
  const response = await fetch("/api/eval/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

  await parseJson<{ ok: boolean }>(response);
}

export async function fetchCatalogMeta(): Promise<CatalogMeta> {
  const response = await fetch("/api/admin/catalog-meta");
  return parseJson<CatalogMeta>(response);
}

export async function triggerReindex(llmConfig: LLMConfig): Promise<void> {
  const response = await fetch("/api/admin/reindex", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      llmConfig: {
        apiKey: llmConfig.apiKey,
        baseUrl: llmConfig.baseUrl,
        visionModel: llmConfig.visionModel,
        chatModel: llmConfig.chatModel,
        embedModel: llmConfig.embedModel,
      },
    }),
  });

  await parseJson(response);
}

export function subscribeReindexProgress(
  onEvent: (event: EmbeddingsProgress) => void,
  onError?: () => void,
): () => void {
  const source = new EventSource("/api/admin/reindex-progress");

  source.onmessage = (message) => {
    try {
      onEvent(JSON.parse(message.data) as EmbeddingsProgress);
    } catch {
      // ignore malformed SSE payloads
    }
  };

  source.onerror = () => {
    onError?.();
    source.close();
  };

  return () => source.close();
}

export async function runStaticEval(args: {
  llmConfig: LLMConfig;
  retrievalConfig: RetrievalConfig;
}): Promise<StaticEvalResponse> {
  const response = await fetch("/api/eval/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      llmConfig: {
        apiKey: args.llmConfig.apiKey,
        baseUrl: args.llmConfig.baseUrl,
        visionModel: args.llmConfig.visionModel,
        chatModel: args.llmConfig.chatModel,
        embedModel: args.llmConfig.embedModel,
      },
      retrievalConfig: args.retrievalConfig,
    }),
  });

  return parseJson<StaticEvalResponse>(response);
}

export async function fetchLiveMetrics(): Promise<LiveEvalMetrics> {
  const response = await fetch("/api/eval/metrics");
  return parseJson<LiveEvalMetrics>(response);
}

export async function fetchLiveLogs(limit = 50): Promise<SearchLogEntry[]> {
  const response = await fetch(`/api/eval/logs?limit=${limit}`);
  const data = await parseJson<{ logs: SearchLogEntry[] }>(response);
  return data.logs;
}
