const { esc, sanitize, guard, validateEmail, parseBody, generateOrderId } = require('./_utils');
const { saveOrder, decreaseStock, getStock } = require('./_supabase');
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
    var paymentMethod = body.paymentMethod;
    var idempotencyKey = body.idempotencyKey;

    if (!items || !Array.isArray(items) || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    if (!shippingInfo || typeof shippingInfo !== 'object') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Shipping info is required' }) };
    }

    if (idempotencyKey && (typeof idempotencyKey !== 'string' || idempotencyKey.length > 128)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid idempotency key' }) };
    }

    const info = shippingInfo;
    const safeEmail = sanitize(String(info.email || ''), 256);

    if (!safeEmail || !validateEmail(safeEmail)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Valid email is required' }) };
    }

    const validatedItems = [];
    for (const item of items) {
      const slug = item.product?.slug;
      const entry = catalog[slug];
      if (!entry) {
        return { statusCode: 400, body: JSON.stringify({ error: `Unknown product: ${slug || 'unknown'}` }) };
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0 || qty > 10) {
        return { statusCode: 400, body: JSON.stringify({ error: `Invalid quantity for ${slug}` }) };
      }
      if (entry.stock < qty) {
        return { statusCode: 400, body: JSON.stringify({ error: `Insufficient stock for ${entry.name}: ${entry.stock} available, ${qty} requested` }) };
      }
      const dbStock = await getStock(slug);
      if (dbStock !== null && dbStock < qty) {
        return { statusCode: 400, body: JSON.stringify({ error: `Insufficient stock for ${entry.name}: ${dbStock} available (DB)` }) };
      }
      validatedItems.push({
        product: { slug, name: entry.name, price: entry.price, images: item.product?.images || [] },
        size: item.size ? sanitize(String(item.size), 64) : '',
        quantity: qty,
        pricePerUnit: entry.price,
      });
    }
    const safeItems = validatedItems;

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const orderId = generateOrderId();
    const total = safeItems.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);

    const itemsList = safeItems
      .map((i) =>        `   ${i.quantity}× ${esc(i.product.name)} (${esc(i.size)}) — ${(i.pricePerUnit * i.quantity).toFixed(0)} ₴`)
      .join('\n');

    const paymentLabel = paymentMethod === 'monobank' ? '\uD83D\uDCB3 Monobank (\u043E\u0447\u0456\u043A\u0443\u0454 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F)' : '\uD83D\uDCB3 \u041E\u043F\u043B\u0430\u0442\u0430';

    const firstName = sanitize(String(info.firstName || ''), 128);
    const lastName = sanitize(String(info.lastName || ''), 128);
    const phone = sanitize(String(info.phone || ''), 32);
    const address = sanitize(String(info.address || ''), 256);
    const apartment = sanitize(String(info.apartment || ''), 64);
    const city = sanitize(String(info.city || ''), 128);
    const country = sanitize(String(info.country || ''), 128);
    const postalCode = sanitize(String(info.postalCode || ''), 32);
    const novaPoshtaBranch = sanitize(String(info.novaPoshtaBranch || ''), 32);

    const msg = [
      '\uD83D\uDED2 <b>НОВЕ ЗАМОВЛЕННЯ</b>',
      `<code>#${orderId}</code>`,
      '',
      '<b>👤 Клієнт</b>',
      `   ${esc(firstName)} ${esc(lastName)}`,
      `   ${esc(safeEmail)}`,
      phone ? `   ${esc(phone)}` : '',
      '',
      '<b>📍 Доставка</b>',
      `   ${esc(address)}${apartment ? ', ' + esc(apartment) : ''}`,
      `   ${esc(city)}, ${esc(country)}, ${esc(postalCode)}`,
      novaPoshtaBranch ? '   \u041D\u041F \u2116' + esc(novaPoshtaBranch) : '',
      '',
      '<b>🛍 Товари</b>',
      itemsList,
      '',
      paymentLabel,
      '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501',
      `\u{1F4B0} <b>${total.toFixed(0)} \u20B4</b>`,
    ].filter(Boolean).join('\n');

    if (TOKEN && CHAT_ID) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
        });
        if (!tgRes.ok) console.error('Telegram order notification failed:', tgRes.status);
      } catch (err) {
        console.error('Telegram order notification failed:', err.message);
      }
    }

    var saved;
    try {
      saved = await saveOrder({
        order_id: orderId,
        idempotency_key: idempotencyKey || null,
        status: paymentMethod === 'monobank' ? 'awaiting_payment' : 'new',
        payment_method: paymentMethod || 'card',
        customer: {
          firstName: firstName,
          lastName: lastName,
          email: safeEmail,
          phone: phone,
        },
        shipping: {
          address: address,
          apartment: apartment,
          city: city,
          country: country,
          postalCode: postalCode,
          novaPoshtaBranch: novaPoshtaBranch,
        },
        items: safeItems.map((i) => ({ slug: i.product.slug, name: i.product.name, size: i.size, price: i.pricePerUnit, qty: i.quantity })),
        subtotal: total,
        shipping_cost: 0,
        tax: 0,
        total,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Save order failed:', err.message);
      return { statusCode: 500, body: JSON.stringify({ error: 'Не вдалося створити замовлення' }) };
    }

    if (saved && saved.duplicate) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Це замовлення вже оформлено', duplicate: true }),
      };
    }

    var tasks = [];

    if (paymentMethod !== 'monobank') {
      tasks.push(
        decreaseStock(safeItems.map(function (i) {
          var catStock = catalog[i.product.slug] ? catalog[i.product.slug].stock : 99;
          return { product: { slug: i.product.slug }, quantity: i.quantity, default_stock: Number(catStock) || 99 };
        }))
          .catch(function (err) { console.error('Stock decrease failed:', err.message); })
      );
    }

    if (safeEmail) {
      tasks.push(
        sendEmail({
          to: safeEmail,
          subject: '\u0417\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F #' + orderId + ' \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043E \u2014 BUKSY',
          html: orderConfirmationHtml({ orderId, items: safeItems, total, shippingInfo: {
            firstName: firstName,
            lastName: lastName,
            address: address,
            apartment: apartment,
            city: city,
            country: country,
            postalCode: postalCode,
            novaPoshtaBranch: novaPoshtaBranch,
          } }),
        }).catch(function (err) { console.error('Email send failed:', err.message); })
      );
    }

    var results = await Promise.allSettled(tasks);
    var failed = results.filter(function (r) { return r.status === 'rejected'; }).length;
    if (failed) console.error('order: ' + failed + ' side-effect(s) failed');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, orderId, total, message: 'Order placed successfully!' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
