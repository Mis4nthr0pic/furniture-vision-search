# Changelog

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
