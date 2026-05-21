# Evaluation guide

How to measure search quality for demos and documentation.

## Static eval (automated)

**Location:** `backend/eval/cases.json` + `backend/eval/images/`

**Run:** Admin → Static Eval → **Run static eval** (or `POST /api/eval/run`)

**Cases (6):** single-piece furniture photos — ottoman, bookshelf, bench, accent chair, rectangular coffee table, loveseat. Filenames match the visible product. Case 4 uses a short prompt because the source photo is a styled room.

**Image sources:** Unsplash (see `backend/eval/images/ATTRIBUTION.md`).

### What counts as a passed case?

Each case in `backend/eval/cases.json` has an `expected` object — only the fields that are set are graded (e.g. case 4 has category + type, no color).

A case **passes** when the **#1 ranked catalog result** matches **every** expected field (case-insensitive exact string match against catalog attributes):

```
passed = (matched attributes on #1) === (all non-null fields in expected)
```

Implementation: `backend/src/services/eval-static.service.ts` → `countExpectedMatches` + `passed` on each case result.

**Per-case expectations:**

| Case | Image | Expected fields |
|------|-------|-----------------|
| case_01 | `storage_ottoman.jpg` | category, type, color |
| case_02 | `wide_bookshelf.jpg` | category, type, color |
| case_03 | `storage_bench.jpg` | category, type, color |
| case_04 | `accent_chair.jpg` | category, type *(prompt: "yellow accent chair")* |
| case_05 | `rectangular_coffee_table.jpg` | category, type, color |
| case_06 | `loveseat_sofa.jpg` | category, type, color |

**Cases passed (e.g. 1/6)** is the strictest headline metric: one wrong type or color on #1 fails the whole case, even if category is correct.

### How the metrics relate

| Metric | What it measures | Stricter than passed? |
|--------|------------------|------------------------|
| Top-1 category match | % of cases where #1 category equals expected | No — single field only |
| Top-1 type match | % where #1 type equals expected | No |
| Top-1 color match | % where #1 color equals expected | No |
| Top-10 category/type match | Expected label appears anywhere in top 10 | No — rank doesn’t matter |
| Attribute recall @1 | Average of `(matched / total expected fields)` on #1 | Partial credit (e.g. 2/3 attrs = 67%) |
| **Cases passed** | % of cases where **all** expected fields match on #1 | **Yes — all-or-nothing** |
| **MRR** | Mean reciprocal rank of the **first** top-10 result that matches **all** expected fields | Full match, but rank can be 2–10 |

**Example:** 83% top-1 category with 1/6 passed means category is often right on #1, but type and/or color are usually wrong on that same result. MRR 0.19 means a fully matching product rarely appears at rank 1 (often not in top 10 at all).

Static eval runs with **rerank disabled** for stable, comparable numbers. Rerank is measured separately via live search.

### Metrics reported (summary)

| Metric | Meaning |
|--------|---------|
| Top-1 category match | % of cases where #1 result category matches expected |
| Top-1 type match | % where #1 type matches |
| Top-1 color match | % where #1 color matches |
| Top-10 category/type match | % where expected label appears anywhere in top 10 |
| Attribute recall @1 | Average fraction of expected attributes matched on top-1 |
| Cases passed | % of cases where all expected fields match on #1 |
| MRR | Mean reciprocal rank of first **fully** matching result in top 10 |
| Avg latency | End-to-end pipeline ms per case (vision + hybrid, rerank off) |

### Why scores dropped after fixture refresh

Earlier eval images **did not match** their filenames or labels (e.g. `wide_bookshelf.jpg` showed a stool). Reported baselines like 67% top-1 type and MRR 0.583 were **not comparable** — expectations didn’t describe the photo.

After refresh (May 2026), photos match the labeled product. Metrics are lower but **honest**. The main failure modes now:

1. Vision mislabels type or color (especially styled-room photos).
2. Retrieval ranks a same-category variant with wrong type/color/material on #1.
3. Eval requires exact catalog strings, not fuzzy “close enough” matches.

**Current recorded baseline** (local run, May 21 2026, OpenRouter `openai/gpt-4o`, cached embeddings, **corrected fixtures**):

| Mode | Top-1 category | Top-1 type | Top-1 color | Attribute recall @1 | MRR | Avg latency | Cases passed |
|------|----------------|------------|-------------|---------------------|-----|-------------|--------------|
| Hybrid | 83% | 33% | 40% | 56% | 0.19 | 4.9s | 1/6 |

Admin Static Eval runs the Hybrid row for stable comparisons.

Previous mislabeled-fixture baseline (67% type, 0.583 MRR) is **not comparable** — see `docs/changelog/eval-fixture-refresh.md`.

**Recording future baselines:** paste a run into [CHANGELOG.md](../CHANGELOG.md) under “Eval baselines”, e.g.:

```markdown
### Eval baseline (2026-05-21, openai/gpt-4o, embeddings cached)
- Top-1 category: 83%
- Top-1 type: 33%
- Top-1 color: 40%
- Cases passed: 1/6
- MRR: 0.19
- Avg latency: 4900ms
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
