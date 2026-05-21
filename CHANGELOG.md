# Changelog

## Step 15 — Security hygiene (2026-05-21)

**Changes:**
- MIME allowlist (JPEG, PNG, WebP) on search and vision upload routes.
- Friendly `400 INVALID_JSON` when multipart JSON fields are malformed.
- Docker Compose defaults `NODE_ENV=production`; debug routes hidden in production (`DISABLE_DEBUG_ROUTES`).
- In-memory rate limits on `/api/search`, `/api/admin/reindex`, `/api/eval/run`.
- Extended logger redaction for nested `apiKey` and `authorization` fields.
- `docs/SECURITY.md` — threat model and localhost-only deployment guidance.

## Step 11 — Admin UI (2026-05-21)

**Decisions:**
- Tabbed admin workspace: Config, Static Eval, Live Eval, Catalog Meta.
- API key and all pipeline settings moved to Admin (Zustand memory only).
- Config: models, retrieval mode, K/N, weights, rerank toggles, optional prompts, reindex + SSE progress.
- Static eval runner wired to `POST /api/eval/run` with summary cards and case table.
- Live eval: metrics + recent logs from step 9 APIs.
- Catalog meta: product counts, vocabulary sizes, embedding index status.

## Step 10 — Frontend search page (2026-05-21)

**Decisions:**
- Search page: image dropzone, optional prompt, OpenRouter key (Zustand memory only).
- Results grid with hybrid score, rerank score/reason, score breakdown on hover.
- Vision features sidebar with timings.
- Thumbs up/down wired to `POST /api/eval/rate` using `searchId` from search response.
- Warning banner for pipeline notices and rerank errors.

**UI polish:**
- Warm brand design system (DM Sans + Fraunces, card shadows, fade-in animations).
- Component architecture: `components/ui/` (Button, Input, Card, Badge, Alert), `components/search/`, `components/layout/AppShell`.
- `useSearch` hook with `useShallow` for minimal re-renders; memoized result cards.
- Vitest + Testing Library: store, format utils, API client, ResultCard, WarningsBanner (12 tests).

## Step 9 — Live rating API (2026-05-21)

**Decisions:**
- In-memory `SearchLog` store (LRU 200) — every `/api/search` returns `searchId`.
- `POST /api/eval/rate` — `{ searchId, productId, relevant }` records thumbs up/down.
- `GET /api/eval/metrics` — rolling `totalSearches`, `totalRatings`, `avgPrecisionAt5`, `avgPrecisionAt10`, `avgMRR`.
- `GET /api/eval/logs?limit=50` — recent logs with ratings for admin UI (step 11).

## Hygiene — OpenRouter-only + dev key + vision tolerance (2026-05-21)

**Changes:**
- Embeddings default to OpenRouter (`openai/text-embedding-3-small`) — no separate OpenAI account required.
- Dev-only `OPENROUTER_API_KEY` in gitignored `.env` when client omits `apiKey`; `NODE_ENV=development` in docker-compose.
- Vision schema accepts null confidence fields from the model (normalized to 0).

## Step 8 — LLM rerank (2026-05-21)

**Decisions:**
- Image-aware rerank when `enableRerank: true` (default remains `false` for backward compatibility).
- Chat model receives original image (when `useImageInRerank: true`), extracted vision features, user prompt, and top-K candidate summaries.
- Strict JSON output validated with zod; tolerant extraction via shared `extractJsonFromText`.
- One retry on parse/validation failure; fallback to hybrid order with `rerank_error` + warning (never 500).
- Ranked results include `reason` and `rerankScore`; `discarded` lists rejected candidates with reasons.
- Timings include `rerankMs`.

## Step 7 — Embeddings (lazy build + cache) (2026-05-21)

**Decisions:**
- Product embedding text: `{title}. {description} Category: {category}. Type: {type}.`
- Cache at `backend/data/embeddings.json` with SHA-256 catalog hash; rebuild when hash mismatches.
- Lazy build on first `/api/search` when cache missing (requires client API key); batches of 100 via OpenAI-compatible `/embeddings`.
- `POST /api/admin/reindex` + SSE `GET /api/admin/reindex-progress` for manual rebuild + progress streaming.
- `CachedEmbeddingRetriever` replaces `NullRetriever` when cache is valid; cosine similarity wired into hybrid scoring.
- Graceful fallback: `w_vec=0`, weight redistributed to `w_lex`, warning in search response.
- `/api/admin/catalog-meta` reports `embeddingsReady`, `embeddingsItemCount`, `embeddingsLastIndexed`.

## Step 6 — Static eval harness (2026-05-21)

