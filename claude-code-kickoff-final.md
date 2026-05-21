# Claude Code Kickoff — Image-Based Furniture Search (EOD)

Read this entire brief before writing a single line of code. Echo back the plan in 5 bullets, list at most 3 actually-blocking ambiguities (no nitpicks), then start step 1. Make routine decisions yourself and log them in CHANGELOG.md. Speed matters.

**Hard rule: no placeholders, no `// TODO`, no `// implement this`. Every function ships with a real implementation. If you don't know how to implement something, say so before writing the stub.**

---

## 1. What we're building

A full-stack app where a user uploads a furniture image (optionally with a natural-language refinement query) and gets ranked catalog matches with per-result reasoning. The grader judges **match quality and relevance**, not just whether results come back.

## 2. Read-only catalog (do not modify)

Connection string:
```
mongodb+srv://catalog-readonly:vcRvxWHQSKUEwd7V@catalog.sontifs.mongodb.net/catalog
```

Collection: `products`. Schema:
```json
{
  "title":       "string",
  "description": "string",
  "category":    "string",
  "type":        "string",
  "price":       "number (USD)",
  "width":       "number (cm)",
  "height":      "number (cm)",
  "depth":       "number (cm)"
}
```

~2,500 documents. Design retrieval to work correctly at much larger scale — the seam to swap in Atlas Vector Search must be obvious.

## 3. Stack (mandatory)

- Backend: Node.js + TypeScript + Express + MongoDB native driver (no Mongoose — read-only)
- File uploads: `multer` (memory storage, 10MB limit)
- Frontend: React + TypeScript + Vite + Tailwind + Zustand
- Lexical search: `minisearch`
- Validation: `zod` at every external boundary
- Tests: `vitest`
- Containers: Docker + docker-compose
- No Next.js, no SSR, no auth, no ORM, no LangChain, no localStorage, no extra persistence beyond the embeddings cache file.

## 4. Catalog data structure (critical — exploit this)

The catalog is synthetic and follows strict templates. The vocabulary is finite. Use that.

**Title template:** `{Style} {Material} {Type}`
- "Bohemian Cherry Entryway Bench" → style=Bohemian, material=Cherry, type=Entryway Bench
- "Minimalist Walnut Wide Bookshelf" → style=Minimalist, material=Walnut, type=Wide Bookshelf

**Description template:** `{Color} {Style} {Type} made from premium {Material}. ...`
- "Espresso bohemian entryway bench made from premium cherry. ..." → color=Espresso
- "Charcoal minimalist wide bookshelf made from premium walnut. ..." → color=Charcoal

**Five canonical attributes per product**, drawn from finite vocabularies:
1. `category` — catalog field
2. `type` — catalog field
3. `style` — first word of title
4. `material` — middle of title (between style and type tokens)
5. `color` — first word of description

**Known catalog vocabulary** (paste output of `explore.js` here before handing this prompt to Claude Code — categories, types, styles, materials, colors, and price/dimension ranges):

```
<<PASTE explore.js OUTPUT HERE>>
```

At boot, the backend must also re-derive this vocabulary from the live catalog so it stays accurate. The hardcoded version above is a dev seed only. **Never hardcode a category list in the vision prompt — always inject the runtime-derived vocab.**

