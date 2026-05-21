# Step 5 — Hybrid search pipeline (2026-05-21)

**Decisions:**
- `POST /api/search`: vision → hybrid scoring → top N (no rerank, no embeddings yet).
- `Retriever` interface + `NullRetriever` — obvious seam for Atlas Vector Search in step 7.
- `w_vec=0` with weight redistributed to `w_lex`; warning in response.
- Hard filter on category/type when confidence ≥ threshold (auto mode) and value in vocab.
- Per-result `breakdown` + `contributions` for debuggability.
- `enableRerank` accepted but ignored until step 8.
