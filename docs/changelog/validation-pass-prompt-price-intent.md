# Validation pass — prompt price intent + local env loading (2026-05-21)

**Prompt:** Validate the whole application against the image-based furniture search challenge.

**Changes:**
- Added lightweight price intent parsing for optional prompts (`under $500`, `between $300 and $600`, `around $1,200`) and apply those constraints before scoring.
- Exposed `Price tolerance %` in Admin Config so budget filtering behavior is configurable.
- Improved material scoring so a prompt-mentioned material can contribute even when vision material is uncertain.
- Backend dev now loads the root `.env` automatically for the documented non-Docker local run path.
- Added retrieval tests for prompt price parsing/filtering and prompt material scoring.
