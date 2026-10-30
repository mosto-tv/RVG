import express from 'express';
import { all, one, run } from '../db.js';
import { requireAuth, publicUser } from '../lib/auth.js';
import { orderSummary } from '../lib/delivery.js';
import { clean, ValidationError } from '../lib/validate.js';

export const playerRouter = express.Router();

export const playerSummary = (userId) => {
  const user = one('SELECT * FROM users WHERE id = ?', userId);
  const orders = all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', userId).map(orderSummary);
  const deliveredItems = all(
    `SELECT d.*, o.reference, o.paid_at FROM deliveries d
     JOIN orders o ON o.id = d.order_id
     WHERE o.user_id = ? ORDER BY d.created_at DESC`,
    userId,
  );
  const memberships = deliveredItems.filter((row) =>
    /membership|vip|premium|concierge|patron/i.test(row.product_name),
  );
  const support = all('SELECT * FROM support_requests WHERE user_id = ? ORDER BY created_at DESC', userId);
  return {
    user: publicUser(user),
    orders,
    deliveredItems,
    memberships,
    support,
    totals: {
      orders: orders.length,
      paid: orders.filter((order) => order.status === 'paid').length,
      spentCents: orders.filter((order) => order.status === 'paid').reduce((sum, o) => sum + o.totalCents, 0),
      pendingDeliveries: deliveredItems.filter((row) => row.status !== 'delivered').length,
    },
  };
};

playerRouter.get('/summary', requireAuth, (req, res) => {
  res.json(playerSummary(req.user.id));
});

playerRouter.post('/support', requireAuth, (req, res, next) => {
  try {
    const subject = clean(req.body?.subject, 140);
    const message = clean(req.body?.message, 2000);
    const orderReference = clean(req.body?.orderReference, 40);
    const fields = {};
    if (subject.length < 3) fields.subject = 'Add a short subject.';
    if (message.length < 12) fields.message = 'Describe the issue in a little more detail.';
    if (Object.keys(fields).length) throw new ValidationError(fields);

    run(
      `INSERT INTO support_requests (user_id, email, order_reference, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      req.user.id,
      req.user.email,
      orderReference || null,
      subject,
      message,
    );
    res.status(201).json({ ok: true, message: 'Support request received. The RIA team replies within 24 hours.' });
  } catch (err) {
    next(err);
  }
});
