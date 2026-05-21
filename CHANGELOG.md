# Changelog

Project decision log for [Furniture Vision Search](README.md). See [docs/PIPELINE.md](docs/PIPELINE.md) for the build roadmap.

## Project narrative

**Problem:** Find catalog furniture items that visually match a user’s photo, with explainable ranking and eval tooling.

**Pipeline evolution:**
1. **Vision extraction** — constrain the LLM to catalog vocabulary so labels are matchable and filterable.
2. **Hybrid retrieval** — combine embeddings (semantic), lexical search (text), and attribute weights (structured catalog fields); no single signal is sufficient alone.
3. **Cached embeddings** — embed 2,500 products once, store locally; avoid per-search cost and latency.
4. **LLM rerank** — image-aware reordering of top-K candidates with natural-language reasons for demo/debug.
5. **Admin + eval** — runtime config, reindex with progress, static harness (6 cases), live metrics from human ratings.

**Agent / build process:** Implemented incrementally via Cursor agent using step branches, per-PR decision files under `docs/changelog/`, Docker live testing, and focused PRs. Prompts followed the kickoff brief: OpenRouter-only LLM, memory-only API keys, service-layer backend, Zustand frontend, explicit `Retriever` seam for future vector DB.

### Eval baselines

Static eval baseline runs:

| Date | Mode | Model | Top-1 cat | Top-1 type | Top-1 color | Attr recall @1 | MRR | Avg latency |
|------|------|-------|-----------|------------|-------------|----------------|-----|-------------|
| 2026-05-21 | Hybrid (new fixtures) | openai/gpt-4o | 83% | 33% | 40% | 56% | 0.19 | 4.9s |
| 2026-05-21 | Hybrid (old mislabeled fixtures) | openai/gpt-4o | 83% | 67% | 80% | 78% | 0.583 | 5.1s |

See [docs/EVAL.md](docs/EVAL.md) for how to run and interpret metrics.

---

## Decision log

**Do not append step entries here.** Each PR adds one **new** file under [docs/changelog/](docs/changelog/) — that avoids merge conflicts when branches diverge.

Full history (newest first): [docs/changelog/README.md](docs/changelog/README.md)
