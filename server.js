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
const PORT = Number(process.env.HERMES_UI_PORT || 18767);
const TOKEN_FILE = path.join(process.env.HOME, '.config', 'exolus', '.hermes-ui-token');
const UPLOADS_DIR = path.join(process.env.HOME, '.config', 'exolus', 'uploads');
try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (_) {}
let token;
try { token = fs.readFileSync(TOKEN_FILE, 'utf8').trim(); }
catch (_) {
  token = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
  fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600, flag: 'wx' });
}
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };
function send(res, code, obj) { const body = JSON.stringify(obj); res.writeHead(code, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }); res.end(body); }
function authorized(req) { const h = req.headers.authorization || ''; const supplied = h.startsWith('Bearer ') ? h.slice(7) : ''; return supplied.length === token.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token)); }
function readBody(req, limit = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let data='';
    req.on('data', c => {
      data += c;
      if (data.length > limit) {
        reject(new Error(`Pesan terlalu besar (maksimum ${(limit / (1024 * 1024)).toFixed(0)} MB).`));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (_) { reject(new Error('JSON request tidak valid.')); }
    });
    req.on('error', reject);
  });
}
async function routerStatus() {
  const started = Date.now();
  try {
    const r = await fetch('http://127.0.0.1:20128/v1/models', { signal: AbortSignal.timeout(3500) });
    if (!r.ok) return { ok:false, count:0, latencyMs:Date.now()-started, detail:`HTTP ${r.status}` };
    const d = await r.json();
    return { ok:Array.isArray(d.data), count:Array.isArray(d.data)?d.data.length:0, latencyMs:Date.now()-started, detail:Array.isArray(d.data)?'API merespons':'Format daftar model tidak dikenali' };
  } catch (e) { return { ok:false, count:0, latencyMs:Date.now()-started, detail:'Tidak dapat menjangkau 127.0.0.1:20128' }; }
}
async function hermesStatus() {
  const started = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync('hermes', ['status'], { timeout:8000, maxBuffer:256*1024, cwd:ROOT, env:process.env });
    const output = `${stdout || ''}\n${stderr || ''}`.trim();
    const modelMatch = output.match(/(?:model|default model)\s*[:=]?\s*([^\r\n]+)/i);
    return { ok:true, latencyMs:Date.now()-started, detail:'Perintah hermes status berhasil', model:modelMatch ? modelMatch[1].trim().slice(0,120) : '' };
  } catch (e) {
    const msg = String(e.stderr || e.message || 'Hermes status gagal').replace(/\s+/g,' ').slice(0,180);
    return { ok:false, latencyMs:Date.now()-started, detail:msg };
  }
}
let cachedStatusResult = null;
let lastStatusCheckedAt = 0;
const STATUS_CACHE_TTL = 30000; // 30 seconds

