import { config } from "../config.js";
import { AppError } from "./errors.js";

const ALLOWED_LLM_HOSTS = new Set(["openrouter.ai", "api.openai.com"]);

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function assertAllowedLlmUrl(url: string, label: string): void {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    throw new AppError("INVALID_LLM_URL", `Invalid ${label} URL`, 400);
  }

  const allowed =
    ALLOWED_LLM_HOSTS.has(hostname) ||
    (config.nodeEnv !== "production" && isLocalDevHost(hostname));

  if (!allowed) {
    throw new AppError(
      "INVALID_LLM_URL",
      `Disallowed ${label} host "${hostname}". Allowed: OpenRouter, OpenAI${config.nodeEnv !== "production" ? ", localhost (dev only)" : ""}`,
      400,
    );
  }
}

export function assertAllowedLlmConfigUrls(llmConfig: {
  baseUrl: string;
  embedBaseUrl?: string;
}): void {
  assertAllowedLlmUrl(llmConfig.baseUrl, "LLM baseUrl");
  if (llmConfig.embedBaseUrl) {
    assertAllowedLlmUrl(llmConfig.embedBaseUrl, "LLM embedBaseUrl");
  }
}
