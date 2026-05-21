# Step 8 — LLM rerank (2026-05-21)

**Decisions:**
- Image-aware rerank when `enableRerank: true` (default remains `false` for backward compatibility).
- Chat model receives original image (when `useImageInRerank: true`), extracted vision features, user prompt, and top-K candidate summaries.
- Strict JSON output validated with zod; tolerant extraction via shared `extractJsonFromText`.
- One retry on parse/validation failure; fallback to hybrid order with `rerank_error` + warning (never 500).
- Ranked results include `reason` and `rerankScore`; `discarded` lists rejected candidates with reasons.
- Timings include `rerankMs`.
