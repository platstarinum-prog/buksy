const { esc, sanitize } = require('./_utils');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const smtpUser = process.env.EMAIL_SMTP_USER;
  const smtpPass = process.env.EMAIL_SMTP_PASS;
  if (smtpUser && smtpPass) {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  if (!to || typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.error('[EMAIL] Invalid recipient email');
    return false;
  }
  const from = process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER || 'orders@buksy.studio';

  const smtp = getTransporter();
  if (smtp) {
    try {
      const info = await smtp.sendMail({ from, to, subject, html });
      console.log('[SMTP] Sent "' + subject + '" to ' + to + ' (' + info.messageId + ')');
      return true;
    } catch (err) {
      console.error('[SMTP] Error:', err.message);
      return false;
    }
  }

  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  const apiKey = process.env.EMAIL_API_KEY;
  if (!webhookUrl) {
    console.log('[EMAIL] Not configured — skipped');
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {}),
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error('[EMAIL] Failed: ' + res.status);
      return false;
    }
    console.log('[EMAIL] Sent "' + subject + '" to ' + to);
    return true;
  } catch (err) {
    console.error('[EMAIL] Error:', err.message);
    return false;
  }
}

function orderConfirmationHtml({ orderId, items, total, shippingInfo, trackingNumber }) {
  var safeOrderId = esc(String(orderId));
  var safeTracking = esc(String(trackingNumber || ''));
  var itemsRows = items.map(function (i) {
    var name = esc(sanitize(i.product ? i.product.name : i.name || '', 256));
    var size = esc(sanitize(i.size || '', 64));
    var price = i.product ? i.product.price : i.price || 0;
    var qty = i.quantity || i.qty || 1;
    var lineTotal = (price * qty).toFixed(0);
    return '<tr>' +
      '<td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;vertical-align:top">' +
        '<div style="font-size:14px;font-weight:600">' + name + '</div>' +
        (size ? '<div style="font-size:12px;color:#888;margin-top:2px">Розмір: ' + size + '</div>' : '') +
        '<div style="font-size:12px;color:#666;margin-top:2px">' + qty + ' шт</div>' +
      '</td>' +
      '<td style="padding:10px 8px;border-bottom:1px solid #2a2a2a;text-align:right;vertical-align:top;font-size:14px;font-weight:600;white-space:nowrap">' + lineTotal + ' ₴</td>' +
    '</tr>';
  }).join('');

  var branchLine = '';
  if (shippingInfo && shippingInfo.novaPoshtaBranch) {
    branchLine = '<tr><td style="padding:4px 0;color:#999;font-size:13px">Відділення НП</td><td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600">№' + esc(sanitize(String(shippingInfo.novaPoshtaBranch), 32)) + '</td></tr>';
  }

  var firstName = esc(sanitize(String(shippingInfo && shippingInfo.firstName || ''), 128));
  var lastName = esc(sanitize(String(shippingInfo && shippingInfo.lastName || ''), 128));
  var address = esc(sanitize(String(shippingInfo && shippingInfo.address || ''), 256));
  var apartment = shippingInfo && shippingInfo.apartment ? ', ' + esc(sanitize(String(shippingInfo.apartment), 64)) : '';
  var city = esc(sanitize(String(shippingInfo && shippingInfo.city || ''), 128));
  var country = esc(sanitize(String(shippingInfo && shippingInfo.country || ''), 128));
  var postalCode = esc(sanitize(String(shippingInfo && shippingInfo.postalCode || ''), 32));

  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>\n' +
    '<body style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Arial,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:20px;margin:0">\n' +
    '  <div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #222;padding:40px 32px">\n' +
    '\n    <table style="width:100%;margin:0 0 32px"><tr>\n' +
    '      <td><h1 style="color:#e53935;font-size:28px;margin:0;letter-spacing:4px;font-weight:900">BUKSY</h1></td>\n' +
    '      <td style="text-align:right"><span style="display:inline-block;background:#e53935;color:#fff;padding:4px 10px;font-size:11px;font-weight:700;letter-spacing:1px">НОВЕ</span></td>\n' +
    '</tr></table>\n' +
    '\n    <h2 style="font-size:16px;margin:0 0 6px;font-weight:700;color:#fff">Замовлення отримано</h2>\n' +
    '    <p style="color:#e53935;font-size:14px;margin:0 0 24px;font-family:monospace">#' + safeOrderId + '</p>\n' +
    '\n    <div style="background:#1a1a1a;padding:16px;margin:0 0 24px">\n' +
    '      <table style="width:100%;border-collapse:collapse">\n' +
    '        <thead><tr>\n' +
    '          <th style="text-align:left;padding:0 8px 8px;font-size:11px;color:#666;font-weight:600;letter-spacing:1px;text-transform:uppercase">Товар</th>\n' +
    '          <th style="text-align:right;padding:0 8px 8px;font-size:11px;color:#666;font-weight:600;letter-spacing:1px;text-transform:uppercase">Сума</th>\n' +
    '        </tr></thead>\n' +
    '        <tbody>' + itemsRows + '</tbody>\n' +
    '      </table>\n' +
    '      <table style="width:100%;margin-top:16px;padding-top:16px;border-top:2px solid #2a2a2a">\n' +
    '        <tr><td style="padding:4px 0;color:#999;font-size:13px">Доставка</td><td style="padding:4px 0;text-align:right;font-size:13px;font-weight:600;color:#4caf50">БЕЗКОШТОВНО</td></tr>\n' +
    '        <tr><td style="padding:4px 0;color:#fff;font-size:15px;font-weight:700">Разом</td><td style="padding:4px 0;text-align:right;font-size:18px;font-weight:700;color:#fff">' + total.toFixed(0) + ' ₴</td></tr>\n' +
    '      </table>\n' +
    '    </div>\n' +
    '\n    <table style="width:100%;margin:0 0 24px">\n' +
    '      <tr><td colspan="2" style="padding:4px 0 8px;font-size:11px;color:#666;letter-spacing:1px;text-transform:uppercase">Отримувач</td></tr>\n' +
    '      <tr><td style="padding:2px 0;font-size:14px;color:#ccc">' + firstName + ' ' + lastName + '</td></tr>\n' +
    '      <tr><td style="padding:2px 0;font-size:13px;color:#888">' + address + apartment + '</td></tr>\n' +
    '      <tr><td style="padding:2px 0;font-size:13px;color:#888">' + city + ', ' + country + ', ' + postalCode + '</td></tr>\n' +
    '      ' + branchLine + '\n' +
    '    </table>\n' +
    '\n    <div style="padding:12px 16px;border-left:3px solid #e53935;background:#1a1a1a;margin:0 0 24px">\n' +
    '      <p style="margin:0;font-size:13px;color:#e53935"><strong>Статус:</strong> Очікує оплати (Monobank)</p>\n' +
    '      <p style="margin:4px 0 0;font-size:12px;color:#888">Ми повідомимо вас після підтвердження оплати.</p>\n' +
    '    </div>\n' +
    '\n    ' + (safeTracking ? '<div style="padding:12px 16px;border-left:3px solid #e53935;background:#1a1a1a;margin:0 0 24px"><p style="margin:0;font-size:13px;color:#fff"><strong>ТТН Нова Пошта:</strong> ' + safeTracking + '</p></div>' : '') + '\n' +
    '\n    <hr style="border:none;border-top:1px solid #222;margin:24px 0 16px">\n' +
    '    <p style="margin:0;font-size:11px;color:#555;text-align:center">BUKSY \u2014 Dark Luxury Streetwear<br>buksy.shop\u0040gmail.com</p>\n' +
    '  </div>\n</body></html>';
}

