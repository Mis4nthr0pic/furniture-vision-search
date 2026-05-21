# Furniture Vision Search

Upload a furniture image and get ranked catalog matches with per-result reasoning.

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

All backend tunables (MongoDB, upload limits, LLM defaults, CORS) live in `.env` — see `.env.example`. No secrets or connection strings are hardcoded in source.

- Frontend: http://localhost:5173
- Backend health: http://localhost:4000/api/health

Paste your OpenAI API key in the Admin tab to enable vision search.

## Development

We ship incrementally: **one branch + one PR per build step**. See [docs/PIPELINE.md](docs/PIPELINE.md) for the full roadmap, branch naming, and progress tracker.

```bash
git checkout main && git pull
git checkout -b step/4-llm-client   # example
# ... implement, test, update CHANGELOG.md ...
gh pr create --base main
```
