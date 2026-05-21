# Changelog

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
