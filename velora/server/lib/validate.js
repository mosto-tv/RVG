export const clean = (value, max = 800) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const isEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** FiveM identifiers are prefixed values such as license:xxxx, discord:1234. */
export const isFiveMIdentifier = (value) =>
  typeof value === 'string' && /^(license2?|steam|discord|fivem|xbl|live):[A-Za-z0-9:_-]{4,80}$/.test(value.trim());

export const toInt = (value, fallback = null) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

export const toCents = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
};

/** Collects field errors so the client can highlight each input. */
export class ValidationError extends Error {
  constructor(fields) {
    super('Please check the highlighted fields.');
    this.status = 422;
    this.code = 'VALIDATION_ERROR';
    this.fields = fields;
  }
}

export const fail = (status, code, message) => {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
};
