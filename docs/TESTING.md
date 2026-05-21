# Testing

Vitest runs unit and integration tests in both packages. CI executes them on every PR and push to `main`.

## Quick commands

```bash
npm install              # root (Biome + orchestration scripts)

npm test                 # backend + frontend (94 tests total)
npm run check            # lint + typecheck + test

cd backend && npm test   # 71 tests — API, retrieval, LLM parsing, validation
cd frontend && npm test  # 23 tests — hooks, components, store, API client
```

Watch mode during development:

```bash
cd backend && npm run test:watch
cd frontend && npm run test:watch   # add script if needed — use vitest directly
```

## Coverage by area

### Backend (`backend/src/tests/` — 19 files, 71 tests)

| File | What it proves |
|------|----------------|
| `async-pool.test.ts` | Concurrent batch worker pool |
| `cosine.test.ts` | Vector similarity math |
| `embeddings.test.ts` | Catalog hash + embedding cache logic |
| `enrichment.test.ts` | Title → style/material parsing |
| `eval-cases.test.ts` | Static eval fixture JSON validity |
| `eval-live.test.ts` | Live eval metrics + rating store |
| `json-parse.test.ts` | LLM JSON fence extraction |
| `llm-config.test.ts` | Dev API key fallback rules |
| `llm-url.test.ts` | SSRF allowlist on LLM URLs |
| `min-interval-gate.test.ts` | Rate-limit spacing for embed batches |
| `rate-limit.test.ts` | In-memory HTTP rate limiter |
| `rerank.test.ts` | Rerank response parsing + fallback |
| `retrieval.test.ts` | Hybrid scoring + filter logic |
| `retry.test.ts` | Exponential backoff + Retry-After |
| `routes.integration.test.ts` | HTTP 400/413 paths via supertest |
| `tokenize.test.ts` | Lexical tokenizer |
| `upload.test.ts` | Multer file size → 413 mapping |
| `validation.test.ts` | JSON field parsing + image magic bytes |
| `vision-schema.test.ts` | Vision feature normalization |

### Frontend (`frontend/src/**/*.test.*` — 8 files, 23 tests)

| File | What it proves |
|------|----------------|
| `api/client.test.ts` | Search API client error handling |
| `store.test.ts` | Zustand state + API key in memory |
| `hooks/useSearch.test.ts` | Search flow, missing key, rating rollback |
| `utils/format.test.ts` | Price/date formatting |
| `utils/reindex.test.ts` | Reindex progress helpers |
| `components/search/ResultCard.test.tsx` | Result card + score breakdown |
| `components/search/WarningsBanner.test.tsx` | Warning banner rendering |
| `components/admin/ReindexProgressScreen.test.tsx` | Reindex modal phases |

## Edge cases (Step 12 scope)

Covered by tests and/or explicit API errors:

| Scenario | Status | Where |
|----------|--------|-------|
| Missing image on search | ✅ | `routes.integration.test.ts` → `400 MISSING_IMAGE` |
| Missing API key on reindex | ✅ | `400 VALIDATION_ERROR` (Zod on `llmConfig.apiKey`) |
| Invalid JSON in multipart | ✅ | `400 INVALID_JSON` |
| Invalid / spoofed image | ✅ | `400 INVALID_IMAGE_TYPE` |
| File too large | ✅ | `upload.test.ts` → `413 FILE_TOO_LARGE` |
| Invalid LLM / retrieval config | ✅ | `400 VALIDATION_ERROR` |
| Disallowed LLM URL (SSRF) | ✅ | `400 INVALID_LLM_URL` |
| Rerank failure | ✅ | `rerank.test.ts` + search falls back with warning |
| Mongo unavailable | ✅ | `/api/health` returns `ok: false` when bootstrap fails |
| Vision parse failure | ✅ | `422 VISION_PARSE_ERROR` in vision service |

## CI

GitHub Actions workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

- **Backend unit tests (Vitest)** — `backend/npm test` + build
- **Frontend unit tests (Vitest)** — `frontend/npm test` + build
- **Lint (Biome)** — root `npm run lint`
- **Unit test summary** — root `npm test` after both packages pass
- **Root check** — root `npm run check` for lint + typecheck + tests

See the [Actions tab](https://github.com/Mis4nthr0pic/furniture-vision-search/actions/workflows/ci.yml) on GitHub for run history.
