# Deployment guide (2026-05-21)

**Added:** [docs/DEPLOYMENT.md](../DEPLOYMENT.md) — procedures for demo/public hosting without self-hosting MongoDB.

**Covers:**
- Cloudflare Tunnel from local Docker (fastest temporary URL)
- Render free tier (backend + frontend web services, env vars, nginx upstream change)
- Single VM with Docker Compose unchanged
- Post-deploy checklist and troubleshooting

**Assumption:** Existing MongoDB Atlas (or other) `MONGODB_URI`; only backend + frontend are deployed.
