import { guard, esc, parseBody, okResponse, errorResponse } from '../_lib/utils.js';
import { sendEmail } from '../_lib/email.js';
import { RATE_LIMIT, FIELD_LIMITS, ORDER_LIMITS } from '../_lib/constants.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return errorResponse(405, 'Method Not Allowed');

  const blocked = guard(request, env, RATE_LIMIT.CONTACT);
  if (blocked) return blocked;

  let parsed = await parseBody(request, ORDER_LIMITS.MAX_CONTACT_BODY);
  if (parsed.error) return errorResponse(400, parsed.error);
  const body = parsed.data;

  const name = (body.name || '').replace(/[<>"']/g, '').slice(0, FIELD_LIMITS.NAME).trim();
  const email = (body.email || '').replace(/[<>"']/g, '').slice(0, FIELD_LIMITS.EMAIL).trim();
  const subject = (body.subject || '').replace(/[<>"']/g, '').slice(0, FIELD_LIMITS.SUBJECT).trim();
  const message = (body.message || '').replace(/[<>"']/g, '').slice(0, FIELD_LIMITS.MESSAGE).trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse(400, 'Valid email required');
  if (!message) return errorResponse(400, 'Message required');

  // Telegram notification
  const tgToken = env.TELEGRAM_BOT_TOKEN, tgChat = env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChat) {
    const tgMsg = `📬 <b>ПОВІДОМЛЕННЯ</b>\n\n👤 ${esc(name) || 'Анонім'}\n📧 ${esc(email)}\n📋 ${esc(subject) || 'Без теми'}\n\n${esc(message)}`;
    fetch('https://api.telegram.org/bot' + tgToken + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: tgChat, text: tgMsg, parse_mode: 'HTML' }) }).catch(() => {});
  }

  // Email notification to store
  const to = env.CONTACT_EMAIL || env.EMAIL_SMTP_USER || 'buksy.shop@gmail.com';
  sendEmail(env, {
    to,
    subject: 'Нове повідомлення: ' + (subject || 'Без теми') + ' — BUKSY',
    html: `<h2>Нове повідомлення з сайту</h2><p><strong>Ім'я:</strong> ${esc(name) || '—'}</p><p><strong>Email:</strong> ${esc(email)}</p><p><strong>Тема:</strong> ${esc(subject) || '—'}</p><p><strong>Повідомлення:</strong></p><blockquote style="padding:12px;background:#f5f5f5;border-left:3px solid #b10006">${esc(message).replace(/\n/g, '<br>')}</blockquote>`,
  }).catch(() => {});

  return okResponse({ success: true });
}
