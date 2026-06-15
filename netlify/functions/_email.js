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
  const from = process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER || 'orders@buksy.studio';

  // Try SMTP first (Gmail)
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

  // Fallback: webhook (Resend etc.)
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
  const itemsHtml = items
    .map(function (i) {
      return '<tr><td style="padding:8px;border-bottom:1px solid #333">' +
        i.quantity + '\u00d7 ' + i.product.name + ' (' + (i.size || '-') +
        ')</td><td style="padding:8px;border-bottom:1px solid #333;text-align:right">\u20b4' +
        (i.product.price * i.quantity).toFixed(2) + '</td></tr>';
    })
    .join('');

  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:20px">\n  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px">\n    <h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1>\n    <h2 style="font-size:18px;margin:0 0 10px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043e</h2>\n    <p style="color:#999;margin:0 0 20px">\u041d\u043e\u043c\u0435\u0440 \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f: <strong style="color:#b10006">#' + orderId + '</strong></p>\n    <table style="width:100%;border-collapse:collapse;margin:0 0 20px">' + itemsHtml + '</table>\n    <p style="text-align:right;font-size:18px"><strong>\u20b4' + total.toFixed(2) + '</strong></p>\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#999;font-size:14px;margin:0 0 10px"><strong>\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430:</strong><br>' + shippingInfo.firstName + ' ' + shippingInfo.lastName + '<br>' + shippingInfo.address + (shippingInfo.apartment ? ', ' + shippingInfo.apartment : '') + '<br>' + shippingInfo.city + ', ' + shippingInfo.country + ', ' + shippingInfo.postalCode + '</p>\n    ' + (trackingNumber ? '<p style="color:#b10006;font-size:14px;margin:0 0 10px"><strong>\u0422\u0422\u041d \u041d\u043e\u0432\u0430 \u041f\u043e\u0448\u0442\u0430:</strong> ' + trackingNumber + '</p>' : '') + '\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#666;font-size:12px">BUKSY \u2014 Dark Luxury Streetwear<br>buksy.shop' + '\u0040' + 'gmail.com</p>\n  </div>\n</body></html>';
}

function paymentConfirmedHtml({ orderId, amount, currency, paymentId, items }) {
  var itemsHtml = '';
  if (items) {
    itemsHtml = '<table style="width:100%;border-collapse:collapse;margin:20px 0">' +
      items.map(function (i) {
        return '<tr><td style="padding:8px;border-bottom:1px solid #333">' +
          i.qty + '\u00d7 ' + i.name + ' (' + (i.size || '-') + ')</td></tr>';
      }).join('') + '</table>';
  }

  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:20px">\n  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px">\n    <h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1>\n    <h2 style="font-size:18px;margin:0 0 10px">\u041e\u043f\u043b\u0430\u0442\u0430 \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u0430 \u2705</h2>\n    <p style="color:#999;margin:0 0 20px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f <strong style="color:#b10006">#' + orderId + '</strong> \u043e\u043f\u043b\u0430\u0447\u0435\u043d\u043e.</p>\n    <p style="font-size:18px;margin:0 0 20px"><strong>' + Number(amount).toFixed(2) + ' ' + currency + '</strong></p>\n    ' + (paymentId ? '<p style="color:#999;font-size:12px">\u041f\u043b\u0430\u0442\u0456\u0436: ' + paymentId + '</p>' : '') + '\n    ' + itemsHtml + '\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#999;font-size:14px">\u041c\u0438 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u0438\u043c\u043e \u0432\u0430\u0441, \u043a\u043e\u043b\u0438 \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u0431\u0443\u0434\u0435 \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e.</p>\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#666;font-size:12px">BUKSY \u2014 Dark Luxury Streetwear<br>buksy.shop' + '\u0040' + 'gmail.com</p>\n  </div>\n</body></html>';
}

function trackingUpdateHtml({ orderId, trackingNumber }) {
  return '<!DOCTYPE html>\n<html><head><meta charset="utf-8"></head>\n<body style="font-family:Arial,sans-serif;background:#111;color:#eee;padding:20px">\n  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border:1px solid #333;padding:30px">\n    <h1 style="color:#b10006;font-size:24px;margin:0 0 20px">BUKSY</h1>\n    <h2 style="font-size:18px;margin:0 0 10px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \ud83d\udce6</h2>\n    <p style="color:#999;margin:0 0 20px">\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f <strong style="color:#b10006">#' + orderId + '</strong> \u0432 \u0434\u043e\u0440\u043e\u0437\u0456.</p>\n    <p style="font-size:16px;margin:0 0 20px">\u0422\u0422\u041d \u041d\u043e\u0432\u0430 \u041f\u043e\u0448\u0442\u0430: <strong style="color:#b10006;font-size:20px">' + trackingNumber + '</strong></p>\n    <p style="color:#999;font-size:14px">\u0412\u0456\u0434\u0441\u0442\u0435\u0436\u0438\u0442\u0438 \u043c\u043e\u0436\u043d\u0430 \u043d\u0430 <a href="https://novaposhta.ua" style="color:#b10006">novaposhta.ua</a></p>\n    <hr style="border-color:#333;margin:20px 0">\n    <p style="color:#666;font-size:12px">BUKSY \u2014 Dark Luxury Streetwear<br>buksy.shop' + '\u0040' + 'gmail.com</p>\n  </div>\n</body></html>';
}

module.exports = { sendEmail, orderConfirmationHtml, paymentConfirmedHtml, trackingUpdateHtml };
