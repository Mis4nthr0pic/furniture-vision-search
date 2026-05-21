# Build pipeline

Incremental delivery: one branch and one pull request per step. Each PR is small, reviewable, and maps to a measurable capability.

## Workflow

```bash
git checkout main && git pull
git checkout -b step/N-short-name
# implement, test, update CHANGELOG.md
git push -u origin step/N-short-name
gh pr create --base main --title "Step N: ..." --body-file .github/pull_request_template.md
```

**Branch naming:** `step/<number>-<kebab-case>` (e.g. `step/4-llm-client`)

**Rules:**
- One step per PR — no bundling unrelated work
- Every PR updates `CHANGELOG.md`
- Merge to `main` only after CI/manual checks pass
- Link the PR to its GitHub issue (`Closes #N`)

## Progress

| Step | Capability | Branch | Status | Commit / PR |
|------|------------|--------|--------|-------------|
| 1 | Skeleton + Docker + health | — | ✅ Done (pre-PR) | [`b4319db`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/b4319db) |
| 2 | Mongo + enrichment + vocab | — | ✅ Done (pre-PR) | [`c5b8507`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/c5b8507) |
| 3 | Lexical index (MiniSearch) | — | ✅ Done (pre-PR) | [`5a67d19`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/5a67d19) |
| — | Env var hygiene for MongoDB URI | — | ✅ Done (pre-PR) | [`00331c4`](https://github.com/Mis4nthr0pic/furniture-vision-search/commit/00331c4) |
| 4 | LLM client + vision debug | `step/4-llm-client` | 🔲 Next | — |
| 5 | Search pipeline (no embed/rerank) | `step/5-hybrid-search` | 🔲 | — |
| 6 | Static eval harness | `step/6-static-eval` | 🔲 | — |
| 7 | Embeddings (lazy + cache) | `step/7-embeddings` | 🔲 | — |
| 8 | LLM rerank | `step/8-rerank` | 🔲 | — |
| 9 | Live rating API | `step/9-live-eval` | 🔲 | — |
| 10 | Frontend search page | `step/10-search-ui` | 🔲 | — |
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
