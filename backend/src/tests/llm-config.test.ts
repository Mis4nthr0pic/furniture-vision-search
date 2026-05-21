import { afterEach, describe, expect, it, vi } from "vitest";

describe("parseLLMConfig dev env fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses OPENROUTER_API_KEY from env when request omits apiKey", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");
    vi.stubEnv("OPENROUTER_API_KEY", "sk-or-dev-key");

    const { parseLLMConfig } = await import("../schemas/llm.js");
    const config = parseLLMConfig({});

    expect(config.apiKey).toBe("sk-or-dev-key");
  });

  it("does not use env key in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");
    vi.stubEnv("OPENROUTER_API_KEY", "sk-or-dev-key");

    const { parseLLMConfig } = await import("../schemas/llm.js");

    expect(() => parseLLMConfig({})).toThrow();
  });

  it("prefers request apiKey over env fallback", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MONGODB_URI", "mongodb://localhost/test");
    vi.stubEnv("OPENROUTER_API_KEY", "sk-or-dev-key");

    const { parseLLMConfig } = await import("../schemas/llm.js");
    const config = parseLLMConfig({ apiKey: "sk-request-key" });

    expect(config.apiKey).toBe("sk-request-key");
  });
});
