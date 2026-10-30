import { all, one, run } from '../db.js';
import { dispatchDelivery } from './tebex.js';
import { isFiveMIdentifier } from './validate.js';

/**
 * Creates one delivery record per purchased line, then attempts the approved
 * hand-off to the FiveM server. A failed hand-off is never retried blindly and
 * never marked delivered: it parks as `pending` for an administrator.
 */
export const deliverOrder = async (order) => {
  const items = all('SELECT * FROM order_items WHERE order_id = ?', order.id);
  const results = [];

  for (const item of items) {
    let delivery = one('SELECT * FROM deliveries WHERE order_item_id = ?', item.id);
    if (!delivery) {
      const result = run(
        `INSERT INTO deliveries (order_id, order_item_id, product_id, product_name, player_identifier, status)
         VALUES (?, ?, ?, ?, ?, 'queued')`,
        order.id,
        item.id,
        item.product_id,
        item.name,
        order.player_identifier,
      );
      delivery = one('SELECT * FROM deliveries WHERE id = ?', Number(result.lastInsertRowid));
    }

    if (delivery.status === 'delivered') {
      results.push({ id: delivery.id, status: 'delivered', duplicate: true });
      continue;
    }

    if (!isFiveMIdentifier(order.player_identifier)) {
      run(
        `UPDATE deliveries SET status = 'pending', attempts = attempts + 1,
         last_error = ? WHERE id = ?`,
        'Player identifier failed validation; administrator review required.',
        delivery.id,
      );
      results.push({ id: delivery.id, status: 'pending', error: 'invalid identifier' });
      continue;
    }

    let outcome;
    try {
      outcome = await dispatchDelivery({
        orderReference: order.reference,
        orderItemId: item.id,
        productSlug: one('SELECT slug FROM store_products WHERE id = ?', item.product_id)?.slug,
        productName: item.name,
        playerIdentifier: order.player_identifier,
        quantity: item.quantity,
        transactionId: order.tebex_transaction_id,
      });
    } catch (err) {
      outcome = { delivered: false, error: err.message };
    }

    run(
      `UPDATE deliveries SET attempts = attempts + 1, status = ?, last_error = ?,
       delivered_at = CASE WHEN ? = 'delivered' THEN datetime('now') ELSE delivered_at END
       WHERE id = ?`,
      outcome.delivered ? 'delivered' : 'pending',
      outcome.error,
      outcome.delivered ? 'delivered' : 'pending',
      delivery.id,
    );
    results.push({ id: delivery.id, status: outcome.delivered ? 'delivered' : 'pending', error: outcome.error });
  }

  return results;
};

export const orderSummary = (order) => {
  const items = all('SELECT * FROM order_items WHERE order_id = ?', order.id);
  const deliveries = all('SELECT * FROM deliveries WHERE order_id = ?', order.id);
  return {
    reference: order.reference,
    email: order.email,
    playerIdentifier: order.player_identifier,
    totalCents: order.total_cents,
    currency: order.currency,
    status: order.status,
    provider: order.provider,
    transactionId: order.tebex_transaction_id,
    note: order.note,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      priceCents: item.price_cents,
      quantity: item.quantity,
      delivery: deliveries.find((d) => d.order_item_id === item.id)?.status || 'not_started',
      deliveredAt: deliveries.find((d) => d.order_item_id === item.id)?.delivered_at || null,
    })),
    deliveries,
  };
};