## 5. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  CLIENT                                                          │
│  Search page: dropzone, query bar, results, features panel       │
│                ↓ thumbs-up/down on each result                   │
│  Admin page:  Config | Static Eval | Live Eval | Catalog Meta    │
│  Zustand:     apiKey + retrievalConfig in memory, per-request    │
└────────────────────────────┬─────────────────────────────────────┘
                             │ multipart/json
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND PIPELINE                                                │
│                                                                  │
│  1. Vision extraction (catalog-aware prompt)                     │
│     image → VisionFeatures JSON, validated with zod              │
│                                                                  │
│  2. Hybrid scoring over the (filtered) enriched catalog          │
│     for each product: weighted sum of                            │
│       - vector cosine (semantic, 0 if embeddings unavailable)    │
│       - lexical score (MiniSearch on title+description+attrs)    │
│       - category/type/color/style match indicators               │
│       - dimension proximity                                      │
│     → top K candidates                                           │
│                                                                  │
│  3. LLM rerank with original image (default ON, toggleable)      │
│     image + features + user prompt + K candidates                │
│     → top N with per-item reason                                 │
│                                                                  │
│  4. Response: ranked products + reasons + features + searchId    │
│     SearchLog persisted in memory for live eval                  │
└──────────────────────────────────────────────────────────────────┘
```

**Why this design wins the brief:**
- Vision LLM as the modality bridge — the catalog has no images, so we must convert image → text and match text-to-text. CLIP locally is a one-day trap.
- Catalog-aware vision prompt — finite vocabularies are injected so the model picks real catalog values instead of inventing labels. Single highest-leverage decision in the system.
- Hybrid scoring beats pure cosine — five structural attributes available, weighted scoring is more accurate, debuggable, and explainable.
- Lexical as a first-class signal — clean template-based catalog text is highly amenable to lexical matching; catches exact-match prompts that embeddings wash out.
- Image-aware rerank — extraction is lossy by design (constrained to vocab); rerank with the original image recovers proportion, ornamentation, fabric, finish.
- Two-track evaluation (static + live) — static cases give reproducible benchmark numbers; live ratings give demo-time feedback and model a production loop.
- Scaling story is obvious — `Retriever` interface seams the in-memory cosine; swap to Atlas Vector Search or pgvector with no other code changes.

## 6. Hybrid scoring formula

```ts
score(product) =
    w_vec   * cosine(queryVec, product.vec)              // 0 if embeddings unavailable
  + w_lex   * normalize(minisearchScore(query, product)) // 0..1
  + w_cat   * (vision.category === product.category ? 1 : 0)
  + w_type  * (vision.type === product.type ? 1 : 0)
  + w_color * (vision.color === product._attrs.color ? 1 : 0)
  + w_style * (vision.style === product._attrs.style ? 1 : 0)
  + w_mat   * (userPromptMentionsMaterial && vision.material === product._attrs.material ? 1 : 0)
  + w_dim   * dimProximity(vision.est_dimensions, product)  // 0..1
```

**Default weights** (all configurable on admin page):
- `w_vec`   = 0.25 (auto-set to 0 if embeddings unavailable; redistributed to `w_lex`)
- `w_lex`   = 0.20
- `w_cat`   = 0.15
- `w_type`  = 0.15
- `w_color` = 0.15
- `w_style` = 0.05
- `w_mat`   = 0.00 (off by default; admin can enable)
- `w_dim`   = 0.05

**Filter vs score:**
- `category` and `type`: when vision confidence ≥ threshold (default 0.7) **and** the value exists in catalog vocab, apply as a **hard filter** (case-insensitive). Otherwise score-only.
- Everything else: score-only, never filter.

Compute score for every product in the filtered set. With ~2,500 items this is sub-10ms. Top K=30 → LLM rerank → top N=10.

## 7. Vision extraction

Output schema (validate with zod immediately):
```ts
type VisionFeatures = {
  category?: string;     // from vocab, or null
  type?: string;         // from vocab, or null
  style?: string;        // from vocab, or null
  color?: string;        // from vocab, or null
  material?: string;     // optional, often not visually distinguishable
  est_dimensions?: { width_cm?: number; height_cm?: number; depth_cm?: number };
  description: string;   // 1–2 sentences (used for embedding/lexical query)
  keywords: string[];    // 5–10 distinctive terms
  confidence: { category: number; type: number; color: number; style: number };
};
```

System prompt must:
- List the actual catalog vocabularies for each attribute.
- Instruct the model to pick from the list or return null — never invent.
- Output strict JSON, no prose.
- Be conservative on confidence: prefer null over a guess.
- If a user prompt is provided, factor it into the extraction.

## 8. LLM provider abstraction

One interface, OpenAI-compatible implementation:

```ts
interface LLMClient {
  vision(args: { imageBase64: string; mimeType: string; systemPrompt: string; userPrompt?: string }): Promise<unknown>;
  embed(args: { input: string | string[] }): Promise<number[][]>;
  chat(args: { messages: ChatMessage[]; images?: ImageInput[]; jsonMode?: boolean }): Promise<string>;
}
```

Client config (passed per request from frontend, lives in memory only):
```ts
type LLMConfig = {
  apiKey: string;
  baseUrl: string;       // default https://api.openai.com/v1
  visionModel: string;   // default "gpt-4o"
  embedModel: string;    // default "text-embedding-3-small"
  chatModel: string;     // default "gpt-4o"
};
```

**Defaults: `gpt-4o` for vision and chat, not mini.** Extraction and rerank are quality-critical; cost difference is trivial for a demo. Expose mini as a documented cheap option in admin.

**OpenRouter compatibility:** if `baseUrl` contains `openrouter.ai`, the client must additionally send:
- `HTTP-Referer: http://localhost:5173` (or env-configurable)
- `X-Title: Furniture Vision Search`

