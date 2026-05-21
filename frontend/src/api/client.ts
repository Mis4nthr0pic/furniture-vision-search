import type { ApiError, LLMConfig, RetrievalConfig, SearchResponse } from "../types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ApiError;
  if (!response.ok) {
    const err = data as ApiError;
    throw new Error(err.error?.message ?? `Request failed (${response.status})`);
  }
  return data as T;
}

export async function searchProducts(args: {
  image: File;
  userPrompt?: string;
  llmConfig: LLMConfig;
  retrievalConfig: RetrievalConfig;
}): Promise<SearchResponse> {
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

  return parseJson<SearchResponse>(response);
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
