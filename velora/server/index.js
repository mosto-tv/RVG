import express from 'express';
import cookieParser from 'cookie-parser';
import { attachUser } from './lib/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { authRouter } from './routes/auth.js';
import { formsRouter } from './routes/forms.js';
import { storeRouter } from './routes/store.js';
import { playerRouter } from './routes/player.js';
import { adminRouter } from './routes/admin.js';
import { tebexWebhookRouter } from './routes/tebexWebhook.js';
import { tebexStatus } from './lib/tebex.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.disable('x-powered-by');
app.set('trust proxy', true);

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Order-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// The Tebex webhook needs the raw body for HMAC verification.
app.use(tebexWebhookRouter);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'velora-api', tebex: tebexStatus(), time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api', catalogRouter);
app.use('/api', formsRouter);
app.use('/api/store', storeRouter);
app.use('/api/player', playerRouter);
app.use('/api/admin', adminRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'نقطه پایانی پیدا نشد.', code: 'NOT_FOUND' });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('[api]', err);
  res.status(status).json({
    error: status >= 500 ? 'Something went wrong on our side.' : err.message,
    code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR'),
    fields: err.fields,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[velora-api] listening on 0.0.0.0:${PORT}`);
});