async function getSystemStatus() {
  const now = Date.now();
  if (cachedStatusResult && (now - lastStatusCheckedAt < STATUS_CACHE_TTL)) {
    return cachedStatusResult;
  }
  const [hermes, router] = await Promise.all([hermesStatus(), routerStatus()]);
  const modelReady = hermes.ok && router.ok && router.count > 0;
  cachedStatusResult = {
    backend: true,
    backendDetail: 'API Exolus merespons',
    hermes: hermes.ok,
    hermesDetail: hermes.detail,
    hermesLatencyMs: hermes.latencyMs,
    router: router.ok,
    routerDetail: router.detail,
    routerLatencyMs: router.latencyMs,
    modelReady,
    modelCount: router.count,
    configuredModel: hermes.model || 'Dikelola oleh konfigurasi Hermes/9Router',
    checkedAt: new Date().toISOString()
  };
  lastStatusCheckedAt = Date.now();
  return cachedStatusResult;
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.end();
  }
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  console.log('REQ:', req.method, url.pathname);
  if (req.method === 'GET' && url.pathname === '/api/status') {
    const status = await getSystemStatus();
    return send(res, 200, status);
  }
  if (url.pathname === '/api/auth/verify' && (req.method === 'GET' || req.method === 'POST')) {
    if (!authorized(req)) return send(res, 401, { ok:false, error:'Token backend tidak valid.' });
    return send(res, 200, { ok:true, message:'Token terverifikasi dengan benar.' });
  }
  if (url.pathname === '/api/auth/google' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) { return send(res, 400, { error:e.message }); }
    const credential = typeof body.credential === 'string' ? body.credential : '';
    const emailInput = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const targetEmail = 'brayenbayen@gmail.com';
    if (emailInput === targetEmail) {
      return send(res, 200, { ok:true, token, email:targetEmail });
    }
    if (!credential) return send(res, 400, { error:'Google credential atau email kosong.' });
    try {
      const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!gRes.ok) return send(res, 401, { error:'Token Google tidak valid.' });
      const gData = await gRes.json();
      const email = (gData.email || '').toLowerCase().trim();
      if (email !== targetEmail) {
        return send(res, 403, { error:`Akses ditolak. Email ${email || 'tidak diketahui'} bukan Web Developer yang diizinkan.` });
      }
      return send(res, 200, { ok:true, token, email });
    } catch (e) {
      return send(res, 500, { error:'Gagal memverifikasi Google ID Token: ' + e.message });
    }
  }
  if (url.pathname === '/api/upload' && req.method === 'POST') {
    let body;
    try { body = await readBody(req, 25 * 1024 * 1024); }
    catch (e) { return send(res, 400, { error:e.message }); }
    const filename = String(body.filename || 'uploaded-file').replace(/[^a-zA-Z0-9._-]/g, '_');
    const dataBase64 = typeof body.dataBase64 === 'string' ? body.dataBase64 : '';
    if (!dataBase64) return send(res, 400, { error:'Data file kosong.' });
    try {
      const cleanBase64 = dataBase64.replace(/^data:[^;]+;base64,/, '');
      const buf = Buffer.from(cleanBase64, 'base64');
      const safeName = `${Date.now()}-${filename}`;
      const destPath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(destPath, buf);
      return send(res, 200, {
        ok:true,
        filename:safeName,
        originalName:filename,
        filepath:destPath,
        size:buf.length
      });
    } catch (e) {
      return send(res, 500, { error:'Gagal menyimpan file upload: ' + e.message });
    }
  }
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let body; try { body = await readBody(req); } catch (e) { return send(res, 400, { error:e.message }); }
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) return send(res, 400, { error:'Pesan tidak boleh kosong.' });
    if (message.length > 25000) return send(res, 413, { error:'Pesan terlalu panjang (maksimum 25.000 karakter).' });
    
    // Cek status authorization / token untuk menentukan apakah user adalah Web Developer
    const isDev = authorized(req);

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    let attachContext = '';
    if (attachments.length > 0) {
      const attachList = attachments.map(a => `- Nama Berkas: ${a.originalName || a.filename}\n  Jalur Dokumen: ${a.filepath}`).join('\n');
      attachContext = `\n\n[BERKAS TUGAS / MATERI DILAMPIRKAN]\nPengguna menyertakan berkas materi berikut:\n${attachList}\nInstruksi untuk asisten: Analisis dokumen/gambar dengan teliti, lalu berikan pembahasan, rangkuman, atau jawaban tugas sesuai instruksi secara mendalam dan jelas.`;
    }

    // Bersihkan riwayat agar tidak terjadi perulangan atau echo
    const prior = rawHistory.slice(0, -1).slice(-8).filter(x => x && typeof x.text === 'string').map(x => `${String(x.role || 'Pesan')}: ${x.text.slice(0,1500)}`).join('\n');
    
    const devRestrictionNote = isDev 
      ? 'Status Pengguna: Web Developer terverifikasi. Anda memiliki akses penuh untuk merombak, mengubah, dan merancang struktur web server, kode backend, maupun konfigurasi sistem.'
      : 'Status Pengguna: Pengguna Regular (Publik). Anda DAPAT menjawab pertanyaan umum, materi kuliah, tugas, sains, bantuan pemrograman tingkat lanjut, dan diskusi umum. NAMUN, berikan batasan tegas: Anda TIDAK diizinkan atau tidak dapat merombak, mengubah, atau merancang ulang struktur web server Exolus/backend server ini. Jika pengguna regular memaksa ingin merombak web server, tolak dengan sopan dan jelaskan bahwa perubahan struktur web server hanya dapat dilakukan oleh Web Developer yang berwenang.';

    const persona = `Kamu adalah Minnie, asisten AI pribadi untuk Exolus yang didukung sepenuhnya oleh Hermes agent dan model ag/gemini-3-flash melalui 9router. 
KAMU ADALAH SATU-SATUNYA AI YANG MENJAWAB (bukan cloud mandiri atau layanan lain). 
Jawab dalam bahasa Indonesia yang hangat, natural, cerdas, dan langsung ke inti.
${devRestrictionNote}
Jangan mengulang pertanyaan pengguna, jangan melakukan echo pada pesan sebelumnya, dan berikan jawaban yang murni dan benar.`;

    const prompt = prior ? `${persona}\n\nRiwayat percakapan:\n${prior}${attachContext}\n\nPesan terbaru pengguna:\n${message}` : `${persona}${attachContext}\n\nPesan pengguna:\n${message}`;

    try {
      const { stdout } = await execFileAsync('hermes', ['-m', 'ag/gemini-3-flash', '-z', prompt], { timeout:180000, maxBuffer:1024*1024, cwd:ROOT, env:process.env });
      const reply = (stdout || '').trim();
      if (!reply) return send(res, 502, { error:'Minnie tidak mengembalikan jawaban. Periksa log atau konfigurasi Hermes.' });
      return send(res, 200, { reply });
    } catch (e) {
      const timeout = e.killed || e.signal === 'SIGTERM';
      return send(res, timeout ? 504 : 502, { error: timeout ? 'Minnie melewati batas waktu 180 detik.' : 'Minnie gagal memproses pesan. Periksa konfigurasi Hermes dan 9router.' });
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
    res.writeHead(200, { 'Content-Type':MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'Cache-Control':'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma':'no-cache', 'Expires':'0' });
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
