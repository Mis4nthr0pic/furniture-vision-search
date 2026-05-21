# Hygiene — env var for MongoDB URI (2026-05-21)

- `docker-compose.yml` reads `MONGODB_URI` from `.env` instead of inlining the connection string.
- `.env.example` trimmed to the vars compose consumes; README documents `cp .env.example .env`.
