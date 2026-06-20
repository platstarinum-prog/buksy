const { guard, esc, sanitize, validateEmail, parseBody, generateOrderId } = require('./_utils');
const { saveOrder, getStock } = require('./_supabase');
const { sendEmail, orderConfirmationHtml } = require('./_email');
const catalog = require('./_catalog.json');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const blocked = guard(event, 10);
  if (blocked) return blocked;

  var parsed = parseBody(event, 65536);
  if (parsed.error) {
    return { statusCode: 400, body: JSON.stringify({ error: parsed.error }) };
  }
  var body = parsed.data;

  try {
    var items = body.items;
    var shippingInfo = body.shippingInfo;
    var email = body.email;
    var idempotencyKey = body.idempotencyKey;

    if (!items || !Array.isArray(items) || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    if (email && !validateEmail(email)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email format' }) };
    }

    if (idempotencyKey && (typeof idempotencyKey !== 'string' || idempotencyKey.length > 128)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid idempotency key' }) };
    }

    var MONOBANK_TOKEN = process.env.MONOBANK_TOKEN;
    var SITE_URL = process.env.URL || process.env.DEPLOY_URL || '';

    var orderId = generateOrderId();

    const validatedItems = [];
    for (const item of items) {
      const slug = item.product?.slug;
      const entry = catalog[slug];
      if (!entry) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Unknown product: ' + (slug || 'unknown') }) };
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0 || qty > 10) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid quantity for ' + slug }) };
      }

      const dbStock = await getStock(slug);
      if (dbStock !== null && dbStock < qty) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Insufficient stock for ' + entry.name + ': ' + dbStock + ' available' }) };
      }

      validatedItems.push({ slug, name: entry.name, size: item.size ? sanitize(String(item.size), 64) : '', qty, price: entry.price });
    }

    if (!MONOBANK_TOKEN) {
      console.error('[Monobank] MONOBANK_TOKEN env var not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Monobank не налаштовано' }),
      };
    }

    if (!SITE_URL) {
      return { statusCode: 500, body: JSON.stringify({ error: 'SITE_URL not configured' }) };
    }

    const serverTotal = validatedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const amountKopecks = Math.round(serverTotal * 100);

    const basketOrder = validatedItems.map((i) => ({
      name: i.name + (i.size ? ' (' + i.size + ')' : ''),
      qty: i.qty,
      sum: Math.round(i.price * i.qty * 100),
      icon: '',
      unit: 'шт.',
      code: i.slug,
    }));

    const safeShipping = shippingInfo && typeof shippingInfo === 'object' ? shippingInfo : {};
    const safeEmail = sanitize(String(email || ''), 256);

    const orderRecord = {
      order_id: orderId,
      idempotency_key: idempotencyKey || null,
      status: 'awaiting_payment',
      payment_method: 'monobank',
      customer: {
        email: safeEmail,
        firstName: sanitize(String(safeShipping.firstName || ''), 128),
        lastName: sanitize(String(safeShipping.lastName || ''), 128),
        phone: sanitize(String(safeShipping.phone || ''), 32),
      },
      shipping: {
        address: sanitize(String(safeShipping.address || ''), 256),
        apartment: sanitize(String(safeShipping.apartment || ''), 64),
        city: sanitize(String(safeShipping.city || ''), 128),
        country: sanitize(String(safeShipping.country || ''), 128),
        postalCode: sanitize(String(safeShipping.postalCode || ''), 32),
        novaPoshtaBranch: sanitize(String(safeShipping.novaPoshtaBranch || ''), 32),
      },
      items: validatedItems.map((i) => ({ slug: i.slug, name: i.name, size: i.size, price: i.price, qty: i.qty })),
      shipping_cost: 0,
      tax: 0,
      subtotal: serverTotal,
      total: serverTotal,
      created_at: new Date().toISOString(),
    };

    try {
      const saved = await saveOrder(orderRecord);
      if (saved && saved.duplicate) {
        return { statusCode: 409, body: JSON.stringify({ error: 'Це замовлення вже оформлено', duplicate: true }) };
      }
    } catch (err) {
      console.error('Save order failed:', err.message);
      return { statusCode: 500, body: JSON.stringify({ error: 'Не вдалося створити замовлення' }) };
    }

    const monoBody = {
      amount: amountKopecks,
      ccy: 980,
      merchantPaymInfo: {
        reference: orderId,
        destination: 'Замовлення #' + orderId + ' — BUKSY',
        basketOrder,
      },
      redirectUrl: SITE_URL + '/checkout?orderId=' + orderId,
      webHookUrl: SITE_URL + '/.netlify/functions/monobank-callback',
      validity: 3600,
      paymentType: 'debit',
    };

    const monoRes = await fetch('https://api.monobank.ua/api/merchant/invoice/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Token': MONOBANK_TOKEN,
      },
      body: JSON.stringify(monoBody),
    });

    if (!monoRes.ok) {
      const errText = await monoRes.text();
      console.error('Monobank invoice failed:', monoRes.status, errText);
      var msg = 'Монобанк: ';
      if (monoRes.status === 403) msg = msg + 'невірний токен (403)';
      else if (monoRes.status === 400) msg = msg + 'помилка в даних (400)';
      else msg = msg + 'помилка ' + monoRes.status;
      return { statusCode: 502, body: JSON.stringify({ error: msg }) };
    }

    const monoData = await monoRes.json();

    var tasks = [];

    var TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    var CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (TOKEN && CHAT_ID) {
      var info = safeShipping;
      var itemLines = validatedItems.map(function (i) {
        return i.qty + '\u00d7 ' + i.name + (i.size ? ' (' + i.size + ')' : '') + ' \u2014 ' + (i.price * i.qty) + ' \u20B4';
      }).join('\n');
      var msg = (
        '\uD83D\uDED2 <b>НОВЕ ЗАМОВЛЕННЯ</b>\n' +
        '<code>#' + orderId + '</code>\n' +
        '\n' +
        '\uD83D\uDC64 <b>' + esc(String(info.firstName || '-')) + ' ' + esc(String(info.lastName || '')) + '</b>\n' +
        '\uD83D\uDCE7 ' + esc(safeEmail || '-') + '\n' +
        (info.phone ? '\uD83D\uDCF1 ' + esc(String(info.phone)) + '\n' : '') +
        '\n' +
        '\uD83D\uDCCD ' + esc(String(info.city || '-')) + ', ' + esc(String(info.country || '-')) + '\n' +
        '\uD83D\uDE9A ' + esc(String(info.address || '-')) + (info.apartment ? ', ' + esc(String(info.apartment)) : '') + '\n' +
        (info.novaPoshtaBranch ? '\uD83D\uDCE6 \u041D\u041F \u2116' + esc(String(info.novaPoshtaBranch)) + '\n' : '') +
        '\n' +
        '<b>Товари:</b>\n' +
        itemLines + '\n' +
        '\n' +
        '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n' +
        '\uD83D\uDCB0 <b>' + serverTotal + ' \u20B4</b>  |  \uD83D\uDCB3 Monobank\n' +
        '\u23F3 \u041E\u0447\u0456\u043A\u0443\u0454 \u043E\u043F\u043B\u0430\u0442\u0438'
      );
      tasks.push(
        fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
        }).then(function (r) { if (!r.ok) console.error('Telegram notify failed:', r.status); })
          .catch(function (err) { console.error('Telegram notify failed:', err.message); })
      );
    }

    if (safeEmail) {
      var emailItems = validatedItems.map(function (i) {
        return { product: { name: i.name, price: i.price }, size: i.size, quantity: i.qty };
      });
      tasks.push(
        sendEmail({
          to: safeEmail,
          subject: '\u0417\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F #' + orderId + ' \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E \u2014 BUKSY',
          html: orderConfirmationHtml({ orderId: orderId, items: emailItems, total: serverTotal, shippingInfo: safeShipping }),
        }).catch(function (err) { console.error('Order email failed:', err.message); })
      );
    }

    var results = await Promise.allSettled(tasks);
    var failed = results.filter(function (r) { return r.status === 'rejected'; }).length;
    if (failed) console.error('monobank-checkout: ' + failed + ' side-effect(s) failed');

    return {
      statusCode: 200,
      body: JSON.stringify({ redirectUrl: monoData.pageUrl, orderId: orderId }),
    };
  } catch (error) {
    console.error('monobank-checkout error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Внутрішня помилка сервера' }) };
  }
};
