# UI revamp — Instrument (tech / precision) (2026-05-21)

**Direction:** Data-dense instrument cockpit — Linear / Vercel / Bloomberg terminal. Light precision surface (`#FAFAF7`), hairline borders, JetBrains Mono kickers, single accent `#FF5B22`. No gradients, shadows, or polaroids.

**Changes:**
- New palette and typography (Geist + JetBrains Mono + Newsreader emphasis).
- Hairline-bounded panels, table-style results, mono metadata strips.
- Replaced Salon editorial components with `components/instrument/` (PageHeader, SectionStrip, ScoreBar, StatusDot).
- Admin tabs: Config · Evaluation · Live metrics · Catalog.
- Search flow: Index query → Rank → matches table with score breakdown bars.

**Replaces:** Salon de l'objet dark editorial theme (PR #38).
