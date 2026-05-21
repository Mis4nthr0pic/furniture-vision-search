# Frontend — Furniture Vision Search

React + TypeScript SPA for image upload search, ranked results with rerank reasoning, and an admin workspace for config, reindex, and evaluation.

**Monorepo root:** [../README.md](../README.md) · **Backend API:** [../backend/README.md](../backend/README.md)

---

## Quick start

From repo root (recommended):

```bash
docker compose up --build frontend
# http://localhost:5173  (nginx → proxies /api to backend)
```

Local dev (Vite on `:5173`, proxies `/api` → `:4000`):

```bash
cd frontend
npm install
npm run dev
```

Start the backend separately ([backend README](../backend/README.md)). Paste OpenRouter API key in **Admin → Config** (memory only).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server + HMR |
| `npm run build` | `tsc` + production bundle → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm test` | Vitest + Testing Library |

---

## Routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | `SearchPage` | Upload image, optional prompt, ranked results, ratings |
| `/admin` | `AdminPage` | Config, Static Eval, Live Eval, Catalog Meta tabs |

Navigation: `AppShell` sticky header with Search / Admin links.

---

## Architecture

```
pages  →  hooks  →  store (Zustand) / api/client  →  /api/*
         ↓
    components/search | admin | ui | layout
```

### State (`src/store.ts`)

Single Zustand store shared by Search and Admin:

| State | Purpose |
|-------|---------|
| `apiKey` | OpenRouter key — **memory only**, never localStorage |
| `llmConfig` | Model IDs, base URL |
| `retrievalConfig` | Mode, K/N, weights, rerank toggles, thresholds, price tolerance |
| Search session | `ranked`, `visionFeatures`, `warnings`, `ratings`, `timings` |

Selectors use `useShallow` in hooks to limit re-renders.

### Hooks

| Hook | Role |
|------|------|
| `useSearch` | `runSearch`, `rateProduct`; validates API key before search |
| `useAdminConfig` | Config tab bindings + `resetToDefaults` |
| `useReindex` | SSE progress subscription + trigger reindex |
| `useObjectUrl` | Image preview URL lifecycle |

### API client (`src/api/client.ts`)

Fetch wrappers for `/api/search`, `/api/eval/*`, `/api/admin/*`. Search uses `FormData` (image + JSON payload). Reindex progress via `EventSource` on `/api/admin/reindex-progress`.

---

## Component map

```
src/
├── pages/
│   ├── SearchPage.tsx       # Dropzone, prompt, results, vision sidebar
│   └── AdminPage.tsx        # Tabbed admin shell
├── components/
│   ├── search/              # ImageDropzone, ResultsList, ResultCard, FeaturesPanel, …
│   ├── admin/               # ConfigTab, StaticEvalTab, LiveEvalTab, ReindexProgressScreen, …
│   ├── ui/                  # Button, Input, Card, Badge, Alert, Select, TextArea
│   └── layout/AppShell.tsx  # Nav + layout
├── hooks/
├── api/client.ts
├── store.ts
├── types.ts                 # Mirrors backend response shapes
└── utils/                   # format, vision confidence, reindex progress helpers
```

### Search UX highlights

- **FeaturesPanel** — vision description, attributes, per-field confidence %, low-confidence warning
- **ResultCard** — hybrid score (tap for breakdown), rerank score + reason, relevance buttons
- **WarningsBanner** — pipeline warnings + rerank errors
- **SearchLoadingPanel** — in-progress state during ~10–15s search

### Admin UX highlights

- **ConfigTab** — API key, models, retrieval weights, prompt price tolerance, rerank toggles, reindex button
- **ReindexProgressScreen** — full-screen modal with phase steps, batch progress, rate-limit retry messages
- **StaticEvalTab** — run harness, summary metric cards, per-case table
- **LiveEvalTab** — precision@5/10, MRR, recent logs
- **CatalogMetaTab** — product count, embedding status, top categories

---

## Styling

- **Tailwind CSS** — warm brand palette in `tailwind.config.js`
- **Fonts** — DM Sans (UI), Fraunces (headings) via Google Fonts in `index.css`
- **Design tokens** — `brand-*`, `surface-*`, `shadow-card`, `animate-fade-in`

---

## Testing

```bash
npm test
```

| Test file | Covers |
|-----------|--------|
| `store.test.ts` | API key memory, search result apply |
| `api/client.test.ts` | Search multipart payload |
| `utils/format.test.ts` | Price, score breakdown formatting |
| `utils/reindex.test.ts` | Progress percent helpers |
| `components/search/*.test.tsx` | ResultCard, WarningsBanner |
| `components/admin/ReindexProgressScreen.test.tsx` | Progress modal states |

Setup: `src/test/setup.ts` (jest-dom + RTL cleanup).

---

## Build & Docker

- **Vite 6** + `@vitejs/plugin-react`
- **Dev proxy:** `/api` → `http://localhost:4000` (`vite.config.ts`)
- **Production:** `frontend/Dockerfile` builds static assets served by nginx; `nginx.conf` proxies `/api` to backend service

---

## API key handling (challenge compliance)

- Entered in **Admin → Config** only
- Held in Zustand in RAM — cleared on refresh
- Sent to backend per request in `llmConfig.apiKey`
- Never written to `localStorage`, `sessionStorage`, or cookies

---

## Related docs

- [Demo flow](../README.md#demo-flow-2-minutes) — end-to-end evaluator walkthrough
- [Understanding scores](../README.md#understanding-scores) — vision confidence vs hybrid vs rerank
- [CHANGELOG](../CHANGELOG.md) — step-by-step frontend decisions
