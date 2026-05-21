# Decision log

One markdown file per PR or milestone. **Add a new file only** — never edit an existing entry after merge.

## Adding an entry

1. Create `docs/changelog/<short-slug>.md` with the decision summary.
2. Do **not** edit `CHANGELOG.md` (stable narrative + eval baselines only).
3. Do **not** edit other files in this directory.

Parallel PRs can each add their own file with no merge conflicts.

## Browse

Filenames are descriptive (`step-13-vitest-suite.md`, `validation-pass-prompt-price-intent.md`, etc.). Sort by name or use your editor’s file search.

Stable overview and eval baselines: [CHANGELOG.md](../../CHANGELOG.md)
