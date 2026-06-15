const { esc, guard } = require('./_utils');
const { saveOrder, decreaseStock } = require('./_supabase');
const { sendEmail, orderConfirmationHtml } = require('./_email');
const catalog = require('./_catalog.json');

function calcServerTotal(items, shippingMethod) {
  const subtotal = items.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : (shippingMethod === 'express' ? 25 : 15);
  const tax = subtotal * 0.08;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const blocked = guard(event, 10);
  if (blocked) return blocked;

  try {
    const { items, shippingInfo, paymentMethod, shippingMethod } = JSON.parse(event.body);

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
    const { subtotal, shipping, tax, total } = calcServerTotal(safeItems, shippingMethod);

    const itemsList = safeItems
      .map((i) => `   ${i.quantity}× ${esc(i.product.name)} (${esc(i.size)}) — $${(i.pricePerUnit * i.quantity).toFixed(2)}`)
      .join('\n');

    const paymentLabel = paymentMethod === 'monobank' ? '💳 Monobank (очікує підтвердження)' : '💳 Оплата при отриманні';

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
      '',
      '<b>🛍 Товари</b>',
      itemsList,
      '',
      paymentLabel,
      '━━━━━━━━━━━━━━━━',
      `💰 <b>$${total.toFixed(2)}</b>`,
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

    // Save to Supabase
    saveOrder({
      order_id: orderId,
      status: paymentMethod === 'monobank' ? 'awaiting_payment' : 'new',
      payment_method: paymentMethod || 'cod',
      shipping_method: shippingMethod || 'standard',
      customer: { firstName: info.firstName, lastName: info.lastName, email, phone: info.phone },
      shipping: { address: info.address, apartment: info.apartment, city: info.city, country: info.country, postalCode: info.postalCode },
      items: safeItems.map((i) => ({ slug: i.product.slug, name: i.product.name, size: i.size, price: i.pricePerUnit, qty: i.quantity })),
      subtotal,
      shipping_cost: shipping,
      tax,
      total,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    // Decrease stock
    decreaseStock(safeItems.map((i) => ({ product: { slug: i.product.slug }, quantity: i.quantity }))).catch(() => {});

    // Email
    if (email) {
      sendEmail({
        to: email,
        subject: `Замовлення #${orderId} підтверджено — BUKSY`,
        html: orderConfirmationHtml({ orderId, items: safeItems, total, shippingInfo: info }),
      }).catch(() => {});
    }

    // Auto-create TTN if Nova Poshta is configured
    if (paymentMethod !== 'monobank') {
      autoCreateTtn(orderId, info, safeItems, total).catch(() => {});
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, orderId, total, message: 'Order placed successfully!' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

// Auto-create Nova Poshta TTN for COD orders
async function autoCreateTtn(orderId, shippingInfo, items, total) {
  const apiKey = process.env.NOVA_POSHTA_API_KEY;
  const senderCity = process.env.NP_SENDER_CITY_REF;
  const senderAddr = process.env.NP_SENDER_ADDRESS_REF;
  const senderContact = process.env.NP_SENDER_CONTACT_REF;
  const senderPhone = process.env.NP_SENDER_PHONE;

  if (!apiKey || !senderCity || !senderAddr || !senderContact) return;

  try {
    const cargoDesc = items.map(function (i) { return i.product.name; }).join(', ').slice(0, 255);
    const codAmount = Math.round(total);

    const props = {
      SenderPhone: senderPhone || '',
      CitySender: senderCity,
      SenderAddress: senderAddr,
      ContactSender: senderContact,
      SendersPhone: senderPhone || '',
      RecipientCityName: String(shippingInfo.city || ''),
      RecipientAddressName: String(shippingInfo.address || ''),
      RecipientName: [shippingInfo.firstName, shippingInfo.lastName].filter(Boolean).join(' ') || 'Клієнт',
      RecipientType: 'PrivatePerson',
      RecipientsPhone: String(shippingInfo.phone || ''),
      ServiceType: 'WarehouseWarehouse',
      PaymentMethod: 'Cash',
      CargoType: 'Cargo',
      Weight: '1',
      SeatsAmount: '1',
      Description: cargoDesc || 'Товари',
      Cost: String(codAmount),
      BackwardDeliveryData: [
        { PayerType: 'Recipient', CargoType: 'Money', RedeliveryString: String(codAmount) },
      ],
    };

    const npRes = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, modelName: 'InternetDocument', calledMethod: 'save', methodProperties: props }),
    });

    const npData = await npRes.json();
    if (!npData.success) return;

    const ttn = (npData.data[0] || {}).IntDocNumber;
    if (!ttn) return;

    // Update order with TTN
    const { updateOrderStatus } = require('./_supabase');
    const { sendEmail, trackingUpdateHtml } = require('./_email');
    await updateOrderStatus(orderId, {
      status: 'shipped',
      tracking_number: ttn,
      shipped_at: new Date().toISOString(),
    }).catch(function () {});

    // Telegram
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (TOKEN && CHAT_ID) {
      const ttnMsg = [
        '\uD83D\uDCE6 <b>ТТН створено авто</b>',
        '<code>#' + orderId + '</code>',
        '',
        '\uD83D\uDE9A <b>ТТН: ' + ttn + '</b>',
        '\uD83D\uDCB0 Наложений: ' + codAmount + ' грн',
      ].join('\n');
      try {
        await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: ttnMsg, parse_mode: 'HTML' }),
        });
      } catch (e) {}
    }

    // Email customer tracking
    if (shippingInfo.email) {
      sendEmail({
        to: shippingInfo.email,
        subject: 'Замовлення #' + orderId + ' відправлено — BUKSY',
        html: trackingUpdateHtml({ orderId, trackingNumber: ttn }),
      }).catch(function () {});
    }

    console.log('[NP Auto] TTN ' + ttn + ' for order ' + orderId);
  } catch (err) {
    console.error('[NP Auto] Error:', err.message);
  }
}
