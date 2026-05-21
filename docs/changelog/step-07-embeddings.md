# Step 7 — Embeddings (lazy build + cache) (2026-05-21)

**Decisions:**
- Product embedding text: `{title}. {description} Category: {category}. Type: {type}.`
- Cache at `backend/data/embeddings.json` with SHA-256 catalog hash; rebuild when hash mismatches.
- Lazy build on first `/api/search` when cache missing (requires client API key); batches of 100 via OpenAI-compatible `/embeddings`.
- `POST /api/admin/reindex` + SSE `GET /api/admin/reindex-progress` for manual rebuild + progress streaming.
- `CachedEmbeddingRetriever` replaces `NullRetriever` when cache is valid; cosine similarity wired into hybrid scoring.
- Graceful fallback: `w_vec=0`, weight redistributed to `w_lex`, warning in search response.
- `/api/admin/catalog-meta` reports `embeddingsReady`, `embeddingsItemCount`, `embeddingsLastIndexed`.
