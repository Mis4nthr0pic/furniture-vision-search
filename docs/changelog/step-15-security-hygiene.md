# Step 15 — Security hygiene (2026-05-21)

**Changes:**
- MIME allowlist (JPEG, PNG, WebP) on search and vision upload routes.
- Friendly `400 INVALID_JSON` when multipart JSON fields are malformed.
- Docker Compose defaults `NODE_ENV=production`; debug routes hidden in production (`DISABLE_DEBUG_ROUTES`).
- In-memory rate limits on `/api/search`, `/api/admin/reindex`, `/api/eval/run`.
- Extended logger redaction for nested `apiKey` and `authorization` fields.
- `docs/SECURITY.md` — threat model and localhost-only deployment guidance.
