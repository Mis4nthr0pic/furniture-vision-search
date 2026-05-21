# Deployment guide

How to put Furniture Vision Search online for demos. You **do not** need to host MongoDB yourself — reuse your existing Atlas (or other) read-only `MONGODB_URI`.

## What you host

| Component | Host yourself? | Notes |
|-----------|----------------|-------|
| **MongoDB catalog** | No | Existing `MONGODB_URI` in backend env |
| **Backend** (Express, port 4000) | Yes | Docker or Node web service |
| **Frontend** (React + nginx) | Yes | Docker or static + proxy |
| **OpenRouter** | N/A | Pay-per-use; key in Admin UI (browser memory) |

Read [SECURITY.md](./SECURITY.md) before exposing the API publicly — there is **no authentication**; anyone with the URL can run search and reindex (using your or visitors’ OpenRouter keys).

---

## Environment variables (backend)

Set these on whatever runs the backend (`docker compose`, Render, Fly, VM):

| Variable | Required | Example |
|----------|----------|---------|
| `MONGODB_URI` | Yes | Your existing Atlas connection string |
| `MONGODB_DB_NAME` | No | `catalog` (default) |
| `MONGODB_PRODUCTS_COLLECTION` | No | `products` (default) |
| `NODE_ENV` | Yes (public) | `production` |
| `CORS_ORIGIN` | Yes (public) | `https://your-frontend.example.com` |
| `OPENROUTER_REFERER` | Yes (public) | Same as frontend URL |
| `OPENROUTER_TITLE` | No | `Furniture Vision Search` |
| `OPENROUTER_API_KEY` | No | Optional server fallback; prefer Admin UI key |

Optional tuning: see [`.env.example`](../.env.example).

**Health check:** `GET /api/health` on the backend base URL.

---

## Option A — Fastest demo (local Docker + Cloudflare Tunnel)

Use when you already run `docker compose` on your machine and need a **temporary public URL** (minutes, no hosting account).

### 1. Start the stack locally

```bash
cp .env.example .env
# Set MONGODB_URI to your existing database
docker compose up --build
```

Confirm: http://localhost:5173 and http://localhost:4000/api/health

### 2. Expose with Cloudflare Tunnel

Install [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/), then:

```bash
cloudflared tunnel --url http://localhost:5173
```

Share the printed `*.trycloudflare.com` URL. The frontend nginx container proxies `/api` to the backend — no CORS or nginx changes needed.

### Limitations

- URL stops working when Docker or the tunnel process stops.
- Traffic goes through your laptop.
- Not suitable as a permanent production site.

---

## Option B — Render (free tier, two web services)

Use for a **shareable URL** without keeping your laptop on. [Render](https://render.com) free web services sleep after ~15 minutes idle (cold start ~30–60s).

### Architecture

```
Browser → frontend.onrender.com (/api proxied) → backend.onrender.com → MongoDB Atlas
                                                      ↓
                                                 OpenRouter API
```

### 1. Deploy the backend

1. Render dashboard → **New → Web Service**
2. Connect this GitHub repo
3. **Root directory:** `backend`
4. **Runtime:** Docker
5. **Instance type:** Free
6. **Environment variables:** (see table above)
   - `MONGODB_URI` = your existing URI
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `https://<frontend-service-name>.onrender.com` (set after frontend is created, then redeploy backend)
   - `OPENROUTER_REFERER` = same frontend URL
7. Deploy and note the URL, e.g. `https://furniture-search-api.onrender.com`

Verify: `https://<backend-url>/api/health`

### 2. Configure the frontend backend URL

The frontend proxies `/api` to the backend via nginx. Set this **environment variable on the frontend Render service** (not in the React app):

| Variable | Example | Required on Render |
|----------|---------|-------------------|
| `BACKEND_URL` | `https://furniture-search-api.onrender.com` | **Yes** |

No trailing slash. The browser still calls `/api/...` on the frontend URL; nginx forwards to your backend.

Local Docker Compose sets `BACKEND_URL=http://backend:4000` automatically in `docker-compose.yml`.

### 3. Deploy the frontend

1. **New → Web Service**
2. Same repo, **Root directory:** `frontend`
3. **Runtime:** Docker
4. **Instance type:** Free
5. **Environment variables:**
   - `BACKEND_URL` = `https://<your-backend-service>.onrender.com` (from step 1)
6. Deploy

Open the frontend URL, go to **Admin → Config**, paste an OpenRouter key, then **Admin → Catalog → Re-index** if embeddings are missing.

### 4. Post-deploy checklist

- [ ] Backend `/api/health` returns OK
- [ ] Frontend loads; Admin shows catalog count (~2500)
- [ ] `CORS_ORIGIN` matches frontend URL exactly (scheme + host, no trailing slash)
- [ ] Re-index completed once (free tier has **no persistent disk** — cache is lost on redeploy/restart)
- [ ] Test search with a furniture photo + optional prompt (`under $500`)

### Render free-tier caveats

| Issue | Mitigation |
|-------|------------|
| Cold starts | First request after idle is slow; warn demo audience |
| No persistent volume | Re-run **Re-index** after each deploy or long sleep |
| OpenRouter cost | Keys in Admin UI; rate limits apply (see SECURITY.md) |

---

## Option C — Single VM (Docker Compose as-is)

Use when you want the **same setup as local** with no nginx changes.

1. Provision a small VM (e.g. Oracle Cloud Always Free, DigitalOcean, etc.)
2. Install Docker + Compose
3. Clone repo, set `.env` with `MONGODB_URI` and production vars:

```bash
NODE_ENV=production
CORS_ORIGIN=http://<vm-ip-or-domain>:5173
OPENROUTER_REFERER=http://<vm-ip-or-domain>:5173
MONGODB_URI=<your existing uri>
```

4. `docker compose up --build -d`
5. Open firewall ports **5173** (frontend) and optionally restrict **4000** to localhost only

For HTTPS, put Caddy or nginx in front of port 5173.

---

## UI revamp before public demo

A Salon editorial UI pass is in progress (see `docs/changelog/ui-salon-revamp.md`). Plan a short **phase 2 polish** (mobile, admin copy, favicon/title) before sharing widely — tracked in `docs/changelog/ui-revamp-phase-2-planned.md`.

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| CORS error in browser | `CORS_ORIGIN` doesn’t match frontend URL |
| Search 401 / LLM errors | No OpenRouter key in Admin → Config |
| Empty catalog | Wrong `MONGODB_URI` or network block from host to Atlas (allow Render/VM IPs in Atlas) |
| Slow first search | Cold start + missing embeddings; run Re-index |
| `/api` 502 from frontend | `BACKEND_URL` missing/wrong on frontend service, or nginx sending frontend `Host` to backend (fixed in latest `nginx.conf.template` — redeploy frontend) |

---

## Related docs

- [README.md](../README.md) — local quick start
- [SECURITY.md](./SECURITY.md) — threat model and public exposure
- [.env.example](../.env.example) — full configuration reference
