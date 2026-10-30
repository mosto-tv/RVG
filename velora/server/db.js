import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { storeProducts } from './data/storeProducts.js';
import { IMAGES, photo } from './data/media.js';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'velora.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    fivem_id TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, property_id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id TEXT,
    property_title TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    preferred_date TEXT,
    preferred_time TEXT,
    message TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    email TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS store_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    features TEXT NOT NULL DEFAULT '[]',
    price_cents INTEGER NOT NULL,
    original_price_cents INTEGER,
    currency TEXT NOT NULL DEFAULT 'USD',
    image TEXT,
    badge TEXT,
    availability TEXT NOT NULL DEFAULT 'Available',
    visible INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    tebex_package_id TEXT,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    player_identifier TEXT NOT NULL,
    total_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',
    provider TEXT NOT NULL DEFAULT 'tebex',
    tebex_basket_id TEXT,
    tebex_transaction_id TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES store_products(id),
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    player_identifier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    delivered_at TEXT,
    UNIQUE (order_item_id)
  );

  CREATE TABLE IF NOT EXISTS webhook_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE,
    event_type TEXT,
    transaction_id TEXT,
    signature_valid INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS support_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    email TEXT,
    order_reference TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_transaction ON orders(tebex_transaction_id);
  CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
`);

export const one = (sql, ...params) => db.prepare(sql).get(...params);
export const all = (sql, ...params) => db.prepare(sql).all(...params);
export const run = (sql, ...params) => db.prepare(sql).run(...params);

const storeImages = {
  vip: photo(IMAGES.store.vip, 1200),
  vehicle: photo(IMAGES.store.vehicle, 1200),
  garage: photo(IMAGES.store.garage, 1200),
  tech: photo(IMAGES.store.tech, 1200),
  night: photo(IMAGES.store.night, 1200),
  lifestyle: photo(IMAGES.store.lifestyle, 1200),
};

export const resolveStoreImage = (key) => storeImages[key] || storeImages.vip;

const seedProducts = () => {
  const { count } = one('SELECT COUNT(*) AS count FROM store_products');
  if (count > 0) return;
  const insert = db.prepare(`
    INSERT INTO store_products
      (slug, name, category, tagline, description, features, price_cents, original_price_cents,
       currency, image, badge, availability, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?)
  `);
  for (const p of storeProducts) {
    insert.run(
      p.slug,
      p.name,
      p.category,
      p.tagline,
      p.description,
      JSON.stringify(p.features),
      p.priceCents,
      p.originalPriceCents ?? null,
      p.image,
      p.badge ?? null,
      p.availability,
      p.featured,
      p.sortOrder,
    );
  }
};

seedProducts();
