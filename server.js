/**
 * FengShui Oracle — Backend Server
 * - Serves index.html as static file
 * - Proxies Anthropic API requests (avoids CORS + hides API key)
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node server.js
 *   or set key in .env file
 */

const http    = require('http');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const url     = require('url');

// ── Load .env if present ─────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.trim().split('=');
    if (k && !k.startsWith('#') && !process.env[k]) {
      process.env[k] = v.join('=').replace(/^["']|["']$/g, '');
    }
  });
}

const PORT    = process.env.PORT || 3001;
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

// ── MIME types ───────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ── HTTP Server ──────────────────────────────────────────
const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Proxy: POST /api/chat → Anthropic API ──────────────
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      // Use server-side key first; fall back to client-provided key
      const clientKey  = req.headers['x-api-key'] || '';
      const effectiveKey = API_KEY || clientKey;

      if (!effectiveKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: '請設定 ANTHROPIC_API_KEY 環境變數，或在前端輸入 API Key。' } }));
        return;
      }

      let parsed;
      try { parsed = JSON.parse(body); } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Invalid JSON body' } }));
        return;
      }

      const payload = Buffer.from(JSON.stringify({
        model:      parsed.model      || 'claude-sonnet-4-6',
        max_tokens: parsed.max_tokens || 1600,
        messages:   parsed.messages   || [],
      }));

      const options = {
        hostname: 'api.anthropic.com',
        path:     '/v1/messages',
        method:   'POST',
        headers: {
          'Content-Type':    'application/json',
          'Content-Length':  payload.length,
          'x-api-key':       effectiveKey,
          'anthropic-version': '2023-06-01',
        },
      };

      const proxy = https.request(options, (apiRes) => {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
        apiRes.pipe(res);
      });

      proxy.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: `Proxy error: ${err.message}` } }));
      });

      proxy.write(payload);
      proxy.end();
    });
    return;
  }

  // ── Static files ───────────────────────────────────────
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath.replace(/\.\./g, ''));  // basic path traversal guard

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html for SPA-style routing
      fs.readFile(path.join(__dirname, 'index.html'), (e2, html) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✦ 風水羅盤 · FengShui Oracle ✦');
  console.log('');
  console.log(`  本機伺服器已啟動：http://localhost:${PORT}`);
  console.log(`  API Proxy：POST http://localhost:${PORT}/api/chat`);
  console.log('');
  if (API_KEY) {
    console.log('  ✅ ANTHROPIC_API_KEY 已載入（伺服器端）');
  } else {
    console.log('  ⚠  未設定 ANTHROPIC_API_KEY');
    console.log('     請建立 .env 檔案並加入：');
    console.log('     ANTHROPIC_API_KEY=sk-ant-...');
    console.log('     或由前端輸入 API Key 使用。');
  }
  console.log('');
});
