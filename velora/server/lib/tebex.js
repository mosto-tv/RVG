import crypto from 'node:crypto';

const PLUGIN_API = 'https://plugin.tebex.io';
const HEADLESS_API = 'https://headless.tebex.io/api';

/**
 * Tebex credentials are supplied by the store administrator through the
 * dashboard (never committed). When they are absent the store stays fully
 * browsable but checkout reports exactly which values are missing instead of
 * simulating a payment.
 */
export const tebexConfig = () => ({
  secretKey: process.env.TEBEX_SECRET_KEY || '',
  publicToken: process.env.TEBEX_PUBLIC_TOKEN || '',
  webhookSecret: process.env.TEBEX_WEBHOOK_SECRET || '',
  storeUrl: process.env.TEBEX_STORE_URL || '',
  deliveryWebhook: process.env.FIVEM_DELIVERY_WEBHOOK_URL || '',
  deliverySecret: process.env.FIVEM_DELIVERY_SECRET || '',
});

export const tebexStatus = () => {
  const cfg = tebexConfig();
  const required = {
    TEBEX_PUBLIC_TOKEN: cfg.publicToken,
    TEBEX_SECRET_KEY: cfg.secretKey,
    TEBEX_WEBHOOK_SECRET: cfg.webhookSecret,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  return {
    configured: missing.length === 0,
    missing,
    storeUrl: cfg.storeUrl || null,
    deliveryConfigured: Boolean(cfg.deliveryWebhook),
  };
};

const pluginFetch = async (path, init = {}) => {
  const { secretKey } = tebexConfig();
  if (!secretKey) throw new Error('TEBEX_SECRET_KEY is not configured.');
  const res = await fetch(`${PLUGIN_API}${path}`, {
    ...init,
    headers: {
      'X-Tebex-Secret': secretKey,
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 400) };
  }
  if (!res.ok) {
    const error = new Error(`Tebex API ${res.status}: ${body?.title || body?.message || res.statusText}`);
    error.status = res.status;
    throw error;
  }
  return body;
};

/** Verifies the HMAC signature Tebex sends with every webhook payload. */
export const verifyWebhookSignature = (rawBody, signature) => {
  const { webhookSecret } = tebexConfig();
  if (!webhookSecret || !signature || !rawBody) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(String(signature).trim(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/** Server-to-server confirmation that a transaction really completed. */
export const fetchTransaction = async (transactionId) => {
  return pluginFetch(`/payments/${encodeURIComponent(transactionId)}`, { method: 'GET' });
};

export const fetchPackages = async () => pluginFetch('/packages', { method: 'GET' });

/**
 * Creates a Tebex hosted basket and returns its checkout URL. Card details are
 * only ever entered on Tebex's own checkout.
 */
export const createBasket = async ({ items, returnUrl, cancelUrl, orderReference }) => {
  const { publicToken } = tebexConfig();
  if (!publicToken) throw new Error('TEBEX_PUBLIC_TOKEN is not configured.');

  const basketRes = await fetch(`${HEADLESS_API}/accounts/${publicToken}/baskets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      complete_url: returnUrl,
      cancel_url: cancelUrl,
      custom: { order_reference: orderReference },
    }),
  });
  const basket = await basketRes.json().catch(() => null);
  if (!basketRes.ok || !basket?.data?.ident) {
    throw new Error(basket?.error_message || basket?.message || 'Tebex could not create a basket.');
  }
  const ident = basket.data.ident;

  for (const item of items) {
    if (!item.tebexPackageId) {
      throw new Error(`Package for "${item.name}" is not linked to a Tebex package yet.`);
    }
    const addRes = await fetch(`${HEADLESS_API}/baskets/${ident}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        package_id: Number(item.tebexPackageId),
        quantity: item.quantity,
        type: 'single',
      }),
    });
    if (!addRes.ok) {
      const err = await addRes.json().catch(() => null);
      throw new Error(err?.error_message || `Tebex rejected package ${item.tebexPackageId}.`);
    }
  }

  const checkoutRes = await fetch(`${HEADLESS_API}/accounts/${publicToken}/baskets/${ident}`);
  const checkout = await checkoutRes.json().catch(() => null);
  const checkoutUrl = checkout?.data?.links?.checkout;
  if (!checkoutUrl) throw new Error('Tebex did not return a checkout link.');
  return { ident, checkoutUrl };
};

/**
 * Hands a verified entitlement to the FiveM server. The server-side endpoint is
 * configured by the administrator; when it is absent the delivery is parked as
 * pending so an administrator can complete it manually.
 */
export const dispatchDelivery = async (payload) => {
  const { deliveryWebhook, deliverySecret } = tebexConfig();
  if (!deliveryWebhook) {
    return { delivered: false, error: 'FIVEM_DELIVERY_WEBHOOK_URL is not configured.' };
  }
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', deliverySecret || 'unset').update(body).digest('hex');
  const res = await fetch(deliveryWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-RIA-Signature': signature },
    body,
  });
  if (!res.ok) {
    return { delivered: false, error: `Delivery endpoint responded ${res.status}.` };
  }
  return { delivered: true, error: null };
};
