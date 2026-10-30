import crypto from 'node:crypto';
import express from 'express';
import { one, run } from '../db.js';
import { deliverOrder } from '../lib/delivery.js';
import { fetchTransaction, tebexConfig, verifyWebhookSignature } from '../lib/tebex.js';

export const tebexWebhookRouter = express.Router();

const parseJson = (buffer) => {
  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch {
    return null;
  }
};

const orderReferenceOf = (body) =>
  body?.custom?.order_reference ||
  body?.subject?.custom?.order_reference ||
  body?.subject?.custom?.orderReference ||
  null;

/**
 * Tebex sends payment notifications here. Nothing is treated as paid until the
 * HMAC signature validates AND the transaction is re-read from the Tebex API
 * server-side. Client-side confirmation is never trusted.
 */
tebexWebhookRouter.post('/tebex/webhook', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
  const body = parseJson(raw);
  const signature = req.headers['x-tebex-signature'];
  const signatureValid = verifyWebhookSignature(raw, signature);

  const eventId =
    (body && (body.id || body.event_id)) || `unknown-${crypto.createHash('sha1').update(raw).digest('hex')}`;
  const eventType = body?.type || 'unknown';
  const transactionId = body?.subject?.transaction_id || body?.subject?.id || null;
  const reference = orderReferenceOf(body);

  const existing = one('SELECT id FROM webhook_events WHERE event_id = ?', String(eventId));
  if (existing) return res.json({ ok: true, duplicate: true });

  const logEvent = (note, valid = signatureValid) =>
    run(
      `INSERT OR IGNORE INTO webhook_events (event_id, event_type, transaction_id, signature_valid, note)
       VALUES (?, ?, ?, ?, ?)`,
      String(eventId),
      eventType,
      transactionId ? String(transactionId) : null,
      valid ? 1 : 0,
      note,
    );

  if (!signatureValid) {
    logEvent('Rejected: signature did not match TEBEX_WEBHOOK_SECRET.', false);
    return res.status(401).json({ error: 'امضا نامعتبر است.' });
  }

  if (!body) {
    logEvent('Rejected: payload was not valid JSON.');
    return res.status(400).json({ error: 'داده ارسالی نامعتبر است.' });
  }

  const order = reference ? one('SELECT * FROM orders WHERE reference = ?', String(reference)) : null;

  if (!order) {
    logEvent(`Unmatched webhook: no local order for reference ${reference || 'n/a'}.`);
    return res.json({ ok: true, matched: false });
  }

  if (eventType === 'payment.completed') {
    if (order.status === 'paid') {
      logEvent(`Order ${order.reference} already marked paid.`);
      return res.json({ ok: true, duplicate: true });
    }

    // Re-read the transaction from Tebex before anything is delivered.
    const { secretKey } = tebexConfig();
    if (!secretKey) {
      logEvent(`Order ${order.reference}: cannot verify payment, TEBEX_SECRET_KEY missing.`);
      return res.status(503).json({ error: 'تأیید پرداخت تنظیم نشده است.' });
    }
    let payment;
    try {
      payment = transactionId ? await fetchTransaction(String(transactionId)) : null;
    } catch (err) {
      logEvent(`Order ${order.reference}: Tebex verification failed (${err.message}). Will retry.`);
      return res.status(502).json({ error: 'تأیید پرداخت در دسترس نیست، دوباره تلاش کنید.' });
    }
    const status = String(payment?.status || '').toLowerCase();
    if (!payment || status !== 'complete') {
      logEvent(`Order ${order.reference}: Tebex reports status "${payment?.status || 'unknown'}"; not delivered.`);
      return res.json({ ok: true, verified: false });
    }

    run(
      `UPDATE orders SET status = 'paid', tebex_transaction_id = ?, paid_at = datetime('now') WHERE id = ?`,
      String(transactionId || payment?.id || ''),
      order.id,
    );
    const paid = one('SELECT * FROM orders WHERE id = ?', order.id);
    const deliveries = await deliverOrder(paid);
    logEvent(
      `Order ${order.reference} verified and paid. Deliveries: ${deliveries
        .map((d) => `${d.id}:${d.status}`)
        .join(', ')}`,
    );
    return res.json({ ok: true, verified: true, deliveries });
  }

  if (eventType === 'payment.declined') {
    run("UPDATE orders SET status = 'failed', note = ? WHERE id = ? AND status = 'pending'", 'Payment declined by Tebex.', order.id);
    logEvent(`Order ${order.reference}: payment declined.`);
    return res.json({ ok: true });
  }

  if (eventType === 'payment.refunded' || eventType === 'payment.chargeback') {
    run("UPDATE orders SET status = 'refunded', note = ? WHERE id = ?", `Tebex event: ${eventType}`, order.id);
    logEvent(`Order ${order.reference}: ${eventType}.`);
    return res.json({ ok: true });
  }

  logEvent(`Order ${order.reference}: event "${eventType}" acknowledged, no action taken.`);
  return res.json({ ok: true, handled: false });
});
