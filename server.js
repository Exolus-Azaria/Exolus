#!/usr/bin/env node
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const execFileAsync = promisify(execFile);
const ROOT = __dirname;
const HOST = process.env.HERMES_UI_HOST || '127.0.0.1';
const PORT = Number(process.env.HERMES_UI_PORT || 18765);
const TOKEN_FILE = path.join(process.env.HOME, '.config', 'exolus', '.hermes-ui-token');
let token;
try { token = fs.readFileSync(TOKEN_FILE, 'utf8').trim(); }
catch (_) { token = crypto.randomBytes(32).toString('hex'); fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600, flag: 'wx' }); }
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };
function send(res, code, obj) { const body = JSON.stringify(obj); res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' }); res.end(body); }
function authorized(req) { const h = req.headers.authorization || ''; const supplied = h.startsWith('Bearer ') ? h.slice(7) : ''; return supplied.length === token.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token)); }
function readBody(req) { return new Promise((resolve, reject) => { let data=''; req.on('data', c => { data += c; if (data.length > 30000) { reject(new Error('Pesan terlalu besar (maksimum 30 KB).')); req.destroy(); } }); req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (_) { reject(new Error('JSON request tidak valid.')); } }); req.on('error', reject); }); }
async function routerStatus() {
  try {
    const r = await fetch('http://127.0.0.1:20128/v1/models', { signal: AbortSignal.timeout(3500) });
    if (!r.ok) return { ok:false, count:0, detail:`HTTP ${r.status}` };
    const d = await r.json();
    return { ok:Array.isArray(d.data), count:Array.isArray(d.data)?d.data.length:0, detail:Array.isArray(d.data)?'API merespons':'Format daftar model tidak dikenali' };
  } catch (e) { return { ok:false, count:0, detail:'Tidak dapat menjangkau 127.0.0.1:20128' }; }
}
async function hermesStatus() {
  try {
    const { stdout, stderr } = await execFileAsync('hermes', ['status'], { timeout:8000, maxBuffer:256*1024, cwd:ROOT, env:process.env });
    const output = `${stdout || ''}\n${stderr || ''}`.trim();
    const modelMatch = output.match(/(?:model|default model)\s*[:=]?\s*([^\r\n]+)/i);
    return { ok:true, detail:'Perintah hermes status berhasil', model:modelMatch ? modelMatch[1].trim().slice(0,120) : '' };
  } catch (e) {
    const msg = String(e.stderr || e.message || 'Hermes status gagal').replace(/\s+/g,' ').slice(0,180);
    return { ok:false, detail:msg };
  }
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  if (req.method === 'GET' && url.pathname === '/api/status') {
    const [hermes, router] = await Promise.all([hermesStatus(), routerStatus()]);
    return send(res, 200, { hermes:hermes.ok, hermesDetail:hermes.detail, router:router.ok, routerDetail:router.detail, modelCount:router.count, configuredModel:hermes.model || 'Dikelola oleh konfigurasi Hermes/9Router', checkedAt:new Date().toISOString() });
  }
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    if (!authorized(req)) return send(res, 401, { error:'Token backend tidak valid.' });
    let body; try { body = await readBody(req); } catch (e) { return send(res, 400, { error:e.message }); }
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) return send(res, 400, { error:'Pesan tidak boleh kosong.' });
    if (message.length > 12000) return send(res, 413, { error:'Pesan terlalu panjang (maksimum 12.000 karakter).' });
    const rawHistory = Array.isArray(body.history) ? body.history : [];
    // The browser includes the current user message in history; omit it here to avoid duplication.
    const prior = rawHistory.slice(0, -1).slice(-10).filter(x => x && typeof x.text === 'string').map(x => `${String(x.role || 'Pesan').slice(0,30)}: ${x.text.slice(0,2200)}`).join('\n');
    const persona = 'Kamu adalah Minnie, asisten AI untuk Exolus. Jawab dalam bahasa yang dipakai pengguna (utamakan bahasa Indonesia), hangat, natural, jelas, dan langsung ke inti. Pertahankan kesinambungan berdasarkan riwayat yang diberikan. Jika tidak yakin, jujur dan jangan mengarang. Pesan pengguna terbaru harus menjadi fokus jawaban.';
    const prompt = prior ? `${persona}\n\nKonteks percakapan sebelumnya:\n${prior}\n\nPesan terbaru pengguna:\n${message}` : `${persona}\n\nPesan pengguna:\n${message}`;
    try {
      const { stdout } = await execFileAsync('hermes', ['-z', prompt], { timeout:180000, maxBuffer:1024*1024, cwd:ROOT, env:process.env });
      const reply = (stdout || '').trim();
      if (!reply) return send(res, 502, { error:'Hermes tidak mengembalikan jawaban. Periksa log atau konfigurasi Hermes.' });
      return send(res, 200, { reply });
    } catch (e) {
      const timeout = e.killed || e.signal === 'SIGTERM';
      return send(res, timeout ? 504 : 502, { error: timeout ? 'Hermes melewati batas waktu 180 detik.' : 'Hermes gagal memproses pesan. Periksa `hermes status` dan uji `hermes -z` di Termux.' });
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error:'Method tidak diizinkan.' });
  let pathname;
  try { pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); }
  catch (_) { return send(res, 400, { error:'Path tidak valid.' }); }
  // Jangan pernah menyajikan file tersembunyi/secrets (mis. .hermes-ui-token)
  // melalui static file server, meskipun path masih berada di dalam ROOT.
  if (pathname.split('/').some(part => part.startsWith('.') && part !== '.' && part !== '..')) {
    return send(res, 404, { error:'Not found' });
  }
  const file = path.resolve(ROOT, '.' + pathname);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) return send(res, 403, { error:'Forbidden' });
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type':MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'Cache-Control':'no-store' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(PORT, HOST, () => {
  console.log(`Vex — Exolus AI berjalan di http://${HOST}:${PORT}`);
  console.log('Akses lokal saja (loopback). Jangan ubah HERMES_UI_HOST ke 0.0.0.0 tanpa autentikasi/jaringan aman.');
  console.log('Autentikasi UI aktif. Token disimpan secara lokal dan tidak ditampilkan di log.');
  console.log('Jangan membagikan file .hermes-ui-token atau memasukkannya ke repository.');
  console.log('Status API: /api/status memeriksa `hermes status` dan 9Router /v1/models.');
});
process.on('SIGINT', () => server.close(() => process.exit(0)));
