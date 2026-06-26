import { guard, esc, sanitizeShippingInfo, validateItems, validateEmail, validateIdempotencyKey, parseBody, generateOrderId, okResponse, errorResponse } from '../_lib/utils.js';
import { saveOrder, decreaseStockBulk } from '../_lib/supabase.js';
import { validateCatalogItems } from '../_lib/catalog.js';
import { sendEmail, orderConfirmationHtml } from '../_lib/email.js';
import { RATE_LIMIT, FIELD_LIMITS, ORDER_LIMITS, PAYMENT, ORDER_STATUS, PAYMENT_METHOD } from '../_lib/constants.js';
import { DuplicateOrderError } from '../_lib/errors.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return errorResponse(405, 'Method Not Allowed');

  const blocked = guard(request, env, RATE_LIMIT.CHECKOUT);
  if (blocked) return blocked;

  let parsed = await parseBody(request, ORDER_LIMITS.MAX_BODY_SIZE);
  if (parsed.error) return errorResponse(400, parsed.error);
  const body = parsed.data;

  try {
    const { items, shippingInfo, idempotencyKey } = body;
    const pm = PAYMENT_METHOD.CARD;

    if (body.paymentMethod === PAYMENT_METHOD.MONOBANK) {
      return errorResponse(400, 'Use /api/monobank-checkout for Monobank payments');
    }

    validateItems(items);
    if (!shippingInfo || typeof shippingInfo !== 'object') return errorResponse(400, 'Shipping info required');
    validateIdempotencyKey(idempotencyKey);

    const shipping = sanitizeShippingInfo(shippingInfo);
    const safeEmail = (typeof shippingInfo.email === 'string' ? shippingInfo.email : '').replace(/[<>"']/g, '').slice(0, FIELD_LIMITS.EMAIL).trim();
    if (!safeEmail || !validateEmail(safeEmail)) return errorResponse(400, 'Valid email required');

    const safeItems = await validateCatalogItems(env, items, 'order');
    const orderId = generateOrderId();
    const total = safeItems.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);

    try {
      await saveOrder(env, {
        order_id: orderId, idempotency_key: idempotencyKey || null,
        status: ORDER_STATUS.NEW, payment_method: pm,
        customer: { firstName: shipping.firstName, lastName: shipping.lastName, email: safeEmail, phone: shipping.phone },
        shipping: { address: shipping.address, apartment: shipping.apartment, city: shipping.city, country: shipping.country, postalCode: shipping.postalCode, novaPoshtaBranch: shipping.novaPoshtaBranch },
        items: safeItems.map(i => ({ slug: i.product.slug, name: i.product.name, size: i.size, price: i.pricePerUnit, qty: i.quantity })),
        subtotal: total, shipping_cost: 0, tax: 0, total, created_at: new Date().toISOString(),
      });
    } catch (err) {
      if (err instanceof DuplicateOrderError) return errorResponse(409, 'Order already processed');
      console.error('saveOrder:', err.message);
      return errorResponse(500, 'Не вдалося створити замовлення');
    }

    try {
      await decreaseStockBulk(env, safeItems.map(i => ({ slug: i.product.slug, qty: i.quantity, default_stock: PAYMENT.DEFAULT_STOCK })));
    } catch (err) {
      console.error('Stock decrease:', err.message);
      return errorResponse(409, 'Insufficient stock');
    }

    const tgToken = env.TELEGRAM_BOT_TOKEN, tgChat = env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      const lines = safeItems.map(i => i.quantity + '× ' + esc(i.product.name) + ' (' + esc(i.size) + ') — ' + (i.pricePerUnit * i.quantity).toFixed(0) + ' ₴').join('\n');
      const tgMsg = `🛒 <b>НОВЕ ЗАМОВЛЕННЯ</b>\n<code>#${orderId}</code>\n\n👤 <b>${esc(shipping.firstName)} ${esc(shipping.lastName)}</b>\n📧 ${esc(safeEmail)}\n${shipping.phone ? '📱 ' + esc(shipping.phone) + '\n' : ''}\n📍 ${esc(shipping.address)}${shipping.apartment ? ', ' + esc(shipping.apartment) : ''}\n   ${esc(shipping.city)}, ${esc(shipping.country)}\n${shipping.novaPoshtaBranch ? '📦 НП №' + esc(shipping.novaPoshtaBranch) + '\n' : ''}\n🛍 <b>Товари:</b>\n${lines}\n\n━━━━━━━━━━━━━━━━\n💰 <b>${total.toFixed(0)} ₴</b>`;
      fetch('https://api.telegram.org/bot' + tgToken + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: tgChat, text: tgMsg, parse_mode: 'HTML' }) }).catch(() => {});
    }
    if (safeEmail) {
      sendEmail(env, { to: safeEmail, subject: 'Замовлення #' + orderId + ' підтверджено — BUKSY', html: orderConfirmationHtml({ orderId, items: safeItems, total, shippingInfo: shipping }) }).catch(() => {});
    }

    return okResponse({ success: true, orderId, total, message: 'Order placed!' });
  } catch (e) {
    if (e.statusCode) return new Response(e.body, { status: e.statusCode, headers: { 'Content-Type': 'application/json' } });
    console.error('order:', e);
    return errorResponse(500, 'Internal error');
  }
}
