import { afterEach, describe, expect, it, vi } from "vitest";

describe("assertAllowedLlmUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("allows OpenRouter URLs", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");

    const { assertAllowedLlmUrl } = await import("../utils/llm-url.js");
    expect(() => assertAllowedLlmUrl("https://openrouter.ai/api/v1", "baseUrl")).not.toThrow();
  });

  it("blocks internal URLs in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");

    const { assertAllowedLlmUrl } = await import("../utils/llm-url.js");
    expect(() => assertAllowedLlmUrl("http://169.254.169.254/", "baseUrl")).toThrow(
      /Disallowed baseUrl host/,
    );
  });

  it("allows localhost in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");

    const { assertAllowedLlmUrl } = await import("../utils/llm-url.js");
    expect(() => assertAllowedLlmUrl("http://localhost:8080/v1", "baseUrl")).not.toThrow();
  });
});

describe("parseLLMConfig URL allowlist", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects disallowed baseUrl from client", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");

    const { parseLLMConfig } = await import("../schemas/llm.js");

    expect(() =>
      parseLLMConfig({
        apiKey: "sk-test",
        baseUrl: "http://169.254.169.254/latest/meta-data",
      }),
    ).toThrow(/INVALID_LLM_URL|Disallowed LLM baseUrl host/);
  });
});
