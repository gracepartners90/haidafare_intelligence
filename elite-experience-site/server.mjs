// Server dell'anteprima di revisione (es. Railway): serve dist/ senza dipendenze.
//   npm run build && npm start
// L'anteprima è nascosta: nessuna indicizzazione (X-Robots-Tag e robots.txt) e, se è
// impostata la variabile PREVIEW_PASSWORD, accesso protetto da password (utente
// PREVIEW_USER, predefinito "elite"). Per il sito definitivo si usa invece
// `npm run build:deploy` su un hosting statico.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.env.PORT) || 4180;
const user = process.env.PREVIEW_USER || 'elite';
const password = process.env.PREVIEW_PASSWORD || '';

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.pdf': 'application/pdf',
};

// Confronto a tempo costante delle credenziali
const digest = (s) => crypto.createHash('sha256').update(s).digest();
const expected = digest(`${user}:${password}`);
function authorized(req) {
  if (!password) return true;
  const m = /^Basic (.+)$/.exec(req.headers.authorization || '');
  if (!m) return false;
  return crypto.timingSafeEqual(digest(Buffer.from(m[1], 'base64').toString()), expected);
}

// Percorso richiesto → { file } in dist/ (cartella = index.html), { redirect } per una cartella
// senza barra finale (i link relativi delle pagine la richiedono), null se fuori da dist/ o assente
function resolve(urlPath) {
  const [pathname, query] = urlPath.split('?');
  let p;
  try { p = decodeURIComponent(pathname); } catch { return null; }
  const file = path.join(root, path.normalize(p));
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  try {
    const st = fs.statSync(file);
    if (st.isFile()) return { file };
    if (st.isDirectory() && !pathname.endsWith('/')) return { redirect: `${pathname}/${query ? `?${query}` : ''}` };
    if (fs.statSync(path.join(file, 'index.html')).isFile()) return { file: path.join(file, 'index.html') };
  } catch { /* file assente */ }
  return null;
}

function send(req, res, status, file, headers = {}) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(status, {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Cache-Control': ['.html', '.css', '.js'].includes(ext) ? 'no-cache' : 'public, max-age=600',
    ...headers,
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url === '/healthz') return res.end('ok');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  if (req.url === '/robots.txt') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('User-agent: *\nDisallow: /\n'); }
  if (!authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Anteprima Elite Experience", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Anteprima riservata.');
  }
  const hit = resolve(req.url);
  if (hit && hit.redirect) { res.writeHead(301, { Location: hit.redirect }); return res.end(); }
  if (hit) return send(req, res, 200, hit.file);
  // 404 a qualsiasi profondità: i percorsi relativi della pagina partono dalla radice
  const notFound = path.join(root, '404.html');
  if (!fs.existsSync(notFound)) { res.writeHead(404); return res.end(); }
  res.writeHead(404, { 'Content-Type': types['.html'], 'Cache-Control': 'no-cache' });
  res.end(req.method === 'HEAD' ? undefined : fs.readFileSync(notFound, 'utf8').replace('<head>', '<head><base href="/">'));
}).listen(port, () => console.log(`Anteprima su http://localhost:${port}${password ? ' (protetta da password)' : ''}`));
