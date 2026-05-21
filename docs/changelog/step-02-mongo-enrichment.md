# Step 2 — Mongo + enrichment + vocab (2026-05-21)

**Decisions:**
- Mongo native driver, read-only; connect at boot before listening.
- Title parsing uses known `type` field to split `{Style} {Material} {Type}` — handles multi-word types.
- Color = first token of description (matches catalog template).
- Vocab derived at runtime from enriched products; cached in memory with products.
- Health now reports `{ ok, productCount, lexicalReady, embeddingsReady }` — `ok` reflects Mongo bootstrap success.
- Verified: 2,500 products, 15 categories, 62 types, 12 styles, 28 materials, 14 colors.
