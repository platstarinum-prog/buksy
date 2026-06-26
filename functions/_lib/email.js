import { esc, sanitize } from './utils.js';
import { FIELD_LIMITS } from './constants.js';

export async function sendEmail(env, { to, subject, html }) {
  if (!to || typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.error('[EMAIL] Invalid recipient');
    return false;
  }

  // Primary: try Resend API (fetch-based, works on Workers)
  const resendKey = env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const from = env.EMAIL_FROM || env.EMAIL_SMTP_USER || 'orders@buksy.studio';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + resendKey },
        body: JSON.stringify({ from, to: [to], subject, html }),
      });
      if (res.ok) { console.log('[RESEND] Sent: ' + subject); return true; }
      console.error('[RESEND] Failed: ' + res.status);
    } catch (err) { console.error('[RESEND] Error:', err.message); }
  }

  // Fallback: Generic webhook (compatible with Resend, SendGrid, etc.)
  const webhookUrl = env.EMAIL_WEBHOOK_URL;
  const apiKey = env.EMAIL_API_KEY;
  if (!webhookUrl) { console.log('[EMAIL] Not configured'); return false; }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {}) },
      body: JSON.stringify({ from: env.EMAIL_FROM || 'orders@buksy.studio', to, subject, html }),
    });
    if (!res.ok) { console.error('[EMAIL] Failed: ' + res.status); return false; }
    console.log('[EMAIL] Sent: ' + subject);
    return true;
  } catch (err) { console.error('[EMAIL] Error:', err.message); return false; }
}

export function orderConfirmationHtml({ orderId, items, total, shippingInfo, trackingNumber }) {
  const s = (v, len) => esc(sanitize(String(v || ''), len));
  const safeOrderId = esc(String(orderId));
  const safeTracking = s(trackingNumber, FIELD_LIMITS.TRACKING_NUMBER);

  const itemsRows = items.map(i => {
    const name = s(i.product ? i.product.name : i.name, FIELD_LIMITS.PRODUCT_NAME);
    const size = s(i.size, FIELD_LIMITS.PRODUCT_SIZE);
    const price = i.product ? i.product.price : i.price || 0;
    const qty = i.quantity || i.qty || 1;
    return `<tr><td style="padding:10px 8px;border-bottom:1px solid #2a2a2a"><div style="font-size:14px;font-weight:600">${name}</div>${size ? '<div style="font-size:12px;color:#888">Розмір: ' + size + '</div>' : ''}<div style="font-size:12px;color:#666">${qty} шт</div></td><td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;text-align:right;font-size:14px;font-weight:600">${(price * qty).toFixed(0)} ₴</td></tr>`;
  }).join('');

  const branchLine = shippingInfo?.novaPoshtaBranch ? `<tr><td style="padding:4px 0;color:#999">Відділення НП</td><td style="padding:4px 0;text-align:right;font-weight:600">№${s(shippingInfo.novaPoshtaBranch, FIELD_LIMITS.NOVA_POSHTA_BRANCH)}</td></tr>` : '';
  const fn = s(shippingInfo?.firstName, FIELD_LIMITS.NAME), ln = s(shippingInfo?.lastName, FIELD_LIMITS.NAME);
  const addr = s(shippingInfo?.address, FIELD_LIMITS.ADDRESS);
  const apt = shippingInfo?.apartment ? ', ' + s(shippingInfo.apartment, FIELD_LIMITS.APARTMENT) : '';
  const ct = s(shippingInfo?.city, FIELD_LIMITS.CITY), co = s(shippingInfo?.country, FIELD_LIMITS.COUNTRY), pc = s(shippingInfo?.postalCode, FIELD_LIMITS.POSTAL_CODE);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;background:#0a0a0a;color:#e5e5e5;padding:20px;margin:0"><div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #222;padding:40px 32px"><table style="width:100%;margin-bottom:32px"><tr><td><h1 style="color:#e53935;font-size:28px;margin:0;letter-spacing:4px">BUKSY</h1></td><td style="text-align:right"><span style="background:#e53935;color:#fff;padding:4px 10px;font-size:11px;font-weight:700">НОВЕ</span></td></tr></table><h2 style="font-size:16px;margin:0 0 6px;color:#fff">Замовлення отримано</h2><p style="color:#e53935;font-size:14px;margin:0 0 24px;font-family:monospace">#${safeOrderId}</p><div style="background:#1a1a1a;padding:16px;margin-bottom:24px"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:0 8px 8px;font-size:11px;color:#666">Товар</th><th style="text-align:right;padding:0 8px 8px;font-size:11px;color:#666">Сума</th></tr></thead><tbody>${itemsRows}</tbody></table><table style="width:100%;margin-top:16px;padding-top:16px;border-top:2px solid #2a2a2a"><tr><td style="color:#999;font-size:13px">Доставка</td><td style="text-align:right;color:#4caf50;font-size:13px">БЕЗКОШТОВНО</td></tr><tr><td style="color:#fff;font-size:15px;font-weight:700">Разом</td><td style="text-align:right;font-size:18px;font-weight:700;color:#fff">${total.toFixed(0)} ₴</td></tr></table></div><table style="width:100%;margin-bottom:24px"><tr><td colspan="2" style="padding-bottom:8px;font-size:11px;color:#666">Отримувач</td></tr><tr><td style="font-size:14px;color:#ccc">${fn} ${ln}</td></tr><tr><td style="font-size:13px;color:#888">${addr}${apt}</td></tr><tr><td style="font-size:13px;color:#888">${ct}, ${co}, ${pc}</td></tr>${branchLine}</table><div style="padding:12px 16px;border-left:3px solid #e53935;background:#1a1a1a;margin-bottom:24px"><p style="margin:0;font-size:13px;color:#e53935"><strong>Статус:</strong> Очікує оплати (Monobank)</p><p style="margin:4px 0 0;font-size:12px;color:#888">Ми повідомимо вас після підтвердження оплати.</p></div>${safeTracking ? '<div style="padding:12px 16px;border-left:3px solid #e53935;background:#1a1a1a;margin-bottom:24px"><p style="margin:0;color:#fff"><strong>ТТН Нова Пошта:</strong> ' + safeTracking + '</p></div>' : ''}<hr style="border:none;border-top:1px solid #222;margin:24px 0 16px"><p style="margin:0;font-size:11px;color:#555;text-align:center">BUKSY — Dark Luxury Streetwear<br>buksy.shop@gmail.com</p></div></body></html>`;
}

