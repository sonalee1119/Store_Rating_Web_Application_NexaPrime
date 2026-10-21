import crypto from 'node:crypto';
import { env } from '../config/env.js';

let bcryptLib = null;
let jwtLib = null;

try {
  const b = await import('bcryptjs');
  bcryptLib = b.default || b;
} catch {
  bcryptLib = null;
}

try {
  const j = await import('jsonwebtoken');
  jwtLib = j.default || j;
} catch {
  jwtLib = null;
}

/**
 * Hash a plaintext password using bcryptjs (if installed) or PBKDF2-SHA512 fallback.
 */
export async function hashPassword(password) {
  if (bcryptLib) {
    return bcryptLib.hash(password, 12);
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2$${salt}$${derived}`;
}

/**
 * Verify a plaintext password against a stored password hash.
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  if (storedHash.startsWith('pbkdf2$')) {
    const [, salt, originalHash] = storedHash.split('$');
    if (!salt || !originalHash) return false;
    const derived = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(derived, 'hex'));
  }

  if (bcryptLib && storedHash.startsWith('$2')) {
    return bcryptLib.compare(password, storedHash);
  }

  return false;
}

/**
 * Sign a JWT payload with 24h expiration.
 */
export function signToken(payload) {
  if (jwtLib) {
    return jwtLib.sign(payload, env.JWT_SECRET, { expiresIn: '1d' });
  }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 86400;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verify a JWT token and return its decoded payload.
 */
export function verifyToken(token) {
  if (jwtLib) {
    return jwtLib.verify(token, env.JWT_SECRET);
  }
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');
  const [header, body, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  if (signature !== expectedSig) throw new Error('Invalid token signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Token expired');
  }
  return payload;
}
