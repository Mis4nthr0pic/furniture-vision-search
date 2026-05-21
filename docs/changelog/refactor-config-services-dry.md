# Refactor — config, services, DRY (2026-05-21)

**Prompt:** Align with DRY/KISS, service layers, env-driven config, no loose functions.

**Changes:**
- Single validated `config.ts` (zod) — all env vars, fail-fast on missing `MONGODB_URI`, no credential fallbacks in code.
- Service layer: `CatalogService`, `LexicalService`, `VisionService`; routes are thin HTTP adapters.
- `app/bootstrap.ts` + `app/state.ts` — startup orchestration out of `server.ts`.
- Shared `parseBody` / `parseJsonField` validation helpers (DRY).
- LLM defaults from env via `getLLMDefaults()` — one source for zod + client merge.
- `.env.example` documents every tunable; docker-compose uses `env_file` + `${VAR}` interpolation.