Both headers are required by OpenRouter for attribution. Document this in the README.

**Embeddings note:** OpenRouter's embedding support is limited. Default the embed provider to OpenAI directly even when chat is via OpenRouter. Admin can override.

**Security rules (non-negotiable):**
- Never log the API key.
- Never persist it to disk, env files, or error responses.
- Pino logger with redact list: `apiKey`, `authorization`, `bearer`, `api-key`, `x-api-key`.
- Errors returned to the client never contain the key in any form.

## 9. Embeddings — lazy build with graceful degradation

- Built **on demand**, not at boot. First `/api/search` call: if `data/embeddings.json` is missing, the backend builds it inline using the user-supplied API key.
- Stream progress via SSE at `/api/admin/reindex-progress` so the UI can show a status bar during the first build.
- Cache to `backend/data/embeddings.json` with a content hash. Rebuild if hash mismatch.
- Manual rebuild via admin "Re-index" button (`POST /api/admin/reindex`).
- **If embeddings are unavailable for any reason** (no key yet, build failed, provider down): set `w_vec = 0`, redistribute its weight to `w_lex`. Pipeline degrades gracefully to lexical + attribute scoring. Surface `"warnings": ["embeddings unavailable, using lexical fallback"]` in the search response.

Embedding text format per product:
```
{title}. {description} Category: {category}. Type: {type}.
```

## 10. Lexical index

Built once at boot from the enriched catalog. MiniSearch config:
```ts
{
  fields: ['title', 'description', 'category', 'type', 'style', 'material', 'color'],
  storeFields: ['_id'],
  searchOptions: { boost: { title: 3, type: 2, category: 2 }, fuzzy: 0.2, prefix: true }
}
```

Query text = `vision.description + " " + vision.keywords.join(" ") + " " + (userPrompt || "")`.

