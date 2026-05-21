# Chore — split changelog into per-PR files (2026-05-21)

**Problem:** Every PR inserted a new block at the top of `CHANGELOG.md`, causing repeated merge conflicts when branches diverged from `main`.

**Changes:**
- Migrated historical step entries into `docs/changelog/*.md` (one file per milestone).
- `CHANGELOG.md` now holds only stable narrative, eval baselines, and a pointer to the decision log.
- Pipeline workflow: each PR **adds a new file** under `docs/changelog/` — never edit existing entries or `CHANGELOG.md`.
