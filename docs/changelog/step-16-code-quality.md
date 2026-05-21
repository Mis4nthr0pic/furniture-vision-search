# Step 16 — Code quality fixes (2026-05-21)

**Changes:**
- LLM URL allowlist blocks SSRF via client-controlled `baseUrl` / `embedBaseUrl`.
- Unified Zod boundary parsing — invalid LLM/retrieval config returns `400 VALIDATION_ERROR`.
- Magic-byte image validation on upload routes; lexical route uses proper error middleware.
- Supertest integration tests for search/eval/lexical validation paths.
- Biome lint/format + root `npm run check` (lint, typecheck, test).
- Frontend: admin loading states, rating rollback, tab a11y, `useSearch` tests.
- Infra: `.dockerignore`, nginx proxy timeouts + security headers, `pino-pretty` dev-only, strict `npm ci` in Docker.
