const { esc, sanitize, guard, validateEmail, parseBody } = require('./_utils');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const blocked = guard(event, 5);
  if (blocked) return blocked;

  var parsed = parseBody(event, 16384);
  if (parsed.error) {
    return { statusCode: 400, body: JSON.stringify({ error: parsed.error }) };
  }
  var body = parsed.data;

  try {
    var name = body.name;
    var email = body.email;
    var subject = body.subject;
    var message = body.message;

    if (!email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and message are required' }) };
    }

    if (!validateEmail(email)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email format' }) };
    }

    if (message.length > 4096) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Message too long (max 4096 chars)' }) };
    }

    const safeEmail = sanitize(String(email), 256);
    const safeMessage = sanitize(message, 4096);
    const safeName = name ? sanitize(String(name), 128) : '';
    const safeSubject = subject ? sanitize(String(subject), 256) : '';

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (TOKEN && CHAT_ID) {
      const msg = [
        '\u2709\uFE0F <b>НОВА ЗАЯВКА</b>',
        '',
        safeName ? '\uD83D\uDC64 <b>' + esc(safeName) + '</b>' : '\uD83D\uDC64 <b>—</b>',
        '\uD83D\uDCE7 ' + esc(safeEmail),
        safeSubject ? '\uD83D\uDCDD ' + esc(safeSubject) : '',
        '',
        safeMessage ? '\uD83D\uDCAC ' + esc(safeMessage) : '',
      ].filter(Boolean).join('\n');

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' }),
        });
        if (!tgRes.ok) console.error('Telegram contact notification failed:', tgRes.status);
      } catch (err) {
        console.error('Telegram contact notification failed:', err.message);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Message received. We will get back to you soon.' }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
