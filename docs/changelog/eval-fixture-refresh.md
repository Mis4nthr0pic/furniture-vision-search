# Eval fixture refresh (2026-05-21)

**Problem:** Static eval images did not match their filenames or expected labels (e.g. `wide_bookshelf.jpg` was a stool, `storage_ottoman.jpg` was a living room).

**Changes:**
- Replaced all six images with new Unsplash photos where filenames match the primary furniture piece.
- Updated `backend/eval/cases.json` expectations and removed workaround prompts except case 4 (styled room).
- Added `backend/eval/images/ATTRIBUTION.md` with source links.
- Prior baseline numbers in `docs/EVAL.md` marked pending re-run.

**New fixtures:**

| File | Expected |
|------|----------|
| `storage_ottoman.jpg` | Ottomans / Storage Ottoman |
| `wide_bookshelf.jpg` | Bookshelves / Wide Bookshelf |
| `storage_bench.jpg` | Benches / Entryway Bench |
| `accent_chair.jpg` | Chairs / Accent Chair (+ prompt) |
| `rectangular_coffee_table.jpg` | Coffee Tables / Rectangular Coffee Table |
| `loveseat_sofa.jpg` | Sofas / Loveseat |
