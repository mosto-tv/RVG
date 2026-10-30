import express from 'express';
import { all, one, run } from '../db.js';
import {
  createSession,
  destroySession,
  hashPassword,
  publicUser,
  requireAuth,
  sessionCookieOptions,
  verifyPassword,
} from '../lib/auth.js';
import { clean, isEmail, ValidationError } from '../lib/validate.js';

export const authRouter = express.Router();

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

authRouter.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

authRouter.post('/signup', (req, res, next) => {
  try {
    const fields = {};
    const name = clean(req.body?.name, 80);
    const email = clean(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const phone = clean(req.body?.phone, 40);

    if (name.length < 2) fields.name = 'Please enter your full name.';
    if (!isEmail(email)) fields.email = 'Enter a valid email address.';
    if (password.length < 8) fields.password = 'Use at least 8 characters.';
    if (Object.keys(fields).length) throw new ValidationError(fields);

    if (one('SELECT id FROM users WHERE email = ?', email)) {
      throw new ValidationError({ email: 'An account with this email already exists.' });
    }

    const admins = one("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'").count;
    const role = admins === 0 || adminEmails().includes(email) ? 'admin' : 'member';

    const result = run(
      'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      email,
      hashPassword(password),
      name,
      phone || null,
      role,
    );
    const userId = Number(result.lastInsertRowid);
    const token = createSession(userId);
    res.cookie('velora_session', token, sessionCookieOptions);
    res.status(201).json({ user: publicUser(one('SELECT * FROM users WHERE id = ?', userId)) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/signin', (req, res, next) => {
  try {
    const email = clean(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const fields = {};
    if (!isEmail(email)) fields.email = 'Enter a valid email address.';
    if (!password) fields.password = 'Enter your password.';
    if (Object.keys(fields).length) throw new ValidationError(fields);

    const user = one('SELECT * FROM users WHERE email = ?', email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      throw new ValidationError({ password: 'Email or password is incorrect.' });
    }
    const token = createSession(user.id);
    res.cookie('velora_session', token, sessionCookieOptions);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/signout', (req, res) => {
  destroySession(req.cookies?.velora_session);
  res.clearCookie('velora_session', { path: '/' });
  res.json({ ok: true });
});

authRouter.patch('/me', requireAuth, (req, res, next) => {
  try {
    const name = clean(req.body?.name, 80) || req.user.name;
    const phone = clean(req.body?.phone, 40);
    const fivemId = clean(req.body?.fivemId, 90);
    const fields = {};
    if (fivemId && !/^(license2?|steam|discord|fivem|xbl|live):[A-Za-z0-9:_-]{4,80}$/.test(fivemId)) {
      fields.fivemId = 'Use the identifier format license:xxxx or discord:xxxx.';
    }
    if (Object.keys(fields).length) throw new ValidationError(fields);

    run(
      'UPDATE users SET name = ?, phone = ?, fivem_id = ? WHERE id = ?',
      name,
      phone || null,
      fivemId || null,
      req.user.id,
    );
    res.json({ user: publicUser(one('SELECT * FROM users WHERE id = ?', req.user.id)) });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/sessions', requireAuth, (req, res) => {
  res.json({
    items: all(
      'SELECT token, created_at, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC',
      req.user.id,
    ).map((row) => ({ ...row, token: `${row.token.slice(0, 6)}\u2026` })),
  });
});
