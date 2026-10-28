// Generatore statico senza dipendenze.
//   node build.mjs            → dist/ con link relativi (apribile anche da disco)
//   node build.mjs --pretty   → dist/ con URL "puliti" per la pubblicazione su hosting
//   node build.mjs --pretty --staging → come sopra, ma nascosto ai motori di ricerca (nuovo.elitexperience.it)
//   node build.mjs --bundle   → dist/elite-experience-prototipo.html, file unico di anteprima
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './src/config.js';
import { header, footer } from './src/components/layout.js';
import home from './src/pages/home.js';
import metodo from './src/pages/metodo.js';
import elisabetta from './src/pages/elisabetta.js';
import academy from './src/pages/academy.js';
import course from './src/pages/course.js';
import others from './src/pages/others.js';
import magazine from './src/pages/magazine.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const mode = args.includes('--bundle') ? 'bundle' : args.includes('--pretty') ? 'pretty' : 'static';
const staging = args.includes('--staging');
const dist = path.join(root, 'dist');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const coursesFile = read('src/content/courses.json');
const data = {
  media: { ...read('src/content/media.json'), ...read('src/content/media-elite-e-more.json') },
  courses: [...coursesFile.courses].sort((a, b) => a.order - b.order),
  collection: coursesFile.collection,
  faq: read('src/content/faq.json'),
  editorial: read('src/content/editorial.json'),
  practice: read('src/content/practice.json'),
};

const pages = [...home, ...metodo, ...elisabetta, ...academy, ...course(data), ...magazine(data), ...others(data)];
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Versioni WebP delle foto (create da tools/ottimizza-immagini.py in src/assets/media/opt):
// «elite-e-more/nome» → [[640, 'media/opt/elite-e-more/nome-640.webp'], …]
const variants = new Map();
(function scan(dir, rel) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { scan(path.join(dir, e.name), `${rel}${e.name}/`); continue; }
    const m = /^(.*)-(\d+)\.webp$/.exec(e.name);
    if (!m) continue;
    const key = `${rel}${m[1]}`;
    if (!variants.has(key)) variants.set(key, []);
    variants.get(key).push([Number(m[2]), `media/opt/${rel}${e.name}`]);
  }
})(path.join(root, 'src/assets/media/opt'), '');
for (const list of variants.values()) list.sort((a, b) => a[0] - b[0]);

function makeCtx(route, dirOverride) {
  const dir = (dirOverride ?? route).replace(/\/$/, '');
  return {
    mode, route, data, staging,
    href(to) {
      if (/^https?:/.test(to)) return to;
      if (to.startsWith('#')) return mode === 'bundle' ? `#/${route}@${to.slice(1)}` : to;
      const [r, hash] = to.split('#');
      if (mode === 'bundle') return `#/${r}${hash ? `@${hash}` : ''}`;
      const rel = path.posix.relative(`/${dir}`, `/${r.replace(/\/$/, '')}`) || '.';
      return `${rel}${mode === 'pretty' ? '/' : '/index.html'}${hash ? `#${hash}` : ''}`;
    },
    src(p) {
      if (mode === 'bundle') return `src="${PIXEL}" data-asset="${p}"`;
      return `src="${path.posix.relative(`/${dir}`, `/assets/${p}`)}"`;
    },
    // srcset WebP di una foto in media/ (vuoto nel file unico: lì le immagini sono incorporate una volta)
    srcset(p) {
      if (mode === 'bundle' || !p.startsWith('media/')) return '';
      const list = variants.get(p.slice(6).replace(/\.[^.]+$/, ''));
      return list ? list.map(([w, f]) => `${path.posix.relative(`/${dir}`, `/assets/${f}`)} ${w}w`).join(', ') : '';
    },
    // Percorso semplice di un file in assets/ (PDF, video): non incorporato nel file unico.
    asset(p) {
      if (mode === 'bundle') return `assets/${p}`;
      return path.posix.relative(`/${dir}`, `/assets/${p}`);
    },
    url: (r) => `${site.url}/${r}`,
  };
}

const css = ['tokens', 'base', 'layout', 'components', 'sections', 'blocks', 'magazine']
  .map((f) => fs.readFileSync(path.join(root, 'src/styles', `${f}.css`), 'utf8')).join('\n');
