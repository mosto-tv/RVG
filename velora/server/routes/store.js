import crypto from 'node:crypto';
import express from 'express';
import { all, one, run } from '../db.js';
import { createBasket, tebexStatus } from '../lib/tebex.js';
import { isEmail, isFiveMIdentifier, ValidationError } from '../lib/validate.js';
import { orderSummary } from '../lib/delivery.js';
import { STORE_CATEGORIES } from '../data/storeProducts.js';
import { resolveStoreImage } from '../db.js';

export const storeRouter = express.Router();

export const toProduct = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category,
  tagline: row.tagline,
  description: row.description,
  features: JSON.parse(row.features || '[]'),
  priceCents: row.price_cents,
  originalPriceCents: row.original_price_cents,
  discountPercent:
    row.original_price_cents && row.original_price_cents > row.price_cents
      ? Math.round(((row.original_price_cents - row.price_cents) / row.original_price_cents) * 100)
      : null,
  currency: row.currency,
  image: resolveStoreImage(row.image),
  badge: row.badge,
  availability: row.availability,
  featured: Boolean(row.featured),
  visible: Boolean(row.visible),
  tebexPackageId: row.tebex_package_id,
  sortOrder: row.sort_order,
});

storeRouter.get('/status', (_req, res) => {
  res.json(tebexStatus());
});

storeRouter.get('/products', (req, res) => {
  const category = String(req.query.category || '').trim();
  const search = String(req.query.q || '').trim().toLowerCase();
  const featured = req.query.featured === 'true';

  let rows = all('SELECT * FROM store_products WHERE visible = 1 ORDER BY sort_order ASC');
  if (category) rows = rows.filter((row) => row.category === category);
  if (featured) rows = rows.filter((row) => row.featured);
  if (search) {
    rows = rows.filter((row) =>
      `${row.name} ${row.category} ${row.tagline} ${row.description}`.toLowerCase().includes(search),
    );
  }
  const products = rows.map(toProduct);
  res.json({
    items: products,
    categories: STORE_CATEGORIES,
    featured: all('SELECT * FROM store_products WHERE visible = 1 AND featured = 1 ORDER BY sort_order').map(toProduct),
  });
});

storeRouter.get('/products/:slug', (req, res) => {
  const row = one('SELECT * FROM store_products WHERE slug = ?', req.params.slug);
  if (!row || !row.visible) {
    return res.status(404).json({ error: 'That package is not available.', code: 'NOT_FOUND' });
  }
  res.json({ product: toProduct(row) });
});

const publicOrder = (order) => {
  const summary = orderSummary(order);
  return {
    ...summary,
    items: summary.items.map(({ id, ...rest }) => rest),
  };
};

storeRouter.get('/orders/:reference', (req, res) => {
  const order = one('SELECT * FROM orders WHERE reference = ?', req.params.reference);
  if (!order) return res.status(404).json({ error: 'Order not found.', code: 'NOT_FOUND' });

  const token = String(req.query.token || req.headers['x-order-token'] || '');
  const isOwner = req.user && order.user_id === req.user.id;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin && (!token || token !== order.access_token)) {
    return res.status(403).json({ error: 'This order needs the checkout link it was created with.', code: 'FORBIDDEN' });
  }
  res.json({ order: publicOrder(order) });
});

storeRouter.post('/orders/:reference/cancel', (req, res) => {
  const order = one('SELECT * FROM orders WHERE reference = ?', req.params.reference);
  if (!order) return res.status(404).json({ error: 'Order not found.', code: 'NOT_FOUND' });
  const token = String(req.body?.token || '');
  if (token !== order.access_token) {
    return res.status(403).json({ error: 'Not permitted.', code: 'FORBIDDEN' });
  }
  if (order.status === 'paid') {
    return res.status(409).json({ error: 'This order is already paid.', code: 'ALREADY_PAID' });
  }
  run("UPDATE orders SET status = 'cancelled' WHERE id = ?", order.id);
  res.json({ ok: true, status: 'cancelled' });
});

storeRouter.post('/checkout', async (req, res, next) => {
  try {
    const status = tebexStatus();
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!rawItems.length) throw new ValidationError({ items: 'Select at least one package.' });

    const fields = {};
    const email = String(req.body?.email || req.user?.email || '')
      .trim()
      .toLowerCase();
    const playerIdentifier = String(req.body?.playerIdentifier || req.user?.fivem_id || '').trim();
    if (!isEmail(email)) fields.email = 'Enter the email your Tebex receipt should go to.';
    if (!isFiveMIdentifier(playerIdentifier)) {
      fields.playerIdentifier = 'Enter your FiveM identifier, for example license:1a2b3c...';
    }
    if (Object.keys(fields).length) throw new ValidationError(fields);

    const selected = [];
    for (const raw of rawItems) {
      const row = one('SELECT * FROM store_products WHERE slug = ? AND visible = 1', String(raw?.slug || ''));
      if (!row) throw new ValidationError({ items: 'One of the selected packages is no longer available.' });
      const quantity = Math.min(Math.max(Number.parseInt(raw?.quantity, 10) || 1, 1), 5);
      selected.push({ row, quantity, product: toProduct(row) });
    }

    // Tebex is the only permitted payment route for FiveM monetisation, so an
    // unconfigured store stops here instead of faking a checkout.
    if (!status.configured) {
      return res.status(503).json({
        error: 'Tebex is not connected yet. The store administrator must add the RIA ROLEPLAY Tebex credentials.',
        code: 'TEBEX_NOT_CONFIGURED',
        missing: status.missing,
      });
    }

    const unlinked = selected.filter(({ row }) => !row.tebex_package_id);
    if (unlinked.length) {
      return res.status(409).json({
        error: 'Some packages are not linked to Tebex yet. Run a package synchronisation in the admin panel.',
        code: 'PACKAGES_NOT_LINKED',
        packages: unlinked.map(({ product }) => product.name),
      });
    }

    const reference = `RIA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const accessToken = crypto.randomBytes(24).toString('hex');
    const total = selected.reduce((sum, { product, quantity }) => sum + product.priceCents * quantity, 0);
    const currency = selected[0].product.currency;

    const result = run(
      `INSERT INTO orders (reference, access_token, user_id, email, player_identifier, total_cents, currency, status, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'tebex')`,
      reference,
      accessToken,
      req.user?.id ?? null,
      email,
      playerIdentifier,
      total,
      currency,
    );
    const orderId = Number(result.lastInsertRowid);
    for (const { product, quantity } of selected) {
      run(
        `INSERT INTO order_items (order_id, product_id, name, price_cents, quantity) VALUES (?, ?, ?, ?, ?)`,
        orderId,
        product.id,
        product.name,
        product.priceCents,
        quantity,
      );
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    try {
      const { ident, checkoutUrl } = await createBasket({
        items: selected.map(({ row, quantity, product }) => ({
          tebexPackageId: row.tebex_package_id,
          quantity,
          name: product.name,
        })),
        returnUrl: `${origin}/store/order/${reference}`,
        cancelUrl: `${origin}/store?cancelled=${reference}`,
        orderReference: reference,
      });
      run('UPDATE orders SET tebex_basket_id = ? WHERE id = ?', ident, orderId);
      res.status(201).json({ reference, accessToken, checkoutUrl, totalCents: total, currency });
    } catch (err) {
      run("UPDATE orders SET status = 'failed', note = ? WHERE id = ?", err.message.slice(0, 300), orderId);
      res.status(502).json({
        error: `Tebex checkout could not be opened: ${err.message}`,
        code: 'TEBEX_ERROR',
        reference,
      });
    }
  } catch (err) {
    next(err);
  }
});
