// Cloudflare Pages Function: /api/data
// Auth: relies on Cloudflare Access. The request carries the header
// `Cf-Access-Authenticated-User-Email` when the visitor is authenticated.
// Storage: Cloudflare D1 bound as `DB`.

function getEmail(request) {
  return request.headers.get('Cf-Access-Authenticated-User-Email') || '';
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestGet({ request, env }) {
  const email = getEmail(request);
  if (!email) return json({ error: 'unauthorized' }, 401);
  const row = await env.DB.prepare(
    'SELECT data, updated_at FROM user_data WHERE email = ?1'
  ).bind(email).first();
  return json({
    email,
    data: row ? JSON.parse(row.data) : {},
    updated_at: row ? row.updated_at : 0,
  });
}

export async function onRequestPut({ request, env }) {
  const email = getEmail(request);
  if (!email) return json({ error: 'unauthorized' }, 401);
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'invalid json' }, 400); }
  if (!body || typeof body.data !== 'object') {
    return json({ error: 'missing data object' }, 400);
  }
  const now = Date.now();
  const serialized = JSON.stringify(body.data);
  await env.DB.prepare(
    `INSERT INTO user_data (email, data, updated_at)
     VALUES (?1, ?2, ?3)
     ON CONFLICT(email) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).bind(email, serialized, now).run();
  return json({ ok: true, updated_at: now });
}