// Corsivo e firma: file a parte, caricato dopo la prima schermata (vedi fonts-late.css)
const fontsLate = fs.readFileSync(path.join(root, 'src/styles/fonts-late.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'src/scripts/site.js'), 'utf8');
// Versione di stili e script nei link: dopo un aggiornamento il browser non usa la copia in cache
const version = crypto.createHash('sha1').update(css + fontsLate + js).digest('hex').slice(0, 8);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const s = path.join(from, f), d = path.join(to, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', woff2: 'font/woff2', svg: 'image/svg+xml' };
const dataUri = (p) => `data:${mime[p.split('.').pop()]};base64,${fs.readFileSync(path.join(root, 'src/assets', p)).toString('base64')}`;

if (mode !== 'bundle') {
  fs.rmSync(dist, { recursive: true, force: true });
  copyDir(path.join(root, 'src/assets'), path.join(dist, 'assets'));
  fs.writeFileSync(path.join(dist, 'assets/site.css'), css);
  fs.writeFileSync(path.join(dist, 'assets/fonts-late.css'), fontsLate);
  fs.writeFileSync(path.join(dist, 'assets/site.js'), js);
  const urls = [];
  for (const p of pages) {
    const ctx = makeCtx(p.route, p.file ? '' : undefined);
    const out = p.render(ctx);
    const file = path.join(dist, p.file || `${p.route}index.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, out.html.replace(/(assets\/(?:site|fonts-late)\.(?:css|js))"/g, `$1?v=${version}"`));
    if (!out.noindex) urls.push({ loc: `${site.url}/${p.route}`, lastmod: out.modified || out.published });
  }
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`);
  // Redirect 301 dai vecchi indirizzi WordPress: Netlify/Cloudflare Pages (_redirects) e Apache (.htaccess)
  const redirects = read('src/content/redirects.json').redirects;
  fs.writeFileSync(path.join(dist, '_redirects'), redirects.map((r) => `${r.from} ${r.to} 301`).join('\n') + '\n');
  const rx = (from) => `^${from.replace(/[.]/g, '\\.').replace(/\/\*$/, '/.*').replace(/\/$/, '/?')}$`;
  const hide = staging ? '# Versione di prova: nascosta ai motori di ricerca\n<IfModule mod_headers.c>\nHeader set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n\n' : '';
  fs.writeFileSync(path.join(dist, '.htaccess'), `${hide}# Redirect 301 dai vecchi indirizzi del sito WordPress (generato da src/content/redirects.json)\n${redirects.map((r) => `RedirectMatch 301 ${rx(r.from)} ${r.to}`).join('\n')}\n\nErrorDocument 404 /404.html\n`);
  fs.writeFileSync(path.join(dist, 'robots.txt'), staging ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
  console.log(`${pages.length} pagine generate in dist/ (${mode}${staging ? ', prova nascosta' : ''})`);
} else {
  // File unico: tutte le pagine come sezioni, navigazione con #/percorso, immagini e font incorporati una sola volta
  const sections = pages.filter((p) => !p.file).map((p) => {
    const out = p.render(makeCtx(p.route));
    const inner = out.main.replace(/^<main id="contenuto" class="([^"]*)">/, '').replace(/<\/main>$/, '');
    return `<section class="route ${out.bodyClass || ''}" data-route="${p.route}" data-title="${out.title.replace(/"/g, '&quot;')}" hidden>${inner}</section>`;
  });
  const shellCtx = makeCtx('');
  const used = new Set();
  const all = sections.join('') + header(shellCtx) + footer(shellCtx);
  for (const m of all.matchAll(/data-asset="([^"]+)"/g)) used.add(m[1]);
  const assets = Object.fromEntries([...used].map((p) => [p, dataUri(p)]));
  const inlineCss = (fontsLate + css).replace(/url\(["']?([^)"']+\.(woff2|png|jpg|svg))["']?\)/g, (m, p) => `url("${dataUri(p)}")`);
  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Élite Experience — Prototipo del sito</title>
<meta name="robots" content="noindex">
<style>${inlineCss}</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body class="notes-on is-bundle">
${header(shellCtx)}
<main id="contenuto">${sections.join('\n')}</main>
${footer(shellCtx)}
<script>window.__ASSETS=${JSON.stringify(assets)};</script>
<script>${js}</script>
</body>
</html>`;
  fs.mkdirSync(dist, { recursive: true });
  fs.writeFileSync(path.join(dist, 'elite-experience-prototipo.html'), html);
  console.log(`File unico: dist/elite-experience-prototipo.html (${Math.round(html.length / 1024)} KB, ${sections.length} pagine)`);
}
