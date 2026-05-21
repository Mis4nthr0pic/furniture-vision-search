/**
 * OpenAI-compatible LLM HTTP client.
 * Works with OpenRouter (default) and OpenAI direct — same /chat/completions + /embeddings API shape.
 */
import { config } from "../config.js";
import type { LLMConfig } from "../schemas/llm.js";
import { AppError } from "../utils/errors.js";
import { extractJsonFromText } from "../utils/json-parse.js";
import { parseRetryAfterMs } from "../utils/retry.js";
import type { ChatMessage, ImageInput, LLMClient } from "./client.js";

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
}

interface OpenAIEmbedResponse {
  data?: Array<{ embedding: number[] }>;
  error?: { message?: string };
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function sanitizeMessage(message: string, apiKey: string): string {
  if (!apiKey) return message;
  return message.split(apiKey).join("[REDACTED]");
}

function buildHeaders(
  llmConfig: LLMConfig,
  apiKey: string,
  requestUrl: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (requestUrl.includes(config.openRouter.host)) {
    headers["HTTP-Referer"] = config.openRouter.referer;
    headers["X-Title"] = config.openRouter.title;
  }

  return headers;
}

async function postJson<T>(
  url: string,
  llmConfig: LLMConfig,
  body: unknown,
  apiKey = llmConfig.apiKey,
  timeoutMs = config.llm.requestTimeoutMs,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(llmConfig, apiKey, url),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new AppError("LLM_NETWORK_ERROR", sanitizeMessage(message, apiKey), 502);
  }

  const raw = await response.text();
  let parsed: T;
  try {
    parsed = JSON.parse(raw) as T;
  } catch {
    throw new AppError(
      "LLM_PARSE_ERROR",
      sanitizeMessage(`Invalid JSON from LLM provider (${response.status})`, apiKey),
      502,
    );
  }

  const errorBody = parsed as OpenAIChatResponse;
  if (!response.ok) {
    const providerMessage =
      errorBody.error?.message ?? `LLM request failed with status ${response.status}`;
    const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
    const isRateLimited = response.status === 429;
    const isTransient =
      response.status === 429 || response.status === 503 || response.status === 502;

    throw new AppError(
      isRateLimited ? "LLM_RATE_LIMITED" : "LLM_PROVIDER_ERROR",
      sanitizeMessage(providerMessage, apiKey),
      isRateLimited ? 429 : response.status >= 500 ? 502 : response.status,
      isTransient ? (retryAfterMs ?? undefined) : undefined,
    );
  }

  return parsed;
}

function extractChatContent(response: OpenAIChatResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new AppError("LLM_EMPTY_RESPONSE", "LLM returned an empty response", 502);
  }
  return content;
}

export function createOpenAICompatibleClient(llmConfig: LLMConfig): LLMClient {
  const baseUrl = normalizeBaseUrl(llmConfig.baseUrl);
  const embedBaseUrl = normalizeBaseUrl(
    llmConfig.embedBaseUrl ?? config.llm.embedBaseUrl ?? llmConfig.baseUrl,
  );

  return {
    async vision({ imageBase64, mimeType, systemPrompt, userPrompt }) {
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "text", text: userPrompt ?? "Analyze this furniture image." },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${imageBase64}` },
        },
      ];

      const response = await postJson<OpenAIChatResponse>(
        `${baseUrl}/chat/completions`,
        llmConfig,
        {
          model: llmConfig.visionModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content },
          ],
          response_format: { type: "json_object" },
        },
      );

      const text = extractChatContent(response);
      return extractJsonFromText(text);
    },

    async embed({ input }) {
      const texts = Array.isArray(input) ? input : [input];
      const response = await postJson<OpenAIEmbedResponse>(
        `${embedBaseUrl}/embeddings`,
        llmConfig,
        {
          model: llmConfig.embedModel,
          input: texts,
        },
        llmConfig.apiKey,
        config.embeddings.requestTimeoutMs,
      );

      const embeddings = response.data?.map((row) => row.embedding) ?? [];
      if (embeddings.length !== texts.length) {
        throw new AppError("LLM_EMBED_ERROR", "Embedding response size mismatch", 502);
      }
      return embeddings;
    },

    async chat({ messages, images, jsonMode }) {
      const apiMessages: Array<{
        role: string;
        content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
      }> = messages.map((message: ChatMessage) => ({
        role: message.role,
        content: message.content,
      }));

      if (images && images.length > 0) {
        const lastUserIndex = [...apiMessages].reverse().findIndex((m) => m.role === "user");
        if (lastUserIndex !== -1) {
          const index = apiMessages.length - 1 - lastUserIndex;
          const original = apiMessages[index];
          const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
            { type: "text", text: typeof original.content === "string" ? original.content : "" },
          ];
          for (const image of images) {
            parts.push({
              type: "image_url",
              image_url: { url: `data:${image.mimeType};base64,${image.base64}` },
            });
          }
          apiMessages[index] = { role: "user", content: parts };
        }
      }

      const body: Record<string, unknown> = {
        model: llmConfig.chatModel,
        messages: apiMessages,
      };
      if (jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const response = await postJson<OpenAIChatResponse>(
        `${baseUrl}/chat/completions`,
        llmConfig,
        body,
      );
      return extractChatContent(response);
    },
  };
}
