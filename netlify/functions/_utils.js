var crypto = require('crypto');

function esc(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitize(s, maxLen) {
  if (typeof s !== 'string') return '';
  var cleaned = s.replace(/[<>"']/g, '');
  if (maxLen && maxLen > 0) cleaned = cleaned.slice(0, maxLen);
  return cleaned.trim();
}

function parseBody(event, maxBytes) {
  if (!maxBytes) maxBytes = 65536;
  var body = event.body || '';
  if (Buffer.byteLength(body, 'utf8') > maxBytes) {
    return { error: 'Request body too large' };
  }
  try {
    var parsed = JSON.parse(body);
    if (typeof parsed !== 'object' || parsed === null) {
      return { error: 'Invalid JSON body' };
    }
    return { data: parsed };
  } catch (e) {
    return { error: 'Malformed JSON' };
  }
}

function generateOrderId() {
  return 'BUK-' + crypto.randomBytes(4).toString('hex').toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// NOTE: In-memory rate limiter resets per Netlify function instance.
// This provides basic protection against single-instance floods.
// For cross-instance rate limiting, Netlify's built-in rate limiting
// or a Redis-backed solution (Upstash) should be configured in production.
var rateMap = new Map();
var lastCleanup = Date.now();

function cleanupRateMap() {
  var now = Date.now();
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  rateMap.forEach(function (entry, ip) {
    if (now - entry.ts > 120000) rateMap.delete(ip);
  });
}

function rateLimit(ip, maxPerMin) {
  if (!maxPerMin) maxPerMin = 10;
  cleanupRateMap();
  var now = Date.now();
  var entry = rateMap.get(ip);
  if (!entry || now - entry.ts > 60000) {
    rateMap.set(ip, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  return true;
}

function isSameOrigin(event) {
  var origin = event.headers.origin || event.headers.referer || '';
  var host = event.headers.host || '';

  if (!origin) {
    if (process.env.NETLIFY_DEV === 'true') return true;
    return false;
  }

  if (process.env.NETLIFY_DEV === 'true') {
    try {
      var originHost = new URL(origin).hostname || new URL(origin).host;
      return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(originHost);
    } catch (e) { return false; }
  }

  try {
    var originHost = new URL(origin).host;
    return originHost === host;
  } catch (e) { return false; }
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function guard(event, maxPerMin) {
  if (!maxPerMin) maxPerMin = 10;
  var ip = event.headers['client-ip'] || 'unknown';
  if (!rateLimit(ip, maxPerMin)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
  }
  if (!isSameOrigin(event)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
  }
  return null;
}

module.exports = { esc, sanitize, parseBody, generateOrderId, rateLimit, isSameOrigin, validateEmail, guard };
