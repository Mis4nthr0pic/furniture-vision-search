# UI revamp — phase 2 planned (2026-05-21)

**Status:** Planned (follow-up to Salon phase 1 in PR #38)

**Context:** Phase 1 shipped the Salon de l'objet editorial direction — dark ink palette, polaroid results, painterly backdrops, editorial admin copy, search progress bar. Before demo/deploy on Render (or similar), we intend a **lighter polish pass** rather than a full redesign.

**Planned scope (not exhaustive):**

- **Search flow** — tighten spacing and hierarchy on small screens; confirm progress bar + rerank copy reads well on mobile.
- **Results** — refine polaroid grid rhythm, score gauge legibility, and empty/loading states.
- **Admin** — editorial pass on remaining generic labels; align Config / eval tabs with Salon voice.
- **Deploy-ready UI** — ensure public URL feels intentional (title, favicon, any “local only” copy removed).
- **Assets** — replace SVG furniture silhouettes with real catalog photography when available.

**Out of scope for phase 2:**

- Backend or retrieval behavior changes
- New features (auth, accounts, billing, etc.)

**Reference:** Phase 1 notes in `ui-salon-revamp.md`, search progress in `search-progress-bar.md`.

**Deploy note:** Hosting is backend + frontend only; existing MongoDB Atlas URI is reused — see deployment discussion (Render / Cloudflare Tunnel).