function paymentConfirmedHtml({ orderId, amount, currency, paymentId, items }) {
  var safeOrderId = esc(String(orderId));
  var safePaymentId = esc(sanitize(String(paymentId || ''), 128));
  var safeCurrency = esc(sanitize(String(currency || 'UAH'), 8));
  var itemsHtml = '';
  if (items && Array.isArray(items)) {
    itemsHtml = '<table style="width:100%;border-collapse:collapse;margin:20px 0">' +
      items.map(function (i) {
        var itemName = esc(sanitize(i.name || '', 256));
        var itemSize = esc(sanitize(i.size || '-', 64));
        return '<tr><td style="padding:8px;border-bottom:1px solid #333">' +
          String(i.qty || 0) + '\u00d7 ' + itemName + ' (' + itemSize + ')</td></tr>';
      }).join('') + '</table>';
  }

  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:20px">\n  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px">\n    <h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1>\n    <h2 style="font-size:18px;margin:0 0 10px">\u041e\u043f\u043b\u0430\u0442\u0430 \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u0430 \u2705</h2>\n    <p style="color:#999;margin:0 0 20px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f <strong style="color:#b10006">#' + safeOrderId + '</strong> \u043e\u043f\u043b\u0430\u0447\u0435\u043d\u043e.</p>\n    <p style="font-size:18px;margin:0 0 20px"><strong>' + Number(amount).toFixed(2) + ' ' + safeCurrency + '</strong></p>\n    ' + (safePaymentId ? '<p style="color:#999;font-size:12px">\u041f\u043b\u0430\u0442\u0456\u0436: ' + safePaymentId + '</p>' : '') + '\n    ' + itemsHtml + '\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#999;font-size:14px">\u041c\u0438 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u0438\u043c\u043e \u0432\u0430\u0441, \u043a\u043e\u043b\u0438 \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u0431\u0443\u0434\u0435 \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e.</p>\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#666;font-size:12px">BUKSY \u2014 Dark Luxury Streetwear<br>buksy.shop\u0040gmail.com</p>\n  </div>\n</body></html>';
}

function trackingUpdateHtml({ orderId, trackingNumber }) {
  var safeOrderId = esc(String(orderId));
  var safeTracking = esc(sanitize(String(trackingNumber), 64));
  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:20px">\n  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px">\n    <h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1>\n    <h2 style="font-size:18px;margin:0 0 10px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \ud83d\udce6</h2>\n    <p style="color:#999;margin:0 0 20px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f <strong style="color:#b10006">#' + safeOrderId + '</strong> \u0432 \u0434\u043e\u0440\u043e\u0437\u0456.</p>\n    <p style="font-size:16px;margin:0 0 20px">\u0422\u0422\u041d \u041d\u043e\u0432\u0430 \u041f\u043e\u0448\u0442\u0430: <strong style="color:#b10006;font-size:20px">' + safeTracking + '</strong></p>\n    <p style="color:#999;font-size:14px">\u0412\u0456\u0434\u0441\u0442\u0435\u0436\u0438\u0442\u0438 \u043c\u043e\u0436\u043d\u0430 \u043d\u0430 <a href="https://novaposhta.ua" style="color:#b10006">novaposhta.ua</a></p>\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#666;font-size:12px">BUKSY \u2014 Dark Luxury Streetwear<br>buksy.shop\u0040gmail.com</p>\n  </div>\n</body></html>';
}

module.exports = { sendEmail, orderConfirmationHtml, paymentConfirmedHtml, trackingUpdateHtml };
