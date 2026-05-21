# Prompt price intent filtering (2026-05-21)

**Problem:** Optional prompts like `under $500` were passed to lexical search and rerank but never enforced — over-budget items still appeared in results.

**Fix:**
- Parse budget phrases from the user prompt (`under`, `over`, `between`, `around`, etc.).
- Hard-filter catalog candidates during retrieval before hybrid scoring.
- Enforce the same bounds after rerank as a safety net.
- Surface an admin warning when the price filter is active.

**Note:** Rerank default is `true` for demo-quality ranking; a staged progress bar on the search page reflects vision → retrieval → rerank while the API runs.
