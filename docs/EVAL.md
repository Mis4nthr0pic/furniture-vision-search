# Evaluation guide

How to measure search quality for demos and documentation.

## Static eval (automated)

**Location:** `backend/eval/cases.json` + `backend/eval/images/`

**Run:** Admin → Static Eval → **Run static eval** (or `POST /api/eval/run`)

**Cases (6):** Ottomans, Bookshelves, Benches, Chairs, Coffee Tables, Sofas — each with expected category/type/color attributes.

**Metrics reported:**

| Metric | Meaning |
|--------|---------|
| Top-1 category match | % of cases where #1 result category matches expected |
| Top-1 type match | % where #1 type matches |
| Top-1 color match | % where #1 color matches |
| Top-10 category/type match | % where expected label appears anywhere in top 10 |
| Attribute recall @1 | Average fraction of expected attributes matched on top-1 |
| MRR | Mean reciprocal rank of first fully matching result |
| Avg latency | End-to-end pipeline ms per case (vision + hybrid, rerank off) |

**Recording baselines:** paste a run into CHANGELOG under “Eval baselines”, e.g.:

```markdown
### Eval baseline (2026-05-21, openai/gpt-4o, embeddings cached)
- Top-1 category: 83%
- Top-1 type: 67%
- MRR: 0.72
- Avg latency: 4200ms
```

## Live eval (human feedback)

1. Run several searches on the Search page.
2. Rate results with **Relevant** / **Not relevant**.
3. Admin → Live Eval → **Refresh**.

**Metrics:**

| Metric | Meaning |
|--------|---------|
| Precision@5 | Of rated items in top 5, fraction marked relevant |
| Precision@10 | Same for top 10 |
| MRR | Reciprocal rank of first relevant rated item |

Logs are in-memory (last 200 searches) — reset on backend restart.

## Tips for better numbers

- Build embeddings first (Admin → Re-index).
- Use clear, single-piece furniture photos.
- Lower confidence threshold (0.5) if vision labels are conservative.
- Enable rerank for live search quality (static eval intentionally disables it for stable comparison).
