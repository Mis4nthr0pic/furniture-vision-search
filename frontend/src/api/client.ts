import type {
  CatalogMeta,
  EmbeddingsProgress,
  HealthResponse,
  LLMConfig,
  LiveEvalMetrics,
  RetrievalConfig,
  SearchLogEntry,
  StaticEvalResponse,
} from "../types";
import { BACKEND_OFFLINE_MESSAGE, isGatewayHtml } from "../utils/api-errors";

function serializeLlmConfig(llmConfig: LLMConfig) {
  return {
    apiKey: llmConfig.apiKey,
    baseUrl: llmConfig.baseUrl,
    visionModel: llmConfig.visionModel,
    chatModel: llmConfig.chatModel,
    embedModel: llmConfig.embedModel,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let data: T | { error?: { message?: string } };

  try {
    data = JSON.parse(raw) as T | { error?: { message?: string } };
  } catch {
    if (isGatewayHtml(raw)) {
      throw new Error(BACKEND_OFFLINE_MESSAGE);
    }
    throw new Error(`Request failed (${response.status})`);
  }

  if (!response.ok) {
    const err = data as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Request failed (${response.status})`);
  }
  return data as T;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health", {
    signal: AbortSignal.timeout(90_000),
  });
  return parseJson<HealthResponse>(response);
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
      llmConfig: serializeLlmConfig(args.llmConfig),
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
      llmConfig: serializeLlmConfig(llmConfig),
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
      llmConfig: serializeLlmConfig(args.llmConfig),
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
