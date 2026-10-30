# Working notes for agents

## What this app is

Single-process FastAPI service (`main.py`), Python 3.12. No build step, no separate frontend:
`pages.py` contains the HTML for the landing page (`/`), login (`/login`) and dashboard (`/dashboard`).
The panel is **server-rendered (MPA)** — `/dashboard` answers with a full HTML document, so
in-preview SPA route helpers do not work; use a real page load.

## Running it (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- `Dockerfile.base44` installs only `requirements.txt`; the checkout is bind-mounted at `/app`
  and served by `uvicorn main:app --reload`, so Python edits reload without a rebuild.
  Rebuild only when `requirements.txt` changes.
- Host port **3000** → container port 8000 (`PORT=8000`).
- Panel state lives in `DATA_DIR=/data`, backed by the named volume `rvg-data`
  (`rvg_state.json`, the generated `SECRET_KEY`, bot tokens). Never delete that volume to
  "reset" the app; it also holds the admin password hash once changed.
- `/data` must be writable: if it is not, the app still boots but falls back to a temporary
  `SECRET_KEY` and in-memory state.

## Login

Default admin password is **123456** (hash of `ADMIN_PASSWORD`, defaulted in `main.py`).
Set `ADMIN_PASSWORD` to override, or change it in the panel; the change is persisted in
`/data/rvg_state.json`.

## Optional integrations (not needed to boot)

- `REDIS_URL` – if set and reachable, panel state is stored in Redis instead of `/data`.
- Railway tokens / Telegram bot features (`bottokentcpproxy.py`, `botgeneratedomin.py`) only
  affect MTProto TCP proxies and domain generation. `central.py` and `updater.py` are
  deliberately gutted: their outbound calls are disabled, so no external service is required.

## Verifying it works

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/login   # 200
curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' -d '{"password":"123456"}' -i | head -1   # 200 + session cookie
curl -s -b <cookie> http://localhost:3000/dashboard | head -c 200             # dashboard HTML
```

Compose healthcheck probes `/login` (a read-only existing route) every 15s.