Tokenization rules (used by MiniSearch's tokenize override and anywhere else we tokenize):
- lowercase
- strip punctuation
- split on whitespace
- remove stopwords: `the, a, an, in, on, with, and, or, for, of, to, is, are, was, were, it, this, that, from, by, at, as`

Normalize MiniSearch scores to 0..1 across the result set before mixing into the hybrid score.

## 11. Catalog enrichment

At boot, after loading products and before building lexical/embedding indexes:
```ts
type EnrichedProduct = Product & {
  _attrs: {
    style: string;     // first token of title
    material: string;  // title minus style minus type tokens
    color: string;     // first token of description
  };
};
```

Cache enriched products in memory. Vocab (`categories`, `types`, `styles`, `materials`, `colors`, `priceRange`, `dimRanges`) is derived from these and exposed via `/api/admin/catalog-meta`.

## 12. LLM rerank

**Default: ON. Original image included by default.** Admin toggles: `enableRerank` (default true), `useImageInRerank` (default true).

Input to the chat model:
- The original image (if `useImageInRerank`)
- The extracted `VisionFeatures`
- The user prompt (if any)
- The top K=30 candidates: `{ id, title, description, category, type, price, width, height, depth }`

Output (strict JSON, validated with zod):
```json
{
  "ranked": [{ "id": "...", "score": 0.95, "reason": "..." }],
  "discarded": [{ "id": "...", "reason": "..." }]
}
```

Robust parser: tolerant of code fences, trailing prose, single quotes. If parsing fails after one retry, fall back to hybrid-score order and add `rerank_error: <msg>` to the response. **Never return 500 because rerank failed.**

## 13. Evaluation — TWO tracks, both implemented

### 13a. Static eval (offline, reproducible)

`backend/eval/cases.json` — 6 to 8 cases:
```json
{
  "id": "case_01",
  "image_path": "eval/images/dark_brown_storage_ottoman.jpg",
  "user_prompt": "",
  "expected": {
    "category": "Ottomans",
    "type": "Storage Ottoman",
    "color": "Espresso"
  }
}
```

`POST /api/eval/run` runs the full pipeline against every case and returns:
```json
{
  "summary": {
    "top1_category_match": 0.83,
    "top1_type_match": 0.67,
    "top1_color_match": 0.50,
    "top10_category_match": 1.00,
    "top10_type_match": 0.83,
    "attribute_recall_top1": 0.66,
    "mrr": 0.42,
    "avg_latency_ms": 4120
  },
  "cases": [{ "id": "case_01", "passed": true, "top": [...], "expected": {...} }]
}
```

Source eval images: pick 6 representative products spanning major categories, grab free-use furniture images from Unsplash that match the descriptions, commit to `eval/images/`.

### 13b. Live rating eval (demo-time feedback loop)

Every search creates an in-memory `SearchLog`:
```ts
type SearchLog = {
  id: string;                          // searchId returned to client
  timestamp: Date;
  visionFeatures: VisionFeatures;
  userPrompt?: string;
  resultIds: string[];                 // top N product IDs in returned order
  configUsed: RetrievalConfig;
  ratings: Record<string, boolean>;    // productId -> relevant (true/false)
};
```

- Logs kept in memory (LRU, last 200 entries).
- `POST /api/eval/rate` body `{ searchId, productId, relevant }` records a rating.
- `GET /api/eval/metrics` returns rolling metrics over all rated logs:
  ```json
  {
    "totalSearches": 42,
    "totalRatings": 87,
    "avgPrecisionAt5": 0.71,
    "avgPrecisionAt10": 0.58,
    "avgMRR": 0.49
  }
  ```
- `GET /api/eval/logs?limit=50` returns recent logs with their ratings for the admin UI.

**Frontend integration:** each `ResultCard` shows thumbs-up / thumbs-down buttons. Clicking calls `/api/eval/rate` with the current `searchId`. Disabled if no `searchId` yet (e.g., during loading).

**Why both:** static cases give reproducible numbers across config changes ("did this weight tweak help?"); live ratings show real demo-time relevance and model a production feedback loop. README explains both clearly.

## 14. Admin page (separate tab in the React app)

Tabs: **Config** | **Static Eval** | **Live Eval** | **Catalog Meta**

All settings live in Zustand state and are sent per request.

**Config tab:**
- API key (password input), base URL (text — preset OpenAI/OpenRouter)
- Vision / embed / chat model dropdowns with options:
  - `gpt-4o` (default), `gpt-4o-mini`, `claude-3.5-sonnet`, `gemini-1.5-pro`
  - For OpenRouter, prepend `openai/`, `anthropic/`, `google/` automatically
- Retrieval mode: `hybrid` (default) | `vector_only` | `lexical_only` | `filter_only`
- K (default 30), N (default 10)
- Category/type filter mode: `auto` (uses confidence threshold) | `strict` | `off`
- Confidence threshold slider (0–1, default 0.7)
- All score weights with sliders (0–1 each)
- Price band tolerance (±%, optional)
- `enableRerank` toggle (default ON)
- `useImageInRerank` toggle (default ON)
- Vision system prompt (textarea, default pre-filled)
- Rerank system prompt (textarea, default pre-filled)
- "Re-index embeddings" button → POST /api/admin/reindex (with progress)
- "Reset to defaults" button

**Static Eval tab:**
- "Run eval suite" button → POST /api/eval/run
- Summary cards (top1_category_match, top10_category_match, MRR, avg_latency)
- Per-case results table (id, passed, top result, expected attributes)

**Live Eval tab:**
- Rolling metrics cards (Total Searches, Total Ratings, Precision@5, Precision@10, MRR)
- Recent search logs (last 50, expandable to see results + ratings)

**Catalog Meta tab:**
- Parsed vocabularies (categories, types, styles, materials, colors)
- Counts per category/type
- Price range, dimension ranges
- Embeddings status (built/not built, last index time, item count)

## 15. Project layout

```
/
├── README.md
├── CHANGELOG.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── index.ts
│   │   ├── server.ts
│   │   ├── config.ts
│   │   ├── types.ts
│   │   ├── db/
│   │   │   └── mongo.ts
│   │   ├── llm/
│   │   │   ├── client.ts                 // LLMClient interface
│   │   │   ├── openai-compatible.ts      // includes OpenRouter headers when applicable
│   │   │   └── prompts.ts                // default vision + rerank prompts
│   │   ├── catalog/
│   │   │   ├── load.ts                   // fetch + enrich + cache
│   │   │   ├── vocab.ts                  // derive vocab from enriched products
│   │   │   └── lexical.ts                // MiniSearch index
│   │   ├── services/
│   │   │   ├── vision.ts                 // image → VisionFeatures
│   │   │   ├── embeddings.ts             // build, load, query (lazy + cached)
│   │   │   ├── retrieval.ts              // hybrid scoring → top K
│   │   │   ├── rerank.ts                 // LLM rerank → top N
│   │   │   ├── search.ts                 // pipeline orchestrator
│   │   │   └── eval-live.ts              // SearchLog store + metrics
│   │   ├── routes/
│   │   │   ├── search.ts                 // POST /api/search
│   │   │   ├── admin.ts                  // /api/admin/*
│   │   │   └── eval.ts                   // /api/eval/* (run + rate + metrics + logs)
│   │   ├── utils/
│   │   │   ├── cosine.ts
│   │   │   ├── tokenize.ts               // shared lowercase/strip/stopwords
│   │   │   ├── errors.ts                 // typed AppError
│   │   │   └── logger.ts                 // pino with redact list
│   │   └── tests/
│   │       ├── cosine.test.ts
│   │       ├── enrichment.test.ts        // title/desc parsing
│   │       ├── retrieval.test.ts         // hybrid scoring sanity
│   │       ├── tokenize.test.ts
│   │       └── rerank-parser.test.ts     // malformed JSON tolerance
│   ├── eval/
│   │   ├── cases.json
│   │   └── images/
│   └── data/
│       └── embeddings.json               // gitignored, lazily created
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── routes.tsx
        ├── pages/
        │   ├── SearchPage.tsx
        │   └── AdminPage.tsx
        ├── components/
        │   ├── ImageDropzone.tsx
        │   ├── QueryBar.tsx
        │   ├── ResultCard.tsx            // includes thumbs-up/down
        │   ├── FeaturesPanel.tsx         // shows extracted vision features
        │   ├── WeightsEditor.tsx
        │   ├── ConfigForm.tsx
        │   ├── StaticEvalTable.tsx
        │   ├── LiveEvalDashboard.tsx
        │   └── CatalogMeta.tsx
        ├── store.ts                      // Zustand: config + apiKey + latest searchId
        ├── api.ts                        // typed client
        └── types.ts                      // shared shapes
```

## 16. API surface

- `GET /api/health` → `{ ok, productCount, lexicalReady, embeddingsReady }`
- `GET /api/admin/catalog-meta` → vocab + counts + embeddings status
- `POST /api/admin/reindex` → body `{ llmConfig }`; rebuilds embeddings (SSE progress at `/api/admin/reindex-progress`)
- `POST /api/search` → multipart: `image` file + body `{ userPrompt, llmConfig, retrievalConfig }`. Returns `{ searchId, visionFeatures, candidates, ranked, discarded, timings, warnings }`.
- `POST /api/eval/run` → body `{ llmConfig, retrievalConfig }`. Runs static cases, returns summary + per-case.
- `POST /api/eval/rate` → body `{ searchId, productId, relevant }`. Records a live rating.
- `GET /api/eval/metrics` → rolling live metrics.
- `GET /api/eval/logs?limit=50` → recent SearchLogs.

## 17. Build order (eval moved up so improvements are measurable)

Commit after each step with a clear message.

1. **Skeleton.** Repo, both `package.json`, Dockerfiles, `docker-compose.yml`. `docker compose up` brings backend on :4000 ("ready") and frontend on :5173 ("Furniture Vision Search"). `GET /api/health` returns `{ ok: true }`.

2. **Mongo + enrichment + vocab.** Connect, fetch all products into memory at boot, parse `_attrs`, derive vocab. Health reports product count. `GET /api/admin/catalog-meta` returns vocab.

3. **Lexical index.** MiniSearch built at boot with shared tokenizer/stopwords. Smoke endpoint `POST /api/lexical/debug` returns scored matches for a text query. Verify on 3 queries.

4. **LLM client.** Interface + OpenAI-compatible impl with OpenRouter header support. `POST /api/vision/debug` (multipart image + config) returns `VisionFeatures`. Test with 3 real furniture images.

5. **First working pipeline (no embeddings, no rerank).** `POST /api/search`: vision → hybrid scoring with `w_vec = 0`. Returns top 10 with score breakdown per result. Manually verify on 3 images.

6. **Static eval harness.** 6 cases in `eval/cases.json` + images. `POST /api/eval/run` returns metrics. **Record baseline numbers in CHANGELOG.**

7. **Embeddings (lazy build + cache + lexical fallback).** First search without cache triggers build, streams progress via SSE. Add `w_vec` to scoring. Re-run eval — record lift in CHANGELOG.

8. **LLM rerank (image-aware, default ON).** Robust JSON parser with fallback. Wire into pipeline. Re-run eval — record lift in CHANGELOG.

9. **Live rating layer.** `SearchLog` store, `searchId` returned with every search, `/api/eval/rate`, `/api/eval/metrics`, `/api/eval/logs`. No UI yet — verify via curl.

10. **Frontend search page.** Dropzone, query input, results grid with reasoning, FeaturesPanel sidebar, score breakdown on hover, **thumbs-up/down on each card wired to `/api/eval/rate`**, warning banner area (for "embeddings unavailable" etc.).

11. **Frontend admin page.** Four tabs: Config (all fields, reindex with progress, reset defaults), Static Eval (run + table), Live Eval (rolling metrics + recent logs), Catalog Meta (vocab + counts + embeddings status).

12. **Edge cases.** Missing key (clear UI prompt), oversized image (>10MB → 413), bad image / vision returns null (422 friendly message), no candidates (empty state), LLM 4xx/5xx (typed error, actionable UI), rerank failure (fallback + warning surfaced), MongoDB disconnect at boot (clear error log, /health returns ok=false).

13. **Tests (vitest, ~6 focused).** cosine, enrichment parser, retrieval scoring sanity, tokenize, rerank parser tolerance.

14. **Docs + polish.** README, CHANGELOG (with prompts used + measured eval lifts), `.env.example`, `.gitignore`, final pass.

**If time gets tight, cut order:** drop step 13 first (tests), then trim step 12 to the most common failures, then cut the score-breakdown hover in step 10. **Never cut:** vision extraction, hybrid scoring, static eval harness, live rating, rerank, README architecture section.

## 18. Code style

- `strict: true` in both tsconfigs.
- No `any` except at LLM JSON boundaries → validate with zod immediately.
- Services are pure functions or small classes with one job. No god files.
- Routes are thin: parse → call service → format response. No business logic in routes.
- Typed errors: `class AppError extends Error { constructor(public code: string, message: string, public httpStatus = 500) }`. Map to `{ error: { code, message } }` at the boundary. Never leak stack traces or API keys.
- Logger: pino with redact list.
- One zod schema per external boundary. Export inferred types.
- Case-insensitive comparison for `category` and `type` matching.

## 19. Things to NOT do

- No auth.
- No session DB or our-side persistence beyond the embeddings cache file.
- No localStorage anywhere (API key, config, ratings — all in memory).
- No CLIP locally.
- No writing API keys to disk, env files, logs, or error payloads.
- No job queue. Synchronous pipeline.
- No Next.js, no SSR.
- No ORM. Mongo native driver, read-only.
- No LangChain.
- No three-source candidate fusion. Single unified hybrid scoring over the (filtered) catalog.
- No hardcoded category lists in the vision prompt. Vocab is runtime-derived.

## 20. README must cover

- 60-second pitch.
- How to run locally: `docker compose up`, open :5173, paste API key in admin tab, search.
- Architecture diagram (ASCII is fine).
- **Retrieval design rationale**: catalog template insight → finite vocab → vocab-aware vision prompt → hybrid scoring with both lexical and embeddings → image-aware rerank. Why each piece earns its place.
- **Scaling story**: `Retriever` interface seam, swap to Atlas Vector Search or pgvector with no other code changes. Latency and rough per-query cost.
- **Tradeoffs explicitly named**: cost (~$0.02–0.04 per query with gpt-4o), latency (~3–6s), accuracy ceiling bounded by vision model quality, no image-image matching.
- **Evaluation**: both tracks explained — static cases (reproducible, automated), live ratings (demo + production loop). Limitations: no labeled image→product ground truth; static cases use coarse attribute proxies. Proper offline eval would require CLIP image similarity vs human-labeled pairs and NDCG@K.
- **OpenRouter note**: required headers, embeddings caveat.
- **Future work**:
  - CLIP-based cross-modal embeddings for true image-image matching
  - Atlas Vector Search migration (with the exact seam pointed out)
  - User feedback → active learning loop using the live ratings already collected
  - Image-hash caching for repeated queries
  - Multi-image queries (room scene → multiple matches)
  - Catalog enrichment with product images (would change the whole architecture)
  - Query understanding for compound prompts ("a sofa under $800, navy blue, not too tall")

## 21. CHANGELOG must cover

- Chronological entries per build step.
- For each AI-assisted step, include the actual prompt given (or a faithful summary).
- Particular focus on the search/retrieval decisions: why this pipeline, what was tried and rejected, parameter choices.
- **Measured eval lifts** per addition (lexical baseline → +embeddings → +rerank). These numbers are the strongest signal that you treated this as a real engineering problem.

## 22. Manual verification checklist (run through this before declaring done)

| Item | Why it matters |
|---|---|
| MongoDB connection succeeds at boot, product count > 2000 | Connection string has special chars; SSL needs to work in Docker |
| Vision API call returns valid JSON conforming to schema | OpenRouter vs OpenAI base URLs have different attribution requirements |
| Base64 encoding matches the multipart mime type | Wrong mime type breaks vision calls silently |
| Embeddings cache writes and reads back correctly | Content hash logic |
| Lexical search returns sensible results for "walnut bookshelf" | Tokenization + stopword removal working |
| Hybrid scores produce sensible top-10 on 3 test images | The whole point |
| Toggling rerank off changes the order | Confirms rerank is actually firing |
| Thumbs-up on a result updates `/api/eval/metrics` | Live rating loop end-to-end |
| Re-index button shows progress and completes | SSE wired correctly |
| Removing the API key shows a clear UI message | Edge case handling |
| API key never appears in any log line or error response | Redact list working |
| `docker compose up` works on a fresh checkout | Reviewer's first impression |

## 23. First action

1. Echo back the plan in 5 bullets.
2. List at most 3 blocking ambiguities (no nitpicks).
3. Start step 1 (skeleton + docker-compose). Commit when green.

Don't ask permission for routine decisions. Make them, log them, move on.