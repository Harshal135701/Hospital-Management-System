const crypto = require('crypto');
const { JWT_SECRET } = require('../../config/env');

/**
 * NIST SP 800-63B compliant password hashing using scrypt.
 * Uses 16-byte cryptographically secure random salt and 64-byte key length.
 */
function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Constant-time password verification using crypto.timingSafeEqual.
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = parts[1];
  const expectedKey = Buffer.from(parts[2], 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  if (expectedKey.length !== derivedKey.length) return false;
  return crypto.timingSafeEqual(expectedKey, derivedKey);
}

/**
 * Executes a dummy scrypt hash to equalize response timing (~50-80ms)
 * when a user email is not found, eliminating username enumeration via timing side-channels.
 */
function dummyHash() {
  const dummySalt = '0123456789abcdef0123456789abcdef';
  crypto.scryptSync('dummy-password-for-timing-mitigation', dummySalt, 64);
}

/**
 * Hash 6-digit clinician emergency authorization PIN using scrypt.
 */
function hashPin(pin) {
  return hashPassword(String(pin));
}

/**
 * Signs a short-lived JSON Web Token (HS256) with unique cryptographic JTI.
 * Defaults to 15-minute expiration (900 seconds).
 */
function signJwt(payload, expiresInSeconds = 900) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const jti = crypto.randomUUID();
  const body = Buffer.from(JSON.stringify({ ...payload, jti, iat, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies JWT signature in constant time and checks expiration.
 */
function verifyJwt(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing token');
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed token');
  }
  const [header, body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expSigBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = {
  hashPassword,
  verifyPassword,
  dummyHash,
  hashPin,
  signJwt,
  verifyJwt
};
