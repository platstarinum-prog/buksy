const { esc, guard } = require('./_utils');
const { saveOrder, decreaseStock } = require('./_supabase');
const { sendEmail, orderConfirmationHtml } = require('./_email');
const catalog = require('./_catalog.json');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const blocked = guard(event, 10);
  if (blocked) return blocked;

  try {
    const { items, shippingInfo, paymentMethod } = JSON.parse(event.body);

    if (!items || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    if (!shippingInfo || typeof shippingInfo !== 'object') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Shipping info is required' }) };
    }

    const info = shippingInfo;

    // Validate items against catalog
    const validatedItems = [];
    for (const item of items) {
      const slug = item.product?.slug;
      const entry = catalog[slug];
      if (!entry) {
        return { statusCode: 400, body: JSON.stringify({ error: `Unknown product: ${slug || 'unknown'}` }) };
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return { statusCode: 400, body: JSON.stringify({ error: `Invalid quantity for ${slug}` }) };
      }
      if (entry.stock < qty) {
        return { statusCode: 400, body: JSON.stringify({ error: `Insufficient stock for ${entry.name}: ${entry.stock} available, ${qty} requested` }) };
      }
      validatedItems.push({
        product: { slug, name: entry.name, price: entry.price, images: item.product?.images || [] },
        size: item.size || '',
        quantity: qty,
        pricePerUnit: entry.price,
      });
    }
    const safeItems = validatedItems;

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const orderId = 'BUK-' + Date.now().toString().slice(-6);
    const total = safeItems.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);

    const itemsList = safeItems
      .map((i) => `   ${i.quantity}× ${esc(i.product.name)} (${esc(i.size)}) — $${(i.pricePerUnit * i.quantity).toFixed(2)}`)
      .join('\n');

    const paymentLabel = paymentMethod === 'monobank' ? '\uD83D\uDCB3 Monobank (\u043E\u0447\u0456\u043A\u0443\u0454 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F)' : '\uD83D\uDCB3 \u041E\u043F\u043B\u0430\u0442\u0430';

    const firstName = esc(String(info.firstName || ''));
    const lastName = esc(String(info.lastName || ''));
    const email = String(info.email || '');
    const safeEmail = esc(email);
    const phone = info.phone && String(info.phone).trim() ? esc(String(info.phone)) : '';
    const address = esc(String(info.address || ''));
    const apartment = info.apartment ? ', ' + esc(String(info.apartment)) : '';
    const city = esc(String(info.city || ''));
    const country = esc(String(info.country || ''));
    const postalCode = esc(String(info.postalCode || ''));

    const msg = [
      '🛒 <b>НОВЕ ЗАМОВЛЕННЯ</b>',
      `<code>#${orderId}</code>`,
      '',
      '<b>👤 Клієнт</b>',
      `   ${firstName} ${lastName}`,
      `   ${safeEmail}`,
      phone ? `   ${phone}` : '',
      '',
      '<b>📍 Доставка</b>',
      `   ${address}${apartment}`,
      `   ${city}, ${country}, ${postalCode}`,
      info.novaPoshtaBranch ? '   \u041D\u041F \u2116' + esc(String(info.novaPoshtaBranch)) : '',
      '',
      '<b>🛍 Товари</b>',
      itemsList,
      '',
      paymentLabel,
      '━━━━━━━━━━━━━━━━',
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

    // Collect all side-effects
    var tasks = [];

    // Save to Supabase
    tasks.push(saveOrder({
      order_id: orderId,
      status: paymentMethod === 'monobank' ? 'awaiting_payment' : 'new',
      payment_method: paymentMethod || 'card',
      customer: { firstName: info.firstName, lastName: info.lastName, email, phone: info.phone },
      shipping: { address: info.address, apartment: info.apartment, city: info.city, country: info.country, postalCode: info.postalCode, novaPoshtaBranch: info.novaPoshtaBranch || '' },
      items: safeItems.map((i) => ({ slug: i.product.slug, name: i.product.name, size: i.size, price: i.pricePerUnit, qty: i.quantity })),
      subtotal: total,
      shipping_cost: 0,
      tax: 0,
      total,
      created_at: new Date().toISOString(),
    }).catch(function (err) { console.error('Save order failed:', err.message); }));

    // Decrease stock
    tasks.push(
      decreaseStock(safeItems.map((i) => ({ product: { slug: i.product.slug }, quantity: i.quantity })))
        .catch(function (err) { console.error('Stock decrease failed:', err.message); })
    );

    // Email
    if (email) {
      tasks.push(
        sendEmail({
          to: email,
          subject: '\u0417\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F #' + orderId + ' \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043E \u2014 BUKSY',
          html: orderConfirmationHtml({ orderId, items: safeItems, total, shippingInfo: info }),
        }).catch(function (err) { console.error('Email send failed:', err.message); })
      );
    }

    // Wait for all side-effects to complete
    await Promise.allSettled(tasks);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, orderId, total, message: 'Order placed successfully!' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
