const crypto = require('crypto');

const TOKEN_LIFETIME_MS = 1000 * 60 * 60 * 8; // 8 hours

function sign(data) {
  return crypto.createHmac('sha256', process.env.ADMIN_SECRET).update(data).digest('base64url');
}

function makeToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_LIFETIME_MS })).toString('base64url');
  return payload + '.' + sign(payload);
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return false;
  try {
    const [payload, sig] = token.split('.');
    if (sig !== sign(payload)) return false;
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch (e) {
    // Any failure here (including a missing ADMIN_SECRET env var) means "not authorized",
    // not a server crash — this keeps admin-gated routes failing safely.
    return false;
  }
}

function requireAdmin(req) {
  const header = req.headers['authorization'] || '';
  const token = header.replace(/^Bearer\s+/i, '');
  return verifyToken(token);
}

module.exports = { makeToken, verifyToken, requireAdmin };
