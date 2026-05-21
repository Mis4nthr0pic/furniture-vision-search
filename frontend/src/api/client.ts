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
import { BACKEND_OFFLINE_MESSAGE, isGatewayHtml, isNetworkFetchError } from "../utils/api-errors";

const HEALTH_CHECK_TIMEOUT_MS = 20_000;
const LONG_REQUEST_TIMEOUT_MS = 120_000;

function createTimeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (isNetworkFetchError(err)) {
      throw new Error(BACKEND_OFFLINE_MESSAGE);
    }
    throw err;
  }
}

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
  const response = await apiFetch("/api/health", {
    signal: createTimeoutSignal(HEALTH_CHECK_TIMEOUT_MS),
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

  const response = await apiFetch("/api/search", {
    method: "POST",
    body: form,
    signal: createTimeoutSignal(LONG_REQUEST_TIMEOUT_MS),
  });

  return parseJson(response);
}

export async function rateResult(args: {
  searchId: string;
  productId: string;
  relevant: boolean;
}): Promise<void> {
  const response = await apiFetch("/api/eval/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });

  await parseJson<{ ok: boolean }>(response);
}

export async function fetchCatalogMeta(): Promise<CatalogMeta> {
  const response = await apiFetch("/api/admin/catalog-meta");
  return parseJson<CatalogMeta>(response);
}

export async function triggerReindex(llmConfig: LLMConfig): Promise<void> {
  const response = await apiFetch("/api/admin/reindex", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      llmConfig: serializeLlmConfig(llmConfig),
    }),
    signal: createTimeoutSignal(LONG_REQUEST_TIMEOUT_MS),
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
  const response = await apiFetch("/api/eval/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      llmConfig: serializeLlmConfig(args.llmConfig),
      retrievalConfig: args.retrievalConfig,
    }),
    signal: createTimeoutSignal(LONG_REQUEST_TIMEOUT_MS),
  });

  return parseJson<StaticEvalResponse>(response);
}

export async function fetchLiveMetrics(): Promise<LiveEvalMetrics> {
  const response = await apiFetch("/api/eval/metrics");
  return parseJson<LiveEvalMetrics>(response);
}

export async function fetchLiveLogs(limit = 50): Promise<SearchLogEntry[]> {
  const response = await apiFetch(`/api/eval/logs?limit=${limit}`);
  const data = await parseJson<{ logs: SearchLogEntry[] }>(response);
  return data.logs;
}
