import { DurableObject } from 'cloudflare:workers';
import { validPublicName } from '../app/lib/target-rush';
import { verifyRecord } from './verify';

const allowed = new Set(['https://hanyuu.lol', 'https://www.hanyuu.lol']);
async function boundedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 20000) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const merged = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(merged);
}
const json = (data, status = 200) => Response.json(data, { status });
export class Ranking extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, seed INTEGER NOT NULL, ip TEXT NOT NULL, created INTEGER NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS scores (session TEXT PRIMARY KEY, name TEXT NOT NULL, score INTEGER NOT NULL, hits INTEGER NOT NULL, created INTEGER NOT NULL)');
    for (const table of ['sessions', 'scores']) if (!this.sql.exec(`PRAGMA table_info(${table})`).toArray().some(c => c.name === 'game')) this.sql.exec(`ALTER TABLE ${table} ADD COLUMN game TEXT NOT NULL DEFAULT 'rush'`);
    this.sql.exec('CREATE TABLE IF NOT EXISTS receipts (id TEXT PRIMARY KEY, game TEXT NOT NULL, ip TEXT NOT NULL, score INTEGER NOT NULL, created INTEGER NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS limits (ip TEXT NOT NULL, bucket INTEGER NOT NULL, kind TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(ip, bucket, kind))');
  }
  async alarm() {
    this.sql.exec('DELETE FROM sessions');
    this.sql.exec('DELETE FROM receipts');
    this.sql.exec('DELETE FROM limits');
  }
  moderate(game, name) {
    this.sql.exec('DELETE FROM scores WHERE game=? AND name=?', game, name);
    return {ok:true};
  }
  limit(ip, kind, maximum) {
    const bucket = Math.floor(Date.now() / 600000);
    this.sql.exec('DELETE FROM limits WHERE bucket < ?', bucket - 1);
    this.sql.exec('INSERT INTO limits VALUES (?, ?, ?, 1) ON CONFLICT(ip,bucket,kind) DO UPDATE SET count=count+1', ip, bucket, kind);
    return this.sql.exec('SELECT count FROM limits WHERE ip=? AND bucket=? AND kind=?', ip, bucket, kind).one().count <= maximum;
  }
  async handle(path, body, ip, game) {
    const now = Date.now();
    if (path === '/leaderboard') return { status: 200, data: { entries: this.sql.exec('SELECT name,score,hits,created FROM (SELECT name,score,hits,created,ROW_NUMBER() OVER (PARTITION BY game,name ORDER BY score DESC,created ASC) AS position FROM scores WHERE game=?) WHERE position=1 ORDER BY score DESC,created ASC LIMIT 50', game).toArray() } };
    await this.ctx.storage.setAlarm(now + 900000);
    this.sql.exec('DELETE FROM sessions WHERE created < ?', now - 720000);
    this.sql.exec('DELETE FROM receipts WHERE created < ?', now - 120000);
    if (path === '/sessions') {
      if (!this.limit(ip, 'start', 12)) return { status: 429, data: { error: 'RATE_LIMIT' } };
      const id = crypto.randomUUID();
      const seed = crypto.getRandomValues(new Uint32Array(1))[0];
      this.sql.exec('INSERT INTO sessions VALUES (?, ?, ?, ?, ?)', id, seed, ip, now, game);
      return { status: 201, data: { id, seed, game } };
    }
    if (!this.limit(ip, 'submit', 10)) return { status: 429, data: { error: 'RATE_LIMIT' } };
    if (!body || typeof body.id !== 'string' || body.id.length !== 36 || !validPublicName(body.name)) return { status: 400, data: { error: 'INVALID_INPUT' } };
    const session = this.sql.exec('SELECT * FROM sessions WHERE id=? AND ip=? AND game=?', body.id, ip, game).toArray()[0];
    if (!session) {
      // A lost response can be retried safely without registering the result twice.
      const saved = this.sql.exec('SELECT score FROM receipts WHERE id=? AND ip=? AND game=?', body.id, ip, game).toArray()[0];
      return saved ? { status: 200, data: saved } : { status: 410, data: { error: 'SESSION_EXPIRED' } };
    }
    const verified = verifyRecord(game, session.seed, body.record);
    if (!verified) return { status: 400, data: { error: 'INVALID_RECORD' } };
    if (now - session.created + 250 < verified.duration) return { status: 400, data: { error: 'ROUND_INCOMPLETE' } };
    if (now - session.created > verified.duration + 120000) return { status: 410, data: { error: 'SESSION_EXPIRED' } };
    const { score } = verified;
    if (score < 1) return { status: 400, data: { error: 'NO_HITS' } };
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('INSERT INTO scores VALUES (?, ?, ?, ?, ?, ?)', body.id, body.name, score, 0, now, game);
      this.sql.exec('INSERT INTO receipts VALUES (?, ?, ?, ?, ?)', body.id, game, ip, score, now);
      this.sql.exec('DELETE FROM sessions WHERE id=?', body.id);
      this.sql.exec('DELETE FROM scores WHERE session IN (SELECT session FROM (SELECT session,ROW_NUMBER() OVER (PARTITION BY game,name ORDER BY score DESC,created ASC) AS position FROM scores) WHERE position>1)');
      this.sql.exec('DELETE FROM scores WHERE session IN (SELECT session FROM (SELECT session,ROW_NUMBER() OVER (PARTITION BY game ORDER BY score DESC,created ASC) AS position FROM scores) WHERE position>200)');
    });
    return { status: 201, data: { score } };
  }
}
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const local = env.ALLOW_LOCAL === 'true' && ['http://127.0.0.1:3000', 'http://localhost:3000'].includes(origin);
    if (!allowed.has(origin) && !local) return json({ error: 'ORIGIN_DENIED' }, 403);
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600', 'Vary': 'Origin', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const path = new URL(request.url).pathname;
    try {
      let response;
      if (path === '/moderate' && request.method === 'POST') {
        const supplied = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
        const expected = env.MODERATION_KEY || '';
        let difference = supplied.length ^ expected.length;
        for (let i=0;i<expected.length;i++) difference |= (supplied.charCodeAt(i)||0) ^ expected.charCodeAt(i);
        if (!expected || difference !== 0) response=json({error:'UNAUTHORIZED'},401);
        else {
          const text=await boundedBody(request);
          let body;
          try {body=text===null?null:JSON.parse(text);} catch {body=null;}
          if (!body || !['rush','catch','dino'].includes(body.game) || !validPublicName(body.name)) response=json({error:'INVALID_INPUT'},400);
          else {
            const result=await env.RANKING.getByName('target-rush-v1').moderate(body.game,body.name);
            await caches.default.delete(new Request(`${new URL(request.url).origin}/_ranking-cache/${body.game}`));
            response=json(result);
          }
        }
      } else if (path === '/health' && request.method === 'GET') response = json({ ok: true });
      else if (path === '/leaderboard' && request.method === 'GET') {
        const game = new URL(request.url).searchParams.get('game') || 'rush';
        if (!['rush','catch','dino'].includes(game)) response = json({error:'INVALID_INPUT'},400);
        else {
          const key = new Request(`${new URL(request.url).origin}/_ranking-cache/${game}`);
          const cached = env.ALLOW_LOCAL !== 'true' ? await caches.default.match(key) : null;
          if (cached) response = new Response(cached.body,cached);
          else {
            const result = await env.RANKING.getByName('target-rush-v1').handle(path,null,'',game);
            response = json(result.data,result.status);
            if (env.ALLOW_LOCAL !== 'true') {const copy=response.clone();copy.headers.set('Cache-Control','public, max-age=15');ctx.waitUntil(caches.default.put(key,copy));}
          }
        }
      } else if (['/sessions', '/scores'].includes(path) && request.method === 'POST') {
        if (!request.headers.get('Content-Type')?.startsWith('application/json')) response = json({ error: 'INVALID_INPUT' }, 415);
        else {
          const text = await boundedBody(request);
          if (text === null) response = json({ error: 'INVALID_INPUT' }, 413);
          else {
            const address = request.headers.get('CF-Connecting-IP') || (env.ALLOW_LOCAL === 'true' ? 'local-test' : '');
            if (!address || !env.RATE_LIMIT_SALT) throw new Error('Rate limiter configuration is unavailable');
            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.RATE_LIMIT_SALT}:${address}`));
            const ip = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2,'0')).join('');
            let body;
            try { body = JSON.parse(text); } catch { return new Response(JSON.stringify({ error: 'INVALID_INPUT' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }); }
            if (!['rush', 'catch', 'dino'].includes(body?.game)) return new Response(JSON.stringify({error:'INVALID_INPUT'}), {status:400,headers:{...cors,'Content-Type':'application/json'}});
            const result = await env.RANKING.getByName('target-rush-v1').handle(path, body, ip, body.game);
            response = json(result.data, result.status);
            if (path === '/scores' && result.status < 300 && env.ALLOW_LOCAL !== 'true') await caches.default.delete(new Request(`${new URL(request.url).origin}/_ranking-cache/${body.game}`));
          }
        }
      } else response = json({ error: 'NOT_FOUND' }, 404);
      for (const [name, value] of Object.entries(cors)) response.headers.set(name, value);
      return response;
    } catch (error) {
      console.error('Ranking request failed', { path, method: request.method, cause: error instanceof Error ? error.name : 'UnknownError' });
      return new Response(JSON.stringify({ error: 'SERVICE_UNAVAILABLE' }), { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  },
};
