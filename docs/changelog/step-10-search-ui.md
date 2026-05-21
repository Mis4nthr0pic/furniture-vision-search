# Step 10 — Frontend search page (2026-05-21)

**Decisions:**
- Search page: image dropzone, optional prompt, OpenRouter key (Zustand memory only).
- Results grid with hybrid score, rerank score/reason, score breakdown on hover.
- Vision features sidebar with timings.
- Thumbs up/down wired to `POST /api/eval/rate` using `searchId` from search response.
- Warning banner for pipeline notices and rerank errors.

**UI polish:**
- Warm brand design system (DM Sans + Fraunces, card shadows, fade-in animations).
- Component architecture: `components/ui/` (Button, Input, Card, Badge, Alert), `components/search/`, `components/layout/AppShell`.
- `useSearch` hook with `useShallow` for minimal re-renders; memoized result cards.
- Vitest + Testing Library: store, format utils, API client, ResultCard, WarningsBanner (12 tests).
