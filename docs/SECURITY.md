# Security

Furniture Vision Search is a **local demo / evaluation tool**, not a hardened multi-tenant SaaS. This document describes the threat model, what we mitigate, and what you must not expose to the public internet without additional controls.

## Intended deployment

| Environment | Expected use |
|-------------|--------------|
| **Localhost** | Primary — `docker compose up`, dev servers on `localhost:4000` / `5173` |
| **Private network** | Acceptable for internal demos with network isolation |
| **Public internet** | **Not supported** without auth, TLS, WAF, and ops hardening |

There is **no authentication** on API routes. Anyone who can reach the backend can:

- Run vision + search (costs your OpenRouter quota)
- Trigger embedding rebuild (`POST /api/admin/reindex`)
- Run static eval (`POST /api/eval/run`)
- Read catalog metadata

That is intentional for localhost evaluation workflows where the operator controls the machine and API key.

## Threat model

### Assets

- **OpenRouter API key** — passed per request from the Admin UI (memory only in the browser); optional dev fallback via `OPENROUTER_API_KEY` in `.env` (never commit).
- **MongoDB catalog** — read-only connection; no writes from this app.
- **Local embedding cache** — `backend/data/` volume; rebuildable from catalog + API key.

### Trust boundaries

```
[Browser] --HTTP--> [Express API] --HTTPS--> [OpenRouter]
                         |
                         +--> [MongoDB read-only]
                         +--> [Local embedding files]
```

The browser is untrusted for file uploads (MIME spoofing). The API is untrusted for cost abuse if exposed. MongoDB credentials must be read-only at the database level.

### In-scope risks (mitigated in Step 15)

| Risk | Mitigation |
|------|------------|
| Arbitrary file upload types | MIME allowlist on image routes (JPEG, PNG, WebP) |
| Malformed multipart JSON | `parseJsonField` returns friendly `400 INVALID_JSON` |
| Accidental dev mode in Docker | Compose defaults `NODE_ENV=production` (disables server-side API key fallback) |
| Debug endpoints in production | `/api/vision/debug`, `/api/lexical/*` omitted when `NODE_ENV=production` or `DISABLE_DEBUG_ROUTES=true` |
| Cost / DoS on expensive routes | In-memory rate limits on search, reindex, eval run |
| Secrets in logs | Pino redact paths for `apiKey`, `authorization`, nested variants |

### Out of scope (accept or add before public deploy)

- User authentication / authorization
- Per-tenant API key storage
- CSRF protection (same-origin localhost demo)
- Distributed rate limiting (Redis) — single-process in-memory only
- Image content scanning (malware, EXIF exploits)
- Strict CORS lockdown — configure `CORS_ORIGIN` for your frontend origin in non-local deploys
- TLS termination — use a reverse proxy if not localhost

## Configuration reference

```bash
# Production-like Docker (default)
NODE_ENV=production

# Force-hide debug routes even in development
DISABLE_DEBUG_ROUTES=true

# Rate limits (defaults shown)
RATE_LIMIT_SEARCH_MAX=30
RATE_LIMIT_SEARCH_WINDOW_MS=60000
RATE_LIMIT_REINDEX_MAX=3
RATE_LIMIT_REINDEX_WINDOW_MS=3600000
RATE_LIMIT_EVAL_MAX=5
RATE_LIMIT_EVAL_WINDOW_MS=3600000
```

## Localhost-only warnings

1. **Do not port-forward or bind `0.0.0.0` to the internet** without putting auth in front of the API.
2. **Never commit `.env`** — it may contain `MONGODB_URI` and `OPENROUTER_API_KEY`.
3. **Use a read-only MongoDB user** — the app assumes catalog is immutable.
4. **Reindex is expensive** — rate-limited to 3/hour per IP by default; still costly if an attacker has network access.
5. **Eval logs may contain prompts** — treat `Admin → Live Eval` logs as sensitive in shared environments.

## Reporting

This is an evaluation project. For production forks, add auth, secret management, and infrastructure review before go-live.
