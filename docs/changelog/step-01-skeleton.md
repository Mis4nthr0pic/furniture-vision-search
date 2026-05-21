# Step 1 — Skeleton (2026-05-21)

**Prompt summary:** Full-stack furniture vision search kickoff — start with repo skeleton, Docker, health endpoint, frontend shell.

**Decisions:**
- Monorepo at repo root with `backend/` and `frontend/` packages (no workspace tooling yet — keep it simple).
- Backend: Express + TypeScript, compiled with `tsc`, dev via `tsx watch`.
- Frontend: Vite + React + TypeScript + Tailwind + Zustand (deps installed now, minimal shell only).
- Docker: multi-stage builds; frontend served via nginx on :5173, backend on :4000.
- Health endpoint returns `{ ok: true }` only for step 1; product count etc. added in step 2.
