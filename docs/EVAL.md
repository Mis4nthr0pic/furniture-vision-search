# Evaluation guide

How to measure search quality for demos and documentation.

## Static eval (automated)

**Location:** `backend/eval/cases.json` + `backend/eval/images/`

**Run:** Admin → Static Eval → **Run static eval** (or `POST /api/eval/run`)

**Cases (6):** single-piece furniture photos — ottoman, bookshelf, bench, accent chair, rectangular coffee table, loveseat. Filenames match the visible product. Case 4 uses a short prompt because the source photo is a styled room.

**Image sources:** Unsplash (see `backend/eval/images/ATTRIBUTION.md`).

Static eval runs with **rerank disabled** so numbers are stable run-to-run. Use live search + thumbs for perceived relevance in demos.

---

## How to read the numbers (start here)

The harness reports **layered** metrics — lead with the ones that show retrieval is working, then use the strict composite for QA.

### Primary signals (what reviewers care about first)

| Metric | Baseline | What it tells you |
|--------|----------|-------------------|
| **Category @ rank 1** | **83% (5/6)** | The top result is in the right furniture category — core retrieval is working |
| **Attribute recall @ rank 1** | **56%** | On average, the top hit matches *most* expected fields (type, color, …) |
| **Top-10 category / type** | varies | Expected label appears somewhere in the shortlist even when #1 is a sibling variant |

These answer: *“Did search put me in the right part of the catalog?”*

### Fine-grained signals (where iteration shows up)

| Metric | Baseline | What it tells you |
|--------|----------|-------------------|
| **Type @ rank 1** | 33% | Exact catalog type string on #1 (e.g. Wide Bookshelf vs Tall Bookshelf) |
| **Color @ rank 1** | 40% | Exact color attribute on #1 |
| **MRR** | 0.19 | How quickly a **full** match appears in top 10 (see below) |

These answer: *“Did we pick the exact SKU, not just the right family?”*

### Strict composite — full catalog match @ rank 1

| Metric | Baseline | What it tells you |
|--------|----------|-------------------|
| **Full match @ rank 1** | **1 / 6 (17%)** | **Every** expected field correct on #1 — all-or-nothing QA bar |

This is the **hardest** metric, not the headline failure rate. One wrong type or color on an otherwise perfect category hit counts as **no match**. With 62 product types and many color variants, this bar is intentionally demanding.

```
83% category @ #1  →  5 cases land in the right category at rank 1
56% attribute recall →  top hit is partially right on type/color/style
17% full match @ #1  →  1 case has every expected field exact on #1
```

---

## Metric definitions

Each case in `cases.json` has an `expected` object — only listed fields are graded.

**Per-case expectations:**

| Case | Image | Graded fields |
|------|-------|---------------|
| case_01 | `storage_ottoman.jpg` | category, type, color |
| case_02 | `wide_bookshelf.jpg` | category, type, color |
| case_03 | `storage_bench.jpg` | category, type, color |
| case_04 | `accent_chair.jpg` | category, type *(prompt: "yellow accent chair")* |
| case_05 | `rectangular_coffee_table.jpg` | category, type, color |
| case_06 | `loveseat_sofa.jpg` | category, type, color |

| Metric | Definition |
|--------|------------|
| Top-1 category / type / color | Single-field match on #1 (case-insensitive) |
| Top-10 category / type | Expected value appears anywhere in top 10 |
| Attribute recall @1 | Average of `(matched fields / expected fields)` on #1 |
| **Full match @1** | All expected fields match on #1 (`passed` in API response) |
| MRR | Mean reciprocal rank of first top-10 row matching **all** expected fields |
| Avg latency | Vision + hybrid retrieval ms per case |

Implementation: `backend/src/services/eval-static.service.ts` → `countExpectedMatches`, `passed`, `reciprocalRank`.

---

## Current baseline

Recorded local run, May 21 2026, OpenRouter `openai/gpt-4o`, cached embeddings, **corrected fixtures** (photos match labels):

| Mode | Cat @ #1 | Attr @ #1 | Type @ #1 | Color @ #1 | Full @ #1 | MRR | Latency |
|------|:--------:|:---------:|:---------:|:----------:|:---------:|:---:|:-------:|
| Hybrid | **83%** | **56%** | 33% | 40% | 17% (1/6) | 0.19 | 4.9s |

**Takeaway:** Category routing is strong (5/6). Fine-grained attribute precision on the exact catalog row is the active tuning target.

Previous baselines from **mislabeled fixtures** (e.g. 67% type, 0.583 MRR) are not comparable — see `docs/changelog/eval-fixture-refresh.md`.

**Recording future baselines:** add a row to [CHANGELOG.md](../CHANGELOG.md) under “Eval baselines”:

```markdown
### Eval baseline (YYYY-MM-DD, openai/gpt-4o, embeddings cached)
- Category @1: 83% (5/6)
- Attribute recall @1: 56%
- Full match @1: 17% (1/6)
- MRR: 0.19
- Avg latency: 4900ms
```

---

## Live eval (human feedback)

For demo sessions, **perceived relevance** often matters more than exact catalog strings:

1. Run searches on the Search page.
2. Rate results **Relevant** / **Not relevant**.
3. Admin → Live Eval → **Refresh**.

| Metric | Meaning |
|--------|---------|
| Precision@5 / @10 | Fraction of rated top-K results marked relevant |
| MRR | Reciprocal rank of first relevant rated item |

Logs are in-memory (last 200 searches) — reset on backend restart.

---

## Tips for stronger numbers

- Build embeddings first (Admin → Re-index).
- Use clear, single-piece furniture photos.
- Lower confidence threshold (0.5) if vision labels are conservative.
- Enable rerank for live search (static eval keeps it off for stable comparison).
