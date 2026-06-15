const { guard } = require('./_utils');
const { updateOrderStatus } = require('./_supabase');
const { sendEmail, trackingUpdateHtml } = require('./_email');

const NP_API = 'https://api.novaposhta.ua/v2.0/json/';

async function callNp(model, method, props) {
  const apiKey = process.env.NOVA_POSHTA_API_KEY;
  if (!apiKey) throw new Error('NOVA_POSHTA_API_KEY not set');

  const res = await fetch(NP_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, modelName: model, calledMethod: method, methodProperties: props }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error((data.errors || []).join('; ') || 'NP API error');
  }
  return data.data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const blocked = guard(event, 10);
  if (blocked) return blocked;

  try {
    const body = JSON.parse(event.body);
    const { action, orderId, trackingNumber, customerEmail } = body;

    // --- Update existing order with manual TTN ---
    if (action === 'update') {
      if (!orderId || !trackingNumber) {
        return { statusCode: 400, body: JSON.stringify({ error: 'orderId and trackingNumber required' }) };
      }

      await updateOrderStatus(orderId, {
        status: 'shipped',
        tracking_number: String(trackingNumber).trim(),
        shipped_at: new Date().toISOString(),
      });

      // Telegram notification
      const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
      if (TOKEN && CHAT_ID) {
        const msg = [
          '\uD83D\uDCE6 <b>ВІДПРАВЛЕНО</b>',
          '<code>#' + orderId + '</code>',
          '',
          '\uD83D\uDE9A ТТН: <code>' + trackingNumber + '</code>',
        ].join('\n');
        try {
          await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
          });
        } catch (e) {}
      }

      if (customerEmail) {
        sendEmail({
          to: customerEmail,
          subject: '\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f #' + orderId + ' \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e',
          html: trackingUpdateHtml({ orderId, trackingNumber }),
        }).catch(function () {});
      }

      return { statusCode: 200, body: JSON.stringify({ success: true, ttn: trackingNumber }) };
    }

    // --- Search cities ---
    if (action === 'searchCity') {
      const city = body.city || '';
      if (city.length < 2) return { statusCode: 400, body: JSON.stringify({ error: 'Min 2 chars' }) };
      const cities = await callNp('Address', 'searchSettlements', { CityName: city, Limit: 10 });
      const list = (cities[0]?.Addresses || []).map(function (c) {
        return { ref: c.Ref, name: c.Present, area: c.AreaDescription || '' };
      });
      return { statusCode: 200, body: JSON.stringify(list) };
    }

    // --- Search warehouses ---
    if (action === 'searchWarehouse') {
      const ref = body.cityRef || '';
      if (!ref) return { statusCode: 400, body: JSON.stringify({ error: 'cityRef required' }) };
      const wh = await callNp('Address', 'getWarehouses', { CityRef: ref, Limit: 10 });
      const list = (wh || []).map(function (w) {
        return { ref: w.Ref, number: w.Number, address: w.ShortAddress || w.Description || '' };
      });
      return { statusCode: 200, body: JSON.stringify(list) };
    }

    // --- Create TTN ---
    if (action === 'create') {
      const { sender, recipient, cargo } = body;
      if (!sender || !recipient || !cargo) {
        return { statusCode: 400, body: JSON.stringify({ error: 'sender, recipient, cargo required' }) };
      }

      const props = {
        SenderPhone: sender.phone || '',
        CitySender: sender.cityRef || '',
        SenderAddress: sender.addressRef || '',
        ContactSender: sender.contactRef || '',
        SendersPhone: sender.phone || '',
        RecipientCityName: recipient.city || '',
        RecipientAddressName: recipient.address || recipient.warehouse || '',
        RecipientWarehouse: recipient.warehouse || '',
        RecipientName: (recipient.firstName + ' ' + recipient.lastName).trim(),
        RecipientType: 'PrivatePerson',
        RecipientsPhone: recipient.phone || '',
        ServiceType: 'WarehouseWarehouse',
        PaymentMethod: (cargo.codAmount > 0 ? 'Cash' : 'NonCash'),
        CargoType: 'Cargo',
        Weight: String(cargo.weight || 1),
        SeatsAmount: '1',
        Description: cargo.description || '\u0422\u043e\u0432\u0430\u0440\u0438',
        Cost: String(cargo.cost || 0),
      };

      // Add COD (наложений платіж) if needed
      if (cargo.codAmount > 0) {
        props.BackwardDeliveryData = [
          { PayerType: 'Recipient', CargoType: 'Money', RedeliveryString: String(cargo.codAmount) },
        ];
      }

      const result = await callNp('InternetDocument', 'save', props);
      const ttn = (result[0] || {}).IntDocNumber || '';

      // If orderId is provided, auto-update the order with TTN
      if (orderId && ttn) {
        await updateOrderStatus(orderId, {
          status: 'shipped',
          tracking_number: ttn,
          shipped_at: new Date().toISOString(),
        }).catch(function () {});

        const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        if (TOKEN && CHAT_ID) {
          const msg = [
            '\uD83D\uDCE6 <b>ВІДПРАВЛЕНО</b>',
            '<code>#' + orderId + '</code>',
            '',
            '\uD83D\uDE9A <b>ТТН: ' + ttn + '</b>',
            '\uD83D\uDCB0 \u041d\u0430\u043b\u043e\u0436\u0435\u043d\u0438\u0439: ' + cargo.codAmount + ' \u0433\u0440\u043d',
          ].join('\n');
          try {
            await fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
            });
          } catch (e) {}
        }

        if (recipient.email) {
          sendEmail({
            to: recipient.email,
            subject: '\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f #' + orderId + ' \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e',
            html: trackingUpdateHtml({ orderId, trackingNumber: ttn }),
          }).catch(function () {});
        }
      }

      return { statusCode: 200, body: JSON.stringify({ success: true, ttn, ref: (result[0] || {}).Ref }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (error) {
    console.error('nova-poshta error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
