import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().min(1).default("catalog"),
  MONGODB_PRODUCTS_COLLECTION: z.string().min(1).default("products"),

  CORS_ORIGIN: z.string().default("*"),
  JSON_BODY_LIMIT: z.string().default("1mb"),
  MAX_UPLOAD_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .default(10 * 1024 * 1024),

  LEXICAL_DEFAULT_LIMIT: z.coerce.number().int().positive().default(20),
  LEXICAL_MAX_LIMIT: z.coerce.number().int().positive().default(100),

  LLM_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  LLM_EMBED_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  LLM_VISION_MODEL: z.string().default("openai/gpt-4o"),
  LLM_EMBED_MODEL: z.string().default("openai/text-embedding-3-small"),
  LLM_CHAT_MODEL: z.string().default("openai/gpt-4o"),
  LLM_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),

  OPENROUTER_REFERER: z.string().default("http://localhost:5173"),
  OPENROUTER_TITLE: z.string().default("Furniture Vision Search"),
  OPENROUTER_HOST: z.string().default("openrouter.ai"),

  /** Local dev only — gitignored via .env, never required in production. */
  OPENROUTER_API_KEY: z.string().optional(),

  DISABLE_DEBUG_ROUTES: z.enum(["true", "false"]).optional(),

  RATE_LIMIT_SEARCH_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_SEARCH_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_REINDEX_MAX: z.coerce.number().int().positive().default(3),
  RATE_LIMIT_REINDEX_WINDOW_MS: z.coerce.number().int().positive().default(3_600_000),
  RATE_LIMIT_EVAL_MAX: z.coerce.number().int().positive().default(5),
  RATE_LIMIT_EVAL_WINDOW_MS: z.coerce.number().int().positive().default(3_600_000),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    console.error("Invalid environment configuration:", formatted);
    process.exit(1);
  }

  const env = parsed.data;

  return {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === "production",
    logLevel: env.LOG_LEVEL,

    mongodb: {
      uri: env.MONGODB_URI,
      dbName: env.MONGODB_DB_NAME,
      productsCollection: env.MONGODB_PRODUCTS_COLLECTION,
    },

    cors: {
      origin: env.CORS_ORIGIN,
    },

    http: {
      jsonBodyLimit: env.JSON_BODY_LIMIT,
    },

    upload: {
      maxBytes: env.MAX_UPLOAD_BYTES,
      maxMegabytes: Math.round(env.MAX_UPLOAD_BYTES / (1024 * 1024)),
    },

    lexical: {
      defaultLimit: env.LEXICAL_DEFAULT_LIMIT,
      maxLimit: env.LEXICAL_MAX_LIMIT,
    },

    llm: {
      baseUrl: env.LLM_BASE_URL,
      embedBaseUrl: env.LLM_EMBED_BASE_URL,
      visionModel: env.LLM_VISION_MODEL,
      embedModel: env.LLM_EMBED_MODEL,
      chatModel: env.LLM_CHAT_MODEL,
      requestTimeoutMs: env.LLM_REQUEST_TIMEOUT_MS,
    },

    openRouter: {
      referer: env.OPENROUTER_REFERER,
      title: env.OPENROUTER_TITLE,
      host: env.OPENROUTER_HOST,
    },

    devApiKeys: {
      openRouter: env.OPENROUTER_API_KEY,
    },

    security: {
      disableDebugRoutes: env.NODE_ENV === "production" || env.DISABLE_DEBUG_ROUTES === "true",
    },

    rateLimit: {
      search: { max: env.RATE_LIMIT_SEARCH_MAX, windowMs: env.RATE_LIMIT_SEARCH_WINDOW_MS },
      reindex: { max: env.RATE_LIMIT_REINDEX_MAX, windowMs: env.RATE_LIMIT_REINDEX_WINDOW_MS },
      evalRun: { max: env.RATE_LIMIT_EVAL_MAX, windowMs: env.RATE_LIMIT_EVAL_WINDOW_MS },
    },
  } as const;
}

export const config = loadConfig();

export type AppConfig = typeof config;

/** Dev-only env key for LLM requests when the client omits apiKey. Never used in production. */
export function getDevLLMApiKey(): string | undefined {
  if (config.nodeEnv === "production") return undefined;
  return config.devApiKeys.openRouter;
}

/** Server-side LLM defaults merged with per-request config from the client. */
export function getLLMDefaults() {
  return {
    baseUrl: config.llm.baseUrl,
    visionModel: config.llm.visionModel,
    embedModel: config.llm.embedModel,
    chatModel: config.llm.chatModel,
    embedBaseUrl: config.llm.embedBaseUrl,
  };
}
