// Cloudflare Pages Function — POST /api/sync
// Tarvitsee: D1-tietokantasidoksen nimellä "DB" ja ympäristömuuttujan "SYNC_TOKEN".

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

async function ensureTables(db) {
  await db.exec("CREATE TABLE IF NOT EXISTS entries (id TEXT PRIMARY KEY, data TEXT NOT NULL, updatedAt INTEGER NOT NULL, deleted INTEGER DEFAULT 0)");
  await db.exec("CREATE TABLE IF NOT EXISTS places (id TEXT PRIMARY KEY, data TEXT NOT NULL, updatedAt INTEGER NOT NULL, deleted INTEGER DEFAULT 0)");
}

async function upsert(db, table, recs) {
  if (!Array.isArray(recs)) return;
  const now = Date.now();
  for (const r of recs) {
    if (!r || !r.id) continue;
    const ua = r.updatedAt || now;
    const del = r.deleted ? 1 : 0;
    await db.prepare(
      "INSERT INTO " + table + " (id, data, updatedAt, deleted) VALUES (?1, ?2, ?3, ?4) " +
      "ON CONFLICT(id) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt, deleted = excluded.deleted " +
      "WHERE excluded.updatedAt >= " + table + ".updatedAt"
    ).bind(r.id, JSON.stringify(r), ua, del).run();
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) return json({ error: 'no_database_binding' }, 500);
  if (!env.SYNC_TOKEN) return json({ error: 'no_token_configured' }, 500);

  let body;
  try { body = await request.json(); }
  catch (e) { return json({ error: 'bad_json' }, 400); }

  if (body.token !== env.SYNC_TOKEN) return json({ error: 'unauthorized' }, 401);

  try {
    await ensureTables(env.DB);
    await upsert(env.DB, 'entries', body.entries);
    await upsert(env.DB, 'places', body.places);

    const ent = await env.DB.prepare("SELECT data FROM entries WHERE deleted = 0").all();
    const pl = await env.DB.prepare("SELECT data FROM places WHERE deleted = 0").all();

    return json({
      entries: ent.results.map(r => JSON.parse(r.data)),
      places: pl.results.map(r => JSON.parse(r.data)),
      serverTime: Date.now()
    });
  } catch (e) {
    return json({ error: 'server_error', message: String(e) }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: true, info: 'Ajopäiväkirja sync API. Use POST.' });
}
