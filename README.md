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

Paste your **OpenRouter** API key on the search page (memory only) to enable vision search ([openrouter.ai/keys](https://openrouter.ai/keys)).

### LLM providers

| Capability | Default provider | Why |
|------------|------------------|-----|
| Vision + chat + rerank + embeddings | **OpenRouter** (one `OPENROUTER_API_KEY`) | Same OpenAI-compatible API for all LLM calls — no separate OpenAI account needed |

The client speaks the OpenAI-compatible HTTP API — OpenRouter implements `/chat/completions` and `/embeddings`. Attribution headers (`HTTP-Referer`, `X-Title`) are sent automatically.

## Development

We ship incrementally: **one branch + one PR per build step**. See [docs/PIPELINE.md](docs/PIPELINE.md) for the full roadmap, branch naming, and progress tracker.

```bash
git checkout main && git pull
git checkout -b step/4-llm-client   # example
# ... implement, test, update CHANGELOG.md ...
gh pr create --base main
```
