# Step 4 — LLM client + vision debug (2026-05-21)

**Decisions:**
- `LLMClient` interface with OpenAI-compatible implementation via native `fetch`.
- OpenRouter attribution headers (`HTTP-Referer`, `X-Title`) injected when `baseUrl` contains `openrouter.ai`.
- Optional `embedBaseUrl` on config for future OpenRouter chat + OpenAI embed split (step 7).
- Catalog vocab injected at runtime into vision system prompt — never hardcoded categories.
- `POST /api/vision/debug`: multipart `image` + JSON `payload` (`llmConfig`, optional `userPrompt`/`systemPrompt`).
- Vision response validated with zod; tolerant JSON extraction for code fences (shared with rerank later).
- API key sanitized from all LLM error messages before returning to client.