export function paymentConfirmedHtml({ orderId, amount, currency, paymentId, items }) {
  const s = (v, len) => esc(sanitize(String(v || ''), len));
  let itemsHtml = '';
  if (items && Array.isArray(items)) {
    itemsHtml = '<table style="width:100%;border-collapse:collapse;margin:20px 0">' + items.map(i => `<tr><td style="padding:8px;border-bottom:1px solid #333">${i.qty || 0}× ${s(i.name, 256)} (${s(i.size, 64)})</td></tr>`).join('') + '</table>';
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;background:#111;color:#eee;padding:20px"><div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px"><h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1><h2 style="font-size:18px;margin:0 0 10px">Оплата отримана ✅</h2><p style="color:#999;margin:0 0 20px">Замовлення <strong style="color:#b10006">#${esc(String(orderId))}</strong> оплачено.</p><p style="font-size:18px;margin:0 0 20px"><strong>${Number(amount).toFixed(2)} ${s(currency, 8)}</strong></p>${s(paymentId, 128) ? '<p style="color:#999;font-size:12px">Платіж: ' + s(paymentId, 128) + '</p>' : ''}${itemsHtml}<hr style="border-color:#333;margin:20px 0"><p style="color:#999;font-size:14px">Ми повідомимо вас, коли замовлення буде відправлено.</p><hr style="border-color:#333;margin:20px 0"><p style="color:#666;font-size:12px">BUKSY — Dark Luxury Streetwear<br>buksy.shop@gmail.com</p></div></body></html>`;
}

export function trackingUpdateHtml({ orderId, trackingNumber }) {
  const s = (v, len) => esc(sanitize(String(v || ''), len));
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;background:#111;color:#eee;padding:20px"><div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px"><h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1><h2 style="font-size:18px;margin:0 0 10px">Замовлення відправлено 📦</h2><p style="color:#999;margin:0 0 20px">Замовлення <strong style="color:#b10006">#${esc(String(orderId))}</strong> в дорозі.</p><p style="font-size:16px;margin:0 0 20px">ТТН Нова Пошта: <strong style="color:#b10006;font-size:20px">${s(trackingNumber, 64)}</strong></p><p style="color:#999;font-size:14px">Відстежити на <a href="https://novaposhta.ua" style="color:#b10006">novaposhta.ua</a></p><hr style="border-color:#333;margin:20px 0"><p style="color:#666;font-size:12px">BUKSY — Dark Luxury Streetwear<br>buksy.shop@gmail.com</p></div></body></html>`;
}
