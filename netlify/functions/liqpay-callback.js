const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = new URLSearchParams(event.body);
    const data = body.get('data');
    const signature = body.get('signature');

    const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY;
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Verify signature
    const expectedSig = crypto
      .createHash('sha1')
      .update(PRIVATE_KEY + data + PRIVATE_KEY)
      .digest('base64');

    if (signature !== expectedSig) {
      return { statusCode: 403, body: 'Invalid signature' };
    }

    const payment = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

    if (payment.status === 'success' || payment.status === 'sandbox') {
      const info = JSON.parse(payment.info || '{}');
      const itemsText = (info.items || [])
        .map((i) => `   ${i.qty}× ${i.name} (${i.size})`)
        .join('\n');

      const msg = [
        '✅ <b>ОПЛАЧЕНО</b>',
        `<code>#${payment.order_id}</code>`,
        '',
        `💳 ${payment.payment_id}`,
        `💰 <b>${payment.amount} ${payment.currency}</b>`,
        '',
        itemsText ? '<b>🛍 Товари</b>\n' + itemsText : '',
        '',
        info.shippingInfo
          ? `👤 ${info.shippingInfo.firstName} ${info.shippingInfo.lastName}\n   ${info.shippingInfo.email}\n   ${info.shippingInfo.phone || ''}`
          : '',
        '',
        '━━━━━━━━━━━━━━━━',
        '✅ Оплата підтверджена',
      ]
        .filter(Boolean)
        .join('\n');

      if (TOKEN && CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
        });
      }
    }

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
