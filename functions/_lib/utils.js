import { ValidationError, RateLimitError } from './errors.js';
import { RATE_LIMIT, FIELD_LIMITS, ORDER_LIMITS } from './constants.js';

// ============================================================================
// HTML Escape
// ============================================================================
export function esc(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================================
// Sanitization
// ============================================================================
export function sanitize(s, maxLen) {
  if (typeof s !== 'string') return '';
  let cleaned = s.replace(/[<>"']/g, '');
  if (maxLen && maxLen > 0) cleaned = cleaned.slice(0, maxLen);
  return cleaned.trim();
}

export function sanitizeShippingInfo(info) {
  if (!info || typeof info !== 'object') return {};
  return {
    firstName: sanitize(String(info.firstName || ''), FIELD_LIMITS.NAME),
    lastName: sanitize(String(info.lastName || ''), FIELD_LIMITS.NAME),
    email: sanitize(String(info.email || ''), FIELD_LIMITS.EMAIL),
    phone: sanitize(String(info.phone || ''), FIELD_LIMITS.PHONE),
    address: sanitize(String(info.address || ''), FIELD_LIMITS.ADDRESS),
    apartment: sanitize(String(info.apartment || ''), FIELD_LIMITS.APARTMENT),
    city: sanitize(String(info.city || ''), FIELD_LIMITS.CITY),
    country: sanitize(String(info.country || ''), FIELD_LIMITS.COUNTRY),
    postalCode: sanitize(String(info.postalCode || ''), FIELD_LIMITS.POSTAL_CODE),
    novaPoshtaBranch: sanitize(String(info.novaPoshtaBranch || ''), FIELD_LIMITS.NOVA_POSHTA_BRANCH),
  };
}

// ============================================================================
// Validation
// ============================================================================
export function validateOrderId(orderId) {
  if (typeof orderId !== 'string' || !/^BUK-[A-F0-9]{8}-[A-F0-9]{6}$/.test(orderId)) {
    throw new ValidationError('Invalid order_id: ' + orderId, 'orderId');
  }
}
export function validatePaymentId(id, field) {
  if (!id || typeof id !== 'string' || id.length > FIELD_LIMITS.PAYMENT_ID) {
    throw new ValidationError('Invalid ' + (field || 'payment_id'), field || 'paymentId');
  }
}
export function validateAmount(amount, field) {
  const n = Number(amount);
  if (isNaN(n) || n <= 0) throw new ValidationError('Invalid amount: ' + amount, field || 'amount');
  return n;
}
export function validateItems(items) {
  if (!items || !Array.isArray(items) || !items.length) throw new ValidationError('Cart is empty', 'items');
  if (items.length > ORDER_LIMITS.MAX_ITEMS) throw new ValidationError('Too many items', 'items');
  for (let i = 0; i < items.length; i++) {
    const item = items[i], slug = item.product?.slug;
    if (!slug || typeof slug !== 'string') throw new ValidationError('Missing slug at ' + i, 'items');
    const qty = Number(item.quantity);
    if (isNaN(qty) || qty < ORDER_LIMITS.MIN_QUANTITY || qty > ORDER_LIMITS.MAX_QUANTITY) {
      throw new ValidationError('Invalid qty for ' + slug, 'items[' + i + '].quantity');
    }
  }
}
export function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function validateIdempotencyKey(key) {
  if (key && (typeof key !== 'string' || key.length > FIELD_LIMITS.IDEMPOTENCY_KEY)) {
    throw new ValidationError('Invalid idempotency key', 'idempotencyKey');
  }
}
export function validatePaymentMethod(method) {
  if (!method || typeof method !== 'string') return 'card';
  if (!['monobank', 'card'].includes(method)) throw new ValidationError('Invalid payment method: ' + method, 'paymentMethod');
  return method;
}

// ============================================================================
// Body Parsing
// ============================================================================
export async function parseBody(request, maxBytes) {
  if (!maxBytes) maxBytes = ORDER_LIMITS.MAX_BODY_SIZE;
  const text = await request.text();
  if (text.length > maxBytes) return { error: 'Request body too large' };
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null) return { error: 'Invalid JSON body' };
    return { data: parsed };
  } catch { return { error: 'Malformed JSON' }; }
}

// ============================================================================
// Generate Order ID (WebCrypto)
// ============================================================================
export function generateOrderId() {
  const bytes1 = crypto.getRandomValues(new Uint8Array(4));
  const bytes2 = crypto.getRandomValues(new Uint8Array(3));
  const hex = b => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'BUK-' + hex(bytes1) + '-' + hex(bytes2);
}

// ============================================================================
// Rate Limiter (in-memory per-isolate)
// ============================================================================
const rateMap = new Map();
let lastCleanup = Date.now();
function cleanupRateMap() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  for (const [ip, entry] of rateMap) if (now - entry.ts > 120000) rateMap.delete(ip);
}
export function rateLimit(ip, maxPerMin) {
  if (!maxPerMin) maxPerMin = RATE_LIMIT.CHECKOUT;
  cleanupRateMap();
  const now = Date.now(), entry = rateMap.get(ip);
  if (!entry || now - entry.ts > 60000) { rateMap.set(ip, { count: 1, ts: now }); return true; }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  return true;
}

// ============================================================================
// Origin Check (CSRF)
// ============================================================================
export function isSameOrigin(request, env) {
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  const url = new URL(request.url);
  if (!origin) return false;
  try {
    return new URL(origin).host === host || new URL(origin).host === url.hostname;
  } catch { return false; }
}

// ============================================================================
// Guard (rate-limit + origin + API key)
// ============================================================================
export function guard(request, env, maxPerMin) {
  if (!maxPerMin) maxPerMin = RATE_LIMIT.CHECKOUT;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!rateLimit(ip, maxPerMin)) return jsonResponse(429, { error: 'Too many requests' });

  if (!isSameOrigin(request, env)) {
    const apiKeyProvided = request.headers.get('x-api-key') || '';
    const expectedKey = env.API_SECRET || '';
    if (!expectedKey || !apiKeyProvided || apiKeyProvided !== expectedKey) {
      return jsonResponse(403, { error: 'Forbidden' });
    }
  }
  return null;
}

// ============================================================================
// Response Helpers
// ============================================================================
export function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function okResponse(data) { return jsonResponse(200, data); }
export function errorResponse(status, message) { return jsonResponse(status, { error: message }); }

// ============================================================================
// WebCrypto: PEM to ArrayBuffer (for ECDSA public keys)
// ============================================================================
export function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----.*-----/g, '').replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