**Decisions:**
- 6 cases spanning Ottomans, Bookshelves, Benches, Chairs, Coffee Tables, Sofas.
- Images sourced from Unsplash (free use), committed under `backend/eval/images/`.
- `POST /api/eval/run` runs full search pipeline per case (vision + hybrid, rerank off).
- Metrics: top1/top10 category/type/color match, attribute recall@1, MRR, avg latency.
- **Baseline:** run locally with OpenRouter key — record numbers after first eval run.

## Step 5 — Hybrid search pipeline (2026-05-21)

**Decisions:**
- `POST /api/search`: vision → hybrid scoring → top N (no rerank, no embeddings yet).
- `Retriever` interface + `NullRetriever` — obvious seam for Atlas Vector Search in step 7.
- `w_vec=0` with weight redistributed to `w_lex`; warning in response.
- Hard filter on category/type when confidence ≥ threshold (auto mode) and value in vocab.
- Per-result `breakdown` + `contributions` for debuggability.
- `enableRerank` accepted but ignored until step 8.

## Refactor — config, services, DRY (2026-05-21)

**Prompt:** Align with DRY/KISS, service layers, env-driven config, no loose functions.

**Changes:**
- Single validated `config.ts` (zod) — all env vars, fail-fast on missing `MONGODB_URI`, no credential fallbacks in code.
- Service layer: `CatalogService`, `LexicalService`, `VisionService`; routes are thin HTTP adapters.
- `app/bootstrap.ts` + `app/state.ts` — startup orchestration out of `server.ts`.
- Shared `parseBody` / `parseJsonField` validation helpers (DRY).
- LLM defaults from env via `getLLMDefaults()` — one source for zod + client merge.
- `.env.example` documents every tunable; docker-compose uses `env_file` + `${VAR}` interpolation.

## Step 4 — LLM client + vision debug (2026-05-21)

**Decisions:**
- `LLMClient` interface with OpenAI-compatible implementation via native `fetch`.
- OpenRouter attribution headers (`HTTP-Referer`, `X-Title`) injected when `baseUrl` contains `openrouter.ai`.
- Optional `embedBaseUrl` on config for future OpenRouter chat + OpenAI embed split (step 7).
- Catalog vocab injected at runtime into vision system prompt — never hardcoded categories.
- `POST /api/vision/debug`: multipart `image` + JSON `payload` (`llmConfig`, optional `userPrompt`/`systemPrompt`).
- Vision response validated with zod; tolerant JSON extraction for code fences (shared with rerank later).
- API key sanitized from all LLM error messages before returning to client.

## Step 3 — Lexical index (2026-05-21)

**Decisions:**
- MiniSearch built at boot after catalog enrichment; 2,500 documents indexed.
- Shared `tokenize()` (lowercase, strip punctuation, stopword removal) used as MiniSearch tokenizer override.
- Fields: title, description, category, type, style, material, color; boosts title×3, type×2, category×2; fuzzy 0.2, prefix true.
- Scores normalized 0..1 within result set (prep for hybrid scoring in step 5).
- Debug endpoint: `POST /api/lexical/debug` with `{ query, limit? }`.
- Verified queries: "walnut bookshelf", "espresso ottoman", "minimalist cherry bench".

## Hygiene — env var for MongoDB URI (2026-05-21)

- `docker-compose.yml` reads `MONGODB_URI` from `.env` instead of inlining the connection string.
- `.env.example` trimmed to the vars compose consumes; README documents `cp .env.example .env`.

## Step 2 — Mongo + enrichment + vocab (2026-05-21)

**Decisions:**
- Mongo native driver, read-only; connect at boot before listening.
- Title parsing uses known `type` field to split `{Style} {Material} {Type}` — handles multi-word types.
- Color = first token of description (matches catalog template).
- Vocab derived at runtime from enriched products; cached in memory with products.
- Health now reports `{ ok, productCount, lexicalReady, embeddingsReady }` — `ok` reflects Mongo bootstrap success.
- Verified: 2,500 products, 15 categories, 62 types, 12 styles, 28 materials, 14 colors.

## Step 1 — Skeleton (2026-05-21)

**Prompt summary:** Full-stack furniture vision search kickoff — start with repo skeleton, Docker, health endpoint, frontend shell.

**Decisions:**
- Monorepo at repo root with `backend/` and `frontend/` packages (no workspace tooling yet — keep it simple).
- Backend: Express + TypeScript, compiled with `tsc`, dev via `tsx watch`.
- Frontend: Vite + React + TypeScript + Tailwind + Zustand (deps installed now, minimal shell only).
- Docker: multi-stage builds; frontend served via nginx on :5173, backend on :4000.
- Health endpoint returns `{ ok: true }` only for step 1; product count etc. added in step 2.
