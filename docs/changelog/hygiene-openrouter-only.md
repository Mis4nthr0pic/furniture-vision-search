# Hygiene — OpenRouter-only + dev key + vision tolerance (2026-05-21)

**Changes:**
- Embeddings default to OpenRouter (`openai/text-embedding-3-small`) — no separate OpenAI account required.
- Dev-only `OPENROUTER_API_KEY` in gitignored `.env` when client omits `apiKey`; `NODE_ENV=development` in docker-compose.
- Vision schema accepts null confidence fields from the model (normalized to 0).
