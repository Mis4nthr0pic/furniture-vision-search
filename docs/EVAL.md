# Evaluation guide

How to measure search quality for demos and documentation.

## Static eval (automated)

**Location:** `backend/eval/cases.json` + `backend/eval/images/`

**Run:** Admin → Static Eval → **Run static eval** (or `POST /api/eval/run`)

**Cases (6):** single-piece furniture photos — ottoman, bookshelf, bench, accent chair, rectangular coffee table, loveseat. Filenames match the visible product. Case 4 uses a short prompt because the source photo is a styled room.

**Image sources:** Unsplash (see `backend/eval/images/ATTRIBUTION.md`).

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

**Current recorded baseline** (local run, May 21 2026, OpenRouter `openai/gpt-4o`, cached embeddings, **new fixtures**):

| Mode | Top-1 category | Top-1 type | Top-1 color | Attribute recall @1 | MRR | Avg latency | Cases passed |
|------|----------------|------------|-------------|---------------------|-----|-------------|--------------|
| Hybrid | 83% | 33% | 40% | 56% | 0.19 | 4.9s | 1/6 |

Admin Static Eval runs the Hybrid row for stable comparisons. Type/color are stricter now that filenames match the visible product (exact catalog type/color match required).

<!--
Previous mislabeled fixtures: Hybrid 83% / 67% type / 0.583 MRR @ 5.1s — not comparable.
-->

**Recording future baselines:** paste a run into CHANGELOG under “Eval baselines”, e.g.:

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
