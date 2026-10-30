# AGENTS.md — working notes for this repository

## What lives here
- The repository root is **RVG Gateway**, a Python/FastAPI proxy panel (`main.py`, `pages.py`,
  `protocol/`). It is unrelated to the app described below and is left untouched.
- **`velora/`** is a self-contained product that runs independently: the RIA ROLEPLAY FiveM
  community site (server features, staff, roadmap) plus the Tebex store.
  - `velora/` — React 18 + Vite 6 frontend (dev server on 5173, proxied to host port 3000).
  - `velora/server/` — Node 24 Express API on 4000, using the built-in `node:sqlite` module
    (no native build step, no ORM). Catalogue data is plain ES modules in `velora/server/data/`.
  - The catalogue is **server content, not real estate**. `data/properties.js` keeps the original
    field names because routes, filters and CSS are built on them; read them as:
    `beds` = players, `baths` = session minutes, `size` = rep reward, `price` = in-game payout,
    `city` = district, `neighborhood` = area, `country` = region, `agent` = staff slug.
    `data/locations.js` slugs (`dubai`, `maldives`, …) are grid-area CSS hooks — keep them, but its
    `city` values must match `data/properties.js` so district links filter correctly.

## Running it
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml logs -f api web
```
- Only `web` publishes a host port (3000). The frontend calls the API through the Vite proxy at
  `/api`, so cookies stay same-origin. `API_PROXY_TARGET` (default `http://api:4000`) changes the
  upstream.
- Node 24 is required: the API imports `node:sqlite` (`DatabaseSync`). Node 22 needs
  `--experimental-sqlite`.

## Gotchas learned the hard way
- **Do not mount a volume at `/app/data`.** That path holds the source module
  `velora/server/data/*.js`; the database volume is mounted at `/app/.data` with
  `DATA_DIR=/app/.data`. Mounting over `/app/data` hides the catalogue and the API exits with
  `ERR_MODULE_NOT_FOUND`.
- **Edits under `velora/server/` need an API restart** — the API runs without a file watcher:
  `docker compose -f docker-compose.base44.yml restart api`. Frontend edits hot-reload.
- SQLite lives in the `velora-data` volume. Deleting it resets accounts, orders and deliveries;
  the store catalogue is re-seeded on first boot only when `store_products` is empty, so a copy
  change in `server/data/storeProducts.js` does **not** reach an existing database — update the
  row too (a one-off script in `/tmp`, run inside the `api` container).
- The seed catalogue carries **catalog prices**. Live Tebex prices are imported by
  `POST /api/admin/sync-tebex` (requires `TEBEX_SECRET_KEY`); until then `tebex_package_id` is
  null and checkout refuses to open rather than pretending to charge.

## Accounts, roles and access
- There is no seeded password. The **first account that signs up becomes an administrator**
  (subsequent accounts are `member`), and any email listed in `ADMIN_EMAILS` is promoted at
  signup. Administrator-only surfaces: `/admin` (products, orders, deliveries, player lookup,
  support, inbox) — enforced server-side by `requireAdmin`.
- Auth is cookie sessions (`velora_session`, httpOnly) with `scrypt` password hashing; sessions
  live in the `sessions` table.

## Store, payments and delivery (compliance-sensitive)
- **Tebex is the only payment path.** No Stripe/PayPal/crypto, and no simulated checkout: when
  `TEBEX_PUBLIC_TOKEN`, `TEBEX_SECRET_KEY` or `TEBEX_WEBHOOK_SECRET` are missing, checkout
  returns `503 TEBEX_NOT_CONFIGURED` listing exactly what the administrator must add.
- `POST /api/tebex/webhook` verifies the `X-Tebex-Signature` HMAC against the raw body, then
  re-reads the transaction from `plugin.tebex.io` before anything is marked paid or delivered.
  Client-side confirmation is never trusted. Events are de-duplicated in `webhook_events`.
- Deliveries are one row per purchased line (unique `order_item_id`), so duplicates are
  impossible. A failed hand-off is parked as `pending` for manual review — never auto-retried,
  never marked delivered.
- `FIVEM_DELIVERY_WEBHOOK_URL` is where a verified entitlement is posted (HMAC-signed with
  `FIVEM_DELIVERY_SECRET`). Without it every delivery stays `pending` by design.
- Products must stay within the Cfx.re Platform License, the Rockstar Creator Platform License
  and the Tebex Acceptable Use Policy: memberships, priority access, cosmetics, community
  benefits. No in-game currency, loot boxes, randomised rewards or gambling.

## Environment and secrets
- Committed placeholders: `velora/.env.base44-defaults` (blank values only). The platform
  supplies real values in `/run/base44/app.env`, listed **after** the defaults so dashboard
  secrets always win. Never move a user-supplied key into Compose `environment:`.
- Sandbox-only overrides are gated on `BASE44_PREVIEW_MODE === "1"` in `velora/vite.config.js`
  (allowed hosts from `BASE44_SANDBOX_HOST_DOMAIN` / `BASE44_PUBLIC_HOST_SUFFIX`). With the flag
  unset, Vite keeps its default host checking.

## How to verify
- `curl -s localhost:3000/api/health` → `{"ok":true,...}` plus Tebex configuration state.
- Filters: `/api/properties?location=Sandy%20Shores&type=Racing&minPrice=5000&sort=price-desc`.
- Search: `/api/properties?q=vinewood`. Favourites need a session cookie.
- Clean test data by deleting only records you created (a test signup, its favourites and
  sessions). Removing the only account makes the next signup an administrator again.
