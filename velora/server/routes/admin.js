import express from 'express';
import { all, one, resolveStoreImage, run } from '../db.js';
import { requireAdmin } from '../lib/auth.js';
import { deliverOrder, orderSummary } from '../lib/delivery.js';
import { fetchPackages, tebexStatus } from '../lib/tebex.js';
import { clean, toCents } from '../lib/validate.js';
import { toProduct } from './store.js';
import { STORE_CATEGORIES } from '../data/storeProducts.js';

export const adminRouter = express.Router();
adminRouter.use(requireAdmin);

const slugify = (value) =>
  clean(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

adminRouter.get('/overview', (_req, res) => {
  const revenue = one("SELECT COALESCE(SUM(total_cents), 0) AS cents FROM orders WHERE status = 'paid'");
  const ordersByStatus = all('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
  const deliveriesByStatus = all('SELECT status, COUNT(*) AS count FROM deliveries GROUP BY status');
  const topProducts = all(
    `SELECT oi.name, SUM(oi.quantity) AS units, SUM(oi.price_cents * oi.quantity) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status = 'paid' GROUP BY oi.name ORDER BY revenue DESC LIMIT 5`,
  );
  const recent = all('SELECT * FROM orders ORDER BY created_at DESC LIMIT 8').map(orderSummary);
  const webhooks = all('SELECT * FROM webhook_events ORDER BY created_at DESC LIMIT 10');
  const supportOpen = one("SELECT COUNT(*) AS count FROM support_requests WHERE status = 'open'").count;
  const pendingDeliveries = one("SELECT COUNT(*) AS count FROM deliveries WHERE status IN ('pending','failed','queued')").count;

  res.json({
    tebex: tebexStatus(),
    revenueCents: revenue.cents,
    ordersByStatus,
    deliveriesByStatus,
    topProducts,
    recentOrders: recent,
    webhooks,
    supportOpen,
    pendingDeliveries,
    newsletter: one('SELECT COUNT(*) AS count FROM newsletter').count,
    bookings: one('SELECT COUNT(*) AS count FROM bookings').count,
    messages: one('SELECT COUNT(*) AS count FROM messages').count,
    favorites: one('SELECT COUNT(*) AS count FROM favorites').count,
  });
});

adminRouter.get('/products', (_req, res) => {
  res.json({
    items: all('SELECT * FROM store_products ORDER BY sort_order ASC').map((row) => ({
      ...toProduct(row),
      rawImage: row.image,
      tebexPackageId: row.tebex_package_id,
    })),
    categories: STORE_CATEGORIES,
  });
});

adminRouter.post('/products', (req, res) => {
  const name = clean(req.body?.name, 120);
  const category = STORE_CATEGORIES.includes(req.body?.category) ? req.body.category : STORE_CATEGORIES[0];
  const price = toCents(req.body?.priceCents);
  if (!name || price === null) {
    return res.status(422).json({ error: 'نام و قیمت الزامی است.', code: 'VALIDATION_ERROR' });
  }
  const result = run(
    `INSERT INTO store_products (slug, name, category, tagline, description, features, price_cents,
      original_price_cents, image, badge, availability, visible, featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    `${slugify(name)}-${Date.now().toString(36)}`,
    name,
    category,
    clean(req.body?.tagline, 160),
    clean(req.body?.description, 1200),
    JSON.stringify(Array.isArray(req.body?.features) ? req.body.features.slice(0, 8) : []),
    price,
    toCents(req.body?.originalPriceCents),
    req.body?.image || 'vip',
    clean(req.body?.badge, 30) || null,
    clean(req.body?.availability, 60) || 'Available',
    req.body?.visible === false ? 0 : 1,
    req.body?.featured ? 1 : 0,
    Number.parseInt(req.body?.sortOrder, 10) || 100,
  );
  res.status(201).json({ product: toProduct(one('SELECT * FROM store_products WHERE id = ?', Number(result.lastInsertRowid))) });
});

adminRouter.patch('/products/:id', (req, res) => {
  const row = one('SELECT * FROM store_products WHERE id = ?', req.params.id);
  if (!row) return res.status(404).json({ error: 'محصول پیدا نشد.', code: 'NOT_FOUND' });

  const fields = [];
  const values = [];
  const set = (column, value) => {
    fields.push(`${column} = ?`);
    values.push(value);
  };

  if (typeof req.body?.visible === 'boolean') set('visible', req.body.visible ? 1 : 0);
  if (typeof req.body?.featured === 'boolean') set('featured', req.body.featured ? 1 : 0);
  if (req.body?.name) set('name', clean(req.body.name, 120));
  if (req.body?.availability) set('availability', clean(req.body.availability, 60));
  if (STORE_CATEGORIES.includes(req.body?.category)) set('category', req.body.category);
  if (req.body?.priceCents !== undefined) {
    const price = toCents(req.body.priceCents);
    if (price !== null) set('price_cents', price);
  }
  if (req.body?.tebexPackageId !== undefined) {
    set('tebex_package_id', clean(String(req.body.tebexPackageId), 40) || null);
  }
  if (req.body?.image) set('image', resolveStoreImage(req.body.image) ? req.body.image : row.image);

  if (!fields.length) return res.json({ product: toProduct(row) });
  values.push(row.id);
  run(
    `UPDATE store_products SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    ...values,
  );
  res.json({ product: toProduct(one('SELECT * FROM store_products WHERE id = ?', row.id)) });
});

/** Pulls live packages from Tebex, linking them to local catalogue entries. */
adminRouter.post('/sync-tebex', async (_req, res) => {
  const status = tebexStatus();
  if (!status.configured) {
    return res.status(503).json({
      error: 'Tebex متصل نیست. ابتدا اطلاعات فروشگاه ریا رول‌پلی را اضافه کنید.',
      code: 'TEBEX_NOT_CONFIGURED',
      missing: status.missing,
    });
  }
  let payload;
  try {
    payload = await fetchPackages();
  } catch (err) {
    return res.status(502).json({ error: `Tebex sync failed: ${err.message}`, code: 'TEBEX_ERROR' });
  }
  const packages = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  const local = all('SELECT * FROM store_products');
  const normalise = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  let linked = 0;
  let updatedPrices = 0;
  const unmatched = [];

  for (const pkg of packages) {
    const match = local.find(
      (row) => normalise(row.name) === normalise(pkg.name) || String(row.tebex_package_id) === String(pkg.id),
    );
    if (!match) {
      unmatched.push({ id: pkg.id, name: pkg.name });
      continue;
    }
    run('UPDATE store_products SET tebex_package_id = ? WHERE id = ?', String(pkg.id), match.id);
    linked += 1;
    const price = toCents(pkg.price ?? (pkg.total_price ? Number(pkg.total_price) * 100 : null));
    if (price !== null && price > 0 && price !== match.price_cents) {
      run("UPDATE store_products SET price_cents = ?, updated_at = datetime('now') WHERE id = ?", price, match.id);
      updatedPrices += 1;
    }
  }

  res.json({
    ok: true,
    linked,
    updatedPrices,
    tebexPackages: packages.length,
    unmatchedTebex: unmatched,
    syncedAt: new Date().toISOString(),
  });
});

adminRouter.get('/orders', (req, res) => {
  const status = clean(req.query.status, 20);
  const search = clean(req.query.q, 80).toLowerCase();
  let rows = all('SELECT * FROM orders ORDER BY created_at DESC');
  if (status) rows = rows.filter((row) => row.status === status);
  if (search) {
    rows = rows.filter((row) =>
      `${row.reference} ${row.email} ${row.player_identifier}`.toLowerCase().includes(search),
    );
  }
  res.json({ items: rows.slice(0, 200).map(orderSummary) });
});

adminRouter.post('/orders/:reference/resend-delivery', async (req, res) => {
  const order = one('SELECT * FROM orders WHERE reference = ?', req.params.reference);
  if (!order) return res.status(404).json({ error: 'سفارش پیدا نشد.', code: 'NOT_FOUND' });
  if (order.status !== 'paid') {
    return res.status(409).json({ error: 'تنها سفارش‌های پرداخت‌شده قابل تحویل هستند.', code: 'NOT_PAID' });
  }
  const deliveries = await deliverOrder(order);
  res.json({ ok: true, deliveries });
});

adminRouter.get('/deliveries', (req, res) => {
  const status = clean(req.query.status, 20);
  const rows = all(
    `SELECT d.*, o.reference, o.email, o.status AS order_status
     FROM deliveries d JOIN orders o ON o.id = d.order_id
     ORDER BY d.created_at DESC`,
  );
  res.json({ items: status ? rows.filter((row) => row.status === status) : rows.slice(0, 200) });
});

adminRouter.patch('/deliveries/:id', (req, res) => {
  const row = one('SELECT * FROM deliveries WHERE id = ?', req.params.id);
  if (!row) return res.status(404).json({ error: 'تحویل پیدا نشد.', code: 'NOT_FOUND' });
  const status = ['delivered', 'pending', 'failed', 'queued'].includes(req.body?.status)
    ? req.body.status
    : null;
  if (!status) return res.status(422).json({ error: 'وضعیت تحویل نامشخص است.', code: 'VALIDATION_ERROR' });
  run(
    `UPDATE deliveries SET status = ?, last_error = ?, delivered_at = CASE WHEN ? = 'delivered' THEN datetime('now') ELSE delivered_at END
     WHERE id = ?`,
    status,
    clean(req.body?.note, 300) || row.last_error,
    status,
    row.id,
  );
  res.json({ delivery: one('SELECT * FROM deliveries WHERE id = ?', row.id) });
});

adminRouter.get('/players', (req, res) => {
  const query = clean(req.query.identifier || req.query.q, 90).toLowerCase();
  if (!query) return res.json({ users: [], orders: [] });
  const users = all(
    'SELECT id, email, name, fivem_id, role, created_at FROM users WHERE lower(email) LIKE ? OR lower(fivem_id) LIKE ? OR lower(name) LIKE ?',
    `%${query}%`,
    `%${query}%`,
    `%${query}%`,
  );
  const orders = all(
    'SELECT * FROM orders WHERE lower(player_identifier) LIKE ? OR lower(email) LIKE ? ORDER BY created_at DESC',
    `%${query}%`,
    `%${query}%`,
  ).map(orderSummary);
  res.json({ users, orders });
});

adminRouter.get('/support', (req, res) => {
  const status = clean(req.query.status, 20);
  const rows = all('SELECT * FROM support_requests ORDER BY created_at DESC');
  res.json({ items: status ? rows.filter((row) => row.status === status) : rows });
});

adminRouter.patch('/support/:id', (req, res) => {
  const row = one('SELECT * FROM support_requests WHERE id = ?', req.params.id);
  if (!row) return res.status(404).json({ error: 'درخواست پیدا نشد.', code: 'NOT_FOUND' });
  const status = ['open', 'in_progress', 'closed'].includes(req.body?.status) ? req.body.status : 'open';
  run('UPDATE support_requests SET status = ? WHERE id = ?', status, row.id);
  res.json({ request: one('SELECT * FROM support_requests WHERE id = ?', row.id) });
});

adminRouter.get('/inbox', (_req, res) => {
  res.json({
    bookings: all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100'),
    messages: all('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100'),
    newsletter: all('SELECT email, created_at FROM newsletter ORDER BY created_at DESC LIMIT 200'),
  });
});
