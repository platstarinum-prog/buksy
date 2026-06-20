const { esc, rateLimit, parseBody } = require('./_utils');
const { markOrderPaidWithStock, getOrderByRef } = require('./_supabase');
const { sendEmail, paymentConfirmedHtml } = require('./_email');
const catalog = require('./_catalog.json');
const crypto = require('crypto');

let cachedPubKey = null;
let pubKeyFetchedAt = 0;

async function getPubKey() {
  if (cachedPubKey && Date.now() - pubKeyFetchedAt < 3600000) return cachedPubKey;
  const TOKEN = process.env.MONOBANK_TOKEN;
  if (!TOKEN) return null;
  try {
    const res = await fetch('https://api.monobank.ua/api/merchant/pubkey', {
      headers: { 'X-Token': TOKEN },
    });
    if (!res.ok) return cachedPubKey;
    const data = await res.json();
    cachedPubKey = data.key;
    pubKeyFetchedAt = Date.now();
    return cachedPubKey;
  } catch {
    return cachedPubKey;
  }
}

function verifySignature(rawBody, xSign, pubKey) {
  if (!xSign || !pubKey) return false;
  try {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(rawBody, 'utf8');
    return verifier.verify(pubKey, Buffer.from(xSign, 'base64'));
  } catch {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ip = event.headers['client-ip'] || 'unknown';
  if (!rateLimit(ip, 30)) {
    return { statusCode: 429, body: JSON.stringify({ error: 'Too many requests' }) };
  }

  const rawBody = event.body || '';
  const xSign = event.headers['x-sign'] || '';

  const pubKey = await getPubKey();
  if (!pubKey) {
    console.error('Monobank callback: cannot verify signature (public key unavailable)');
    return { statusCode: 500, body: 'Server misconfigured — cannot verify Monobank signature' };
  }
  if (!xSign || !verifySignature(rawBody, xSign, pubKey)) {
    console.error('Monobank callback: invalid X-Sign');
    return { statusCode: 403, body: 'Invalid signature' };
  }

  var parsed = parseBody(event, 65536);
  if (parsed.error) {
    return { statusCode: 400, body: 'Invalid JSON payload' };
  }
  var body = parsed.data;

  try {
    if (!body.invoiceId || !body.status || !body.reference) {
      return { statusCode: 400, body: 'Invalid callback payload' };
    }

    if (body.status !== 'success') {
      return { statusCode: 200, body: 'OK' };
    }

    const amount = (body.amount || body.finalAmount || 0) / 100;
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

    var itemsForStock = [];
    if (body.basketOrder && Array.isArray(body.basketOrder) && body.basketOrder.length) {
      itemsForStock = body.basketOrder.map(function (b) {
        var catEntry = catalog[b.code];
        var catStock = catEntry ? Number(catEntry.stock) : 99;
        return { slug: b.code, qty: Number(b.qty) || 0, default_stock: catStock || 99 };
      }).filter(function (i) { return i.slug && i.qty > 0; });
    }

    var wasPaid;
    try {
      wasPaid = await markOrderPaidWithStock(body.reference, body.invoiceId, itemsForStock.length ? itemsForStock : null);
    } catch (err) {
      console.error('markOrderPaidWithStock error:', err.message);
      return { statusCode: 500, body: 'DB error' };
    }

    if (!wasPaid) {
      return { statusCode: 200, body: 'OK' };
    }

    var tasks = [];

    try {
      const order = await getOrderByRef(body.reference);
      if (order && order.customer && order.customer.email) {
        var emailItems = (body.basketOrder || []).map(function (b) {
          return { qty: b.qty, name: b.name, size: '' };
        });
        tasks.push(
          sendEmail({
            to: order.customer.email,
            subject: '\u041E\u043F\u043B\u0430\u0442\u0443 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043E \u2014 \u0417\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F #' + body.reference,
            html: paymentConfirmedHtml({ orderId: body.reference, amount: amount, currency: 'UAH', paymentId: body.invoiceId, items: emailItems }),
          }).catch(function (err) { console.error('Payment email failed:', err.message); })
        );
      }
    } catch (e) { console.error('Failed to send payment email:', e.message); }

    await Promise.allSettled(tasks).then(function (results) {
      var failed = results.filter(function (r) { return r.status === 'rejected'; }).length;
      if (failed) console.error('monobank-callback: ' + failed + ' side-effect(s) failed');
    });

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('monobank-callback error:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }
};
