# Prompt price intent filtering (2026-05-21)

**Problem:** Optional prompts like `under $500` were passed to lexical search and rerank but never enforced — over-budget items still appeared in results.

**Fix:** Budget phrases are parsed in `retrieval.service.ts` (merged with main) and hard-filtered during retrieval, with rerank enforcement as a safety net.

**Note:** Rerank default is `true` for demo-quality ranking; a staged progress bar on the search page reflects vision → retrieval → rerank while the API runs.
