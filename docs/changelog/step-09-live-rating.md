# Step 9 — Live rating API (2026-05-21)

**Decisions:**
- In-memory `SearchLog` store (LRU 200) — every `/api/search` returns `searchId`.
- `POST /api/eval/rate` — `{ searchId, productId, relevant }` records thumbs up/down.
- `GET /api/eval/metrics` — rolling `totalSearches`, `totalRatings`, `avgPrecisionAt5`, `avgPrecisionAt10`, `avgMRR`.
- `GET /api/eval/logs?limit=50` — recent logs with ratings for admin UI (step 11).
