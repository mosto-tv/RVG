import express from 'express';
import { all, one, run } from '../db.js';
import { requireAuth } from '../lib/auth.js';
import { clean, isEmail, ValidationError } from '../lib/validate.js';

export const formsRouter = express.Router();

formsRouter.post('/bookings', (req, res, next) => {
  try {
    const fields = {};
    const name = clean(req.body?.name, 80);
    const email = clean(req.body?.email, 160).toLowerCase();
    const phone = clean(req.body?.phone, 40);
    const propertyId = clean(req.body?.propertyId, 90);
    const propertyTitle = clean(req.body?.propertyTitle, 140);
    const date = clean(req.body?.date, 20);
    const time = clean(req.body?.time, 20);
    const message = clean(req.body?.message, 1200);

    if (name.length < 2) fields.name = 'Please enter your full name.';
    if (!isEmail(email)) fields.email = 'Enter a valid email address.';
    if (phone.replace(/\D/g, '').length < 7) fields.phone = 'Enter a reachable phone number.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fields.date = 'Choose a preferred date.';
    if (!time) fields.time = 'Choose a preferred time.';
    if (Object.keys(fields).length) throw new ValidationError(fields);

    const chosen = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime()) || chosen < today) {
      throw new ValidationError({ date: 'Choose a date from today onward.' });
    }

    const result = run(
      `INSERT INTO bookings (property_id, property_title, name, email, phone, preferred_date, preferred_time, message, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      propertyId || null,
      propertyTitle || null,
      name,
      email,
      phone,
      date,
      time,
      message || null,
      req.user?.id ?? null,
    );

    res.status(201).json({
      ok: true,
      reference: `APP-${String(result.lastInsertRowid).padStart(5, '0')}`,
      message: 'Your application has been received. Our staff team will confirm within one business day.',
    });
  } catch (err) {
    next(err);
  }
});

formsRouter.post('/contact', (req, res, next) => {
  try {
    const fields = {};
    const name = clean(req.body?.name, 80);
    const email = clean(req.body?.email, 160).toLowerCase();
    const phone = clean(req.body?.phone, 40);
    const subject = clean(req.body?.subject, 140);
    const message = clean(req.body?.message, 2000);

    if (name.length < 2) fields.name = 'Please enter your name.';
    if (!isEmail(email)) fields.email = 'Enter a valid email address.';
    if (message.length < 12) fields.message = 'Tell us a little more (12 characters minimum).';
    if (Object.keys(fields).length) throw new ValidationError(fields);

    run(
      'INSERT INTO messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      name,
      email,
      phone || null,
      subject || null,
      message,
    );
    res.status(201).json({ ok: true, message: 'Thank you \u2014 your message has reached our staff team.' });
  } catch (err) {
    next(err);
  }
});

formsRouter.post('/newsletter', (req, res, next) => {
  try {
    const email = clean(req.body?.email, 160).toLowerCase();
    if (!isEmail(email)) throw new ValidationError({ email: 'Enter a valid email address.' });
    const existing = one('SELECT email FROM newsletter WHERE email = ?', email);
    if (existing) {
      return res.json({ ok: true, alreadySubscribed: true, message: 'You are already on the list.' });
    }
    run('INSERT INTO newsletter (email) VALUES (?)', email);
    res.status(201).json({ ok: true, message: 'You are on the list. Server news arrives monthly.' });
  } catch (err) {
    next(err);
  }
});

formsRouter.get('/newsletter/count', (_req, res) => {
  res.json({ count: one('SELECT COUNT(*) AS count FROM newsletter').count });
});

formsRouter.get('/favorites', requireAuth, (req, res) => {
  const rows = all('SELECT property_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC', req.user.id);
  res.json({ ids: rows.map((row) => row.property_id) });
});

formsRouter.post('/favorites', requireAuth, (req, res, next) => {
  try {
    const propertyId = clean(req.body?.propertyId, 90);
    if (!propertyId) throw new ValidationError({ propertyId: 'Missing property.' });
    run('INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)', req.user.id, propertyId);
    const ids = all('SELECT property_id FROM favorites WHERE user_id = ?', req.user.id).map((r) => r.property_id);
    res.status(201).json({ ids });
  } catch (err) {
    next(err);
  }
});

formsRouter.delete('/favorites/:propertyId', requireAuth, (req, res) => {
  run('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', req.user.id, req.params.propertyId);
  const ids = all('SELECT property_id FROM favorites WHERE user_id = ?', req.user.id).map((r) => r.property_id);
  res.json({ ids });
});
