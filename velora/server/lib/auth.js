import crypto from 'node:crypto';
import { one, run } from '../db.js';

const SESSION_DAYS = 30;

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, stored) => {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== candidate.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
};

export const createSession = (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', token, userId, expires);
  return token;
};

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_DAYS * 864e5,
};

export const destroySession = (token) => {
  if (token) run('DELETE FROM sessions WHERE token = ?', token);
};

export const publicUser = (user) =>
  user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        fivemId: user.fivem_id,
        role: user.role,
        createdAt: user.created_at,
      }
    : null;

/** Attaches req.user when a valid session cookie is present. */
export const attachUser = (req, _res, next) => {
  const token = req.cookies?.velora_session;
  if (!token) return next();
  const row = one(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`,
    token,
  );
  if (row) req.user = row;
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sign in to continue.', code: 'UNAUTHENTICATED' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Sign in to continue.', code: 'UNAUTHENTICATED' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.', code: 'FORBIDDEN' });
  }
  next();
};
