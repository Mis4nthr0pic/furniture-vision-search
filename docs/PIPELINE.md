# Build pipeline

Incremental delivery: one branch and one pull request per step. Each PR is small, reviewable, and maps to a measurable capability.

## Workflow

```bash
git checkout main && git pull
git checkout -b step/N-short-name
# implement, test, update CHANGELOG.md
git push -u origin step/N-short-name
gh pr create --base main --title "Step 5: Hybrid search pipeline" --body "## Summary
...

Closes #6"
```

**Branch naming:** `step/<number>-<kebab-case>` (e.g. `step/4-llm-client`)

**Rules:**
- One step per PR — no bundling unrelated work
- Every PR updates `CHANGELOG.md`
- Merge to `main` only after **CI passes** (backend + frontend tests in GitHub Actions)
- **Link the issue** — put `Closes #N` in the PR body (plain text, not backticks). Issue number = step + 1 (step 5 → `Closes #6`).
- Backup: merging a `step/N-*` branch auto-closes the pipeline issue via GitHub Action.

## Issue ↔ step map

| Step | GitHub issue |
|------|--------------|
| 4 | [#5](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/5) ✅ |
| 5 | [#6](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/6) ✅ |
| 6 | [#7](https://github.com/Mis4anthr0pic/furniture-vision-search/issues/7) |
| 7 | [#8](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/8) |
| 8 | [#9](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/9) |
| 9 | [#10](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/10) |
| 10 | [#11](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/11) |
| 11 | [#12](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/12) |
| 12 | [#13](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/13) |
| 13 | [#14](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/14) |
| 14 | [#15](https://github.com/Mis4nthr0pic/furniture-vision-search/issues/15) |

## Progress

| Step | Capability | Branch | Status | Commit / PR |
|------|------------|--------|--------|-------------|
| 1 | Skeleton + Docker + health | — | ✅ Done (pre-PR) | [`b4319db`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/b4319db) |
| 2 | Mongo + enrichment + vocab | — | ✅ Done (pre-PR) | [`c5b8507`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/c5b8507) |
| 3 | Lexical index (MiniSearch) | — | ✅ Done (pre-PR) | [`5a67d19`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/5a67d19) |
| — | Env var hygiene for MongoDB URI | — | ✅ Done (pre-PR) | [`00331c4`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/00331c4) |
| 4 | LLM client + vision debug | `step/4-llm-client` | ✅ Done | [#16](https://github.com/Mis4nthr0pic/furniture-vision-search/pull/16) |
| — | OpenRouter defaults | `chore/openrouter-defaults` | ✅ Done | [#17](https://github.com/Mis4nthr0pic/furniture-vision-search/pull/17) |
| 5 | Search pipeline (no embed/rerank) | `step/5-hybrid-search` | ✅ Done | [#22](https://github.com/Mis4nthr0pic/furniture-vision-search/pull/22) |
| 6 | Static eval harness | `step/6-static-eval` | ✅ Done | [#23](https://github.com/Mis4nthr0pic/furniture-vision-search/pull/23) |
| 7 | Embeddings (lazy + cache) | `step/7-embeddings` | ✅ Done | [#24](https://github.com/Mis4anthr0pic/furniture-vision-search/pull/24) |
| 8 | LLM rerank | `step/8-rerank` | ✅ Done | [#25](https://github.com/Mis4anthr0pic/furniture-vision-search/pull/25) |
| 9 | Live rating API | `step/9-live-eval` | ✅ Done | [#26](https://github.com/Mis4anthr0pic/furniture-vision-search/pull/26) |
| 10 | Frontend search page | `step/10-search-ui` | 🔄 In PR | — |
| 11 | Frontend admin page | `step/11-admin-ui` | 🔲 | — |
| 12 | Edge cases | `step/12-edge-cases` | 🔲 | — |
| 13 | Vitest suite | `step/13-tests` | 🔲 | — |
| 14 | Docs + polish | `step/14-docs` | 🔲 | — |

Steps 1–3 landed on `main` before the PR workflow was adopted. All new work uses branches + PRs.

## Architecture (target)

```
Image upload → Vision extraction (catalog vocab) → Hybrid scoring → LLM rerank → Ranked results
                     ↑                                    ↑              ↑
              step/4-llm-client              step/5,7,8 retrieval   step/8-rerank
```
