# Changelog

Project decision log for [Furniture Vision Search](README.md). Each step maps to a focused PR; see [docs/PIPELINE.md](docs/PIPELINE.md) for the full roadmap.

## Project narrative

**Problem:** Find catalog furniture items that visually match a user’s photo, with explainable ranking and eval tooling.

**Pipeline evolution:**
1. **Vision extraction** — constrain the LLM to catalog vocabulary so labels are matchable and filterable.
2. **Hybrid retrieval** — combine embeddings (semantic), lexical search (text), and attribute weights (structured catalog fields); no single signal is sufficient alone.
3. **Cached embeddings** — embed 2,500 products once, store locally; avoid per-search cost and latency.
4. **LLM rerank** — image-aware reordering of top-K candidates with natural-language reasons for demo/debug.
5. **Admin + eval** — runtime config, reindex with progress, static harness (6 cases), live metrics from human ratings.

**Agent / build process:** Implemented incrementally via Cursor agent (GPT/Codex) using step branches, `CHANGELOG.md` updates, Docker live testing, and PRs per pipeline step. Prompts followed the kickoff brief: OpenRouter-only LLM, memory-only API keys, service-layer backend, Zustand frontend, explicit `Retriever` seam for future vector DB.

### Eval baselines

Record local static eval runs here after `Admin → Static Eval`:

| Date | Model | Top-1 cat | Top-1 type | MRR | Avg latency |
|------|-------|-----------|------------|-----|-------------|
| *pending* | openai/gpt-4o | — | — | — | — |

See [docs/EVAL.md](docs/EVAL.md) for how to run and interpret metrics.

---

## Step 14 — Documentation (2026-05-21)

**Changes:**
- Evaluator-facing README: system overview, pipeline, admin, eval, tradeoffs, scaling, demo flow, API summary.
- `backend/README.md` and `frontend/README.md` — package-specific architecture, scripts, and API/component maps.
- `docs/EVAL.md` evaluation guide; `docs/screenshots/` capture checklist.
- Vision confidence display in search sidebar; calibrated vision prompt guidance.
- Updated pipeline progress tracker.

## Step 11 — Admin UI (2026-05-21)

**Decisions:**
- Tabbed admin workspace: Config, Static Eval, Live Eval, Catalog Meta.
- API key and all pipeline settings moved to Admin (Zustand memory only).
- Config: models, retrieval mode, K/N, weights, rerank toggles, optional prompts, reindex + SSE progress.
- Static eval runner wired to `POST /api/eval/run` with summary cards and case table.
- Live eval: metrics + recent logs from step 9 APIs.
- Catalog meta: product counts, vocabulary sizes, embedding index status.

**Reindex performance:**
- Concurrent embedding batches via `EMBED_BUILD_CONCURRENCY` (default 2).
- Larger batch size via `EMBED_BATCH_SIZE` (default 256, was 100 sequential).
- Rate-limit safe: min interval between batch starts, exponential backoff + `Retry-After` on 429/502/503.
- Separate `EMBED_REQUEST_TIMEOUT_MS` (default 120s) for large embed payloads.

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
