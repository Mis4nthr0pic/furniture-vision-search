# Step 6 — Static eval harness (2026-05-21)

**Decisions:**
- 6 cases spanning Ottomans, Bookshelves, Benches, Chairs, Coffee Tables, Sofas.
- Images sourced from Unsplash (free use), committed under `backend/eval/images/`.
- `POST /api/eval/run` runs full search pipeline per case (vision + hybrid, rerank off).
- Metrics: top1/top10 category/type/color match, attribute recall@1, MRR, avg latency.
- **Baseline:** run locally with OpenRouter key — record numbers after first eval run.
