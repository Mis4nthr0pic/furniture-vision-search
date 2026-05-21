# Step 11 — Admin UI (2026-05-21)

**Decisions:**
- Tabbed admin workspace: Config, Static Eval, Live Eval, Catalog Meta.
- API key and all pipeline settings moved to Admin (Zustand memory only).
- Config: models, retrieval mode, K/N, weights, rerank toggles, optional prompts, reindex + SSE progress.
- Static eval runner wired to `POST /api/eval/run` with summary cards and case table.
- Live eval: metrics + recent logs from step 9 APIs.
- Catalog meta: product counts, vocabulary sizes, embedding index status.

**Reindex performance:**
- Concurrent embedding batches via `EMBED_BUILD_CONCURRENCY` (default 2).
- Larger batch size via `EMBED_BATCH_SIZE` (default 256, was 100 sequential).
- Rate-limit safe: min interval between batch starts, exponential backoff + `Retry-After` on 429/502/503.
- Separate `EMBED_REQUEST_TIMEOUT_MS` (default 120s) for large embed payloads.
