const { esc } = require('./_utils');
const { markOrderPaid, decreaseStock } = require('./_supabase');
const { sendEmail, paymentConfirmedHtml } = require('./_email');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    if (!body.invoiceId || !body.status || !body.reference) {
      return { statusCode: 400, body: 'Invalid callback payload' };
    }

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (body.status !== 'success') {
      console.log('Monobank callback: status=' + body.status + ', ref=' + body.reference);
      return { statusCode: 200, body: 'OK' };
    }

    const amount = (body.amount || body.finalAmount || 0) / 100;

    const msg = [
      '\u2705 <b>ОПЛАЧЕНО (Monobank)</b>',
      '<code>#' + esc(body.reference) + '</code>',
      '',
      '\uD83D\uDCB3 ' + esc(body.invoiceId),
      '\uD83D\uDCB0 <b>' + amount.toFixed(2) + ' UAH</b>',
      '',
      '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501',
      '\u2705 Оплата підтверджена',
    ].join('\n');

    // Telegram
    if (TOKEN && CHAT_ID) {
      try {
        const tgRes = await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
        });
        if (!tgRes.ok) console.error('Telegram payment notification failed:', tgRes.status);
      } catch (err) {
        console.error('Telegram payment notification failed:', err.message);
      }
    }

    // Mark order as paid (idempotent — skips if already paid)
    const wasPaid = await markOrderPaid(body.reference, body.invoiceId);
    if (!wasPaid) {
      return { statusCode: 200, body: 'OK' };
    }

    // Decrease stock
    if (body.basketOrder && body.basketOrder.length) {
      decreaseStock(
        body.basketOrder.map(function (b) {
          return { product: { slug: b.code }, quantity: b.qty };
        })
      ).catch(function () {});
    }

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('monobank-callback error:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
