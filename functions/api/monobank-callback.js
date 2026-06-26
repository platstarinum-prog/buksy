import { esc, rateLimit, parseBody, pemToArrayBuffer, base64ToUint8Array, jsonResponse, errorResponse } from '../_lib/utils.js';
import { markOrderPaidWithStock, getOrderByRef } from '../_lib/supabase.js';
import { sendEmail, paymentConfirmedHtml } from '../_lib/email.js';
import { RATE_LIMIT, PAYMENT, PUBKEY_CACHE_TTL } from '../_lib/constants.js';
import { OrderNotFoundError, StockInsufficientError, AmountMismatchError, SignatureError } from '../_lib/errors.js';

let cache = { key: null, ts: 0, raw: null };

async function getPubKey(env) {
  if (cache.key && Date.now() - cache.ts < PUBKEY_CACHE_TTL) return cache;
  const TOKEN = env.MONOBANK_TOKEN;
  if (!TOKEN) return null;
  try {
    const res = await fetch('https://api.monobank.ua/api/merchant/pubkey', { headers: { 'X-Token': TOKEN } });
    if (!res.ok) return cache.key ? cache : null;
    const data = await res.json();
    cache = { key: data.key, raw: data.key, ts: Date.now() };
    return cache;
  } catch { return cache.key ? cache : null; }
}

async function verifySignature(rawBody, xSign, pubKeyCache) {
  if (!xSign || !pubKeyCache || !pubKeyCache.raw) return false;
  try {
    const keyData = pemToArrayBuffer(pubKeyCache.raw);
    const key = await crypto.subtle.importKey('spki', keyData, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const sig = base64ToUint8Array(xSign);
    const data = new TextEncoder().encode(rawBody);
    return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sig, data);
  } catch { return false; }
}

function buildStockItems(basketOrder) {
  if (!basketOrder || !Array.isArray(basketOrder) || !basketOrder.length) return [];
  return basketOrder.map(b => {
    const catStock = PAYMENT.DEFAULT_STOCK;
    return { slug: b.code, qty: Number(b.qty) || 0, default_stock: catStock };
  }).filter(i => i.slug && i.qty > 0);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method Not Allowed' });

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!rateLimit(ip, RATE_LIMIT.WEBHOOK)) return jsonResponse(429, { error: 'Too many requests' });

  const rawBody = await request.text();
  const xSign = request.headers.get('x-sign') || '';

  const pubKeyCache = await getPubKey(env);
  if (!pubKeyCache || !pubKeyCache.key) return jsonResponse(500, { error: 'Signature verification unavailable' });
  if (!xSign || !(await verifySignature(rawBody, xSign, pubKeyCache))) return jsonResponse(403, { error: 'Invalid signature' });

  let body;
  try { body = JSON.parse(rawBody); } catch { return errorResponse(400, 'Invalid JSON'); }

  try {
    if (!body.invoiceId || !body.status || !body.reference) return errorResponse(400, 'Invalid payload');
    if (body.status !== 'success') return jsonResponse(200, { ok: true });

    const amountPaid = Number(body.amount || body.finalAmount || 0) / 100;
    const itemsForStock = buildStockItems(body.basketOrder);

    const order = await getOrderByRef(env, body.reference);
    const orderTotal = Number(order.total) || 0;

    const wasPaid = await markOrderPaidWithStock(env, body.reference, body.invoiceId, amountPaid, orderTotal, itemsForStock);

    if (!wasPaid) return jsonResponse(200, { ok: true });

    // Notifications only on first success
    const tgToken = env.TELEGRAM_BOT_TOKEN, tgChat = env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      const tgMsg = `✅ <b>ОПЛАЧЕНО (Monobank)</b>\n<code>#${esc(body.reference)}</code>\n\n💳 ${esc(body.invoiceId)}\n💰 <b>${amountPaid.toFixed(2)} UAH</b>\n\n📋 Сума замовлення: ${orderTotal.toFixed(2)} UAH\n\n━━━━━━━━━━━━━━━━\n✅ Оплата підтверджена`;
      fetch('https://api.telegram.org/bot' + tgToken + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: tgChat, text: tgMsg, parse_mode: 'HTML' }) }).catch(() => {});
    }
    if (order.customer?.email) {
      sendEmail(env, { to: order.customer.email, subject: 'Оплату підтверджено — Замовлення #' + body.reference, html: paymentConfirmedHtml({ orderId: body.reference, amount: amountPaid, currency: 'UAH', paymentId: body.invoiceId, items: (body.basketOrder || []).map(b => ({ qty: b.qty, name: b.name, size: '' })) }) }).catch(() => {});
    }

    return jsonResponse(200, { ok: true });
  } catch (err) {
    if (err instanceof OrderNotFoundError) return errorResponse(404, 'Order not found');
    if (err instanceof AmountMismatchError) return errorResponse(400, 'Amount mismatch');
    if (err instanceof StockInsufficientError) return errorResponse(409, 'Insufficient stock');
    console.error('monobank-callback:', err);
    return errorResponse(500, 'Internal server error');
  }
}
