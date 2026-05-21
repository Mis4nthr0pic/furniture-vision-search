# Step 3 — Lexical index (2026-05-21)

**Decisions:**
- MiniSearch built at boot after catalog enrichment; 2,500 documents indexed.
- Shared `tokenize()` (lowercase, strip punctuation, stopword removal) used as MiniSearch tokenizer override.
- Fields: title, description, category, type, style, material, color; boosts title×3, type×2, category×2; fuzzy 0.2, prefix true.
- Scores normalized 0..1 within result set (prep for hybrid scoring in step 5).
- Debug endpoint: `POST /api/lexical/debug` with `{ query, limit? }`.
- Verified queries: "walnut bookshelf", "espresso ottoman", "minimalist cherry bench".
