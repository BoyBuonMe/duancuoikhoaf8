# Soketi setup (support chat realtime)

Soketi is a Pusher-compatible WebSocket server. Chat **AI** does not need it; **user ↔ admin support** does.

## Credentials (dev defaults)

| Variable | Value |
|----------|--------|
| `PUSHER_APP_ID` | `app-id` |
| `PUSHER_APP_KEY` | `app-key` |
| `PUSHER_APP_SECRET` | `app-secret` |

Copy from `BE/.env.example` into `BE/.env` and `FE/.env.local`.

## Option A — Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
# From BE/
npm run soketi          # foreground, port 6001
# or
npm run soketi:detach   # background

# From repo root
docker compose up soketi -d
```

Verify:

```bash
cd BE && npm run test:soketi
```

## Option B — Full stack (production-like)

```bash
docker compose up -d
```

Backend uses `PUSHER_HOST=soketi` inside Docker network. Browser uses `localhost:6001` via `NEXT_PUBLIC_PUSHER_*`.

## Local dev terminals

| Terminal | Command |
|----------|---------|
| 1 | `npm run soketi` (or Docker Desktop + soketi:detach) |
| 2 | `cd BE && npm run dev` |
| 3 | `cd FE && npm run dev` |

BE log should show: `[realtime] Soketi/Pusher key=app-key ws=http://127.0.0.1:6001`

## Troubleshooting

- **`docker: command not found`** — Install Docker Desktop, or run Soketi on a server/VM with Docker.
- **`npm run soketi` via Node package** — `@soketi/soketi` may fail on Node 20+ on Windows; use Docker instead.
- **`test:soketi` failed** — Soketi is not running on port 6001.

## Next step (code)

After Soketi runs: implement chat REST API + `POST /api/broadcasting/auth` + FE `pusher-js` widget.
