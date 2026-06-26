const rateMap = new Map();
function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.ts > 60000) {
    rateMap.set(ip, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  entry.ts = now;
  return true;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRate(ip)) return new Response(JSON.stringify({ error: 'Too many attempts' }), {
    status: 429, headers: { 'Content-Type': 'application/json' },
  });

  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403, headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {}
  }

  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const login = params.get('login') || '';
    const password = params.get('password') || '';

    const adminLogin = env.ADMIN_LOGIN || 'buksy';
    const adminPass = env.ADMIN_PASSWORD;
    const githubPat = env.GITHUB_PAT || '';

    if (login !== adminLogin || !adminPass || password !== adminPass) {
      return new Response(JSON.stringify({ error: 'Невірний логін або пароль' }), {
        status: 401, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!githubPat) {
      return new Response(JSON.stringify({ error: 'GITHUB_PAT не налаштовано' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ token: githubPat }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
