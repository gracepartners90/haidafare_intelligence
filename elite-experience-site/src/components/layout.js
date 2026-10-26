import { site, nav, headerCta } from '../config.js';
import { esc, btn, tbd } from './core.js';

const external = (url) => `href="${url}" target="_blank" rel="noopener"`;

function navItems(ctx, { mobile = false } = {}) {
  return nav.map((item) => {
    const current = ctx.route === item.to || (item.to && ctx.route.startsWith(item.to) && item.to !== '');
    if (!item.children) {
      return `<li><a href="${ctx.href(item.to)}"${current ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`;
    }
    const courses = item.courses ? ctx.data.courses.map((c) => ({ label: c.name, to: `academy/formazione-online/${c.slug}/` })) : [];
    const id = mobile ? 'm-academy' : 'd-academy';
    return `<li class="has-sub${current ? ' is-current' : ''}">
      <button type="button" class="sub-toggle" aria-expanded="false" aria-controls="${id}">${esc(item.label)}<i aria-hidden="true"></i></button>
      <div class="sub" id="${id}">
        <div class="sub__col">
          <p class="sub__label">Academy</p>
          <ul>${item.children.map((c) => `<li><a href="${ctx.href(c.to)}">${esc(c.label)}</a></li>`).join('')}</ul>
          <a class="sub__ext" ${external(site.academyUrl)}>Piattaforma Academy ↗</a>
        </div>
        <div class="sub__col">
          <p class="sub__label">Schede dei corsi online</p>
          <ul>${courses.map((c) => `<li><a href="${ctx.href(c.to)}">${esc(c.label)}</a></li>`).join('')}</ul>
        </div>
      </div>
    </li>`;
  }).join('');
}

export function header(ctx) {
  return `<a class="skip" href="#contenuto">Vai al contenuto</a>
<header class="hdr" data-hdr>
  <div class="hdr__in">
    <a class="hdr__logo" href="${ctx.href('')}" aria-label="Élite Experience — Home">
      <img class="hdr__logo-dark" ${ctx.src('brand/logo-elite-experience.png')} width="1818" height="246" alt="Élite Experience">
      <img class="hdr__logo-light" ${ctx.src('brand/logo-elite-experience-white.png')} width="1818" height="246" alt="" aria-hidden="true">
    </a>
    <nav class="hdr__nav" aria-label="Navigazione principale"><ul>${navItems(ctx)}</ul></nav>
    ${btn(ctx, { ...headerCta, variant: 'primary', cls: 'btn--sm hdr__cta' })}
    <button class="hdr__burger" type="button" aria-expanded="false" aria-controls="menu-mobile" data-burger><span>Menu</span><i aria-hidden="true"></i></button>
  </div>
  <div class="drawer" id="menu-mobile" hidden data-drawer>
    <nav aria-label="Navigazione mobile"><ul>${navItems(ctx, { mobile: true })}</ul></nav>
    ${btn(ctx, { ...headerCta, variant: 'primary' })}
  </div>
</header>`;
}

export function footer(ctx) {
  const c = site.contacts;
  const val = (v, label) => (v ? esc(v) : tbd(label));
  const social = Object.entries(site.social).map(([k, v]) => `<li>${v ? `<a ${external(v)}>${esc(k[0].toUpperCase() + k.slice(1))}</a>` : `${esc(k[0].toUpperCase() + k.slice(1))} ${tbd('link')}`}</li>`).join('');
  return `<footer class="ftr">
  <div class="wrap">
    <div class="ftr__top">
      <div class="ftr__brand">
        <img ${ctx.src('brand/logo-elite-experience-white.png')} width="1818" height="246" alt="Élite Experience" loading="lazy">
        <p>${esc(site.definition)}</p>
        <p class="ftr__founder">Metodo ideato da Elisabetta Tancini</p>
      </div>
      <nav class="ftr__nav" aria-label="Footer">
        <div><p class="ftr__h">Élite Experience</p><ul>
          <li><a href="${ctx.href('metodo-elite/')}">Il Metodo Élite</a></li>
          <li><a href="${ctx.href('elisabetta-tancini/')}">Elisabetta Tancini</a></li>
          <li><a href="${ctx.href('academy/#percorsi')}">Per i saloni</a></li>
          <li><a href="${ctx.href('elisabetta-tancini/#collaborazioni')}">Collaborazioni</a></li>
          <li><a href="${ctx.href('elite-e-more/')}">Élite &amp; More</a></li>
        </ul></div>
        <div><p class="ftr__h">Academy</p><ul>
          <li><a href="${ctx.href('academy/formazione-online/')}">Formazione Online</a></li>
          <li><a href="${ctx.href('academy/formazione-in-presenza/')}">Formazione in Presenza</a></li>
          ${ctx.data.courses.map((co) => `<li><a href="${ctx.href(`academy/formazione-online/${co.slug}/`)}">${esc(co.name)}</a></li>`).join('')}
          <li><a ${external(site.academyUrl)}>Piattaforma Academy ↗</a></li>
        </ul></div>
        <div><p class="ftr__h">Contatti</p><ul class="ftr__contacts">
          <li>Sede: ${esc(site.city)}${c.address ? ` — ${esc(c.address)}` : ` ${tbd('indirizzo')}`}</li>
          <li>Email: ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : tbd('da inserire')}</li>
          <li>Telefono: ${val(c.phone, 'da inserire')}</li>
          <li><a href="${ctx.href('contatti/')}">Richiedi informazioni</a></li>
        </ul>
        <ul class="ftr__social">${social}</ul></div>
      </nav>
    </div>
    <div class="ftr__base">
      <p>© 2026 Élite Experience${c.vat ? ` — P. IVA ${esc(c.vat)}` : ` — P. IVA ${tbd('da inserire')}`}</p>
      <ul><li><a href="${ctx.href('privacy/')}">Privacy</a></li><li><a href="${ctx.href('privacy/')}#cookie">Cookie</a></li><li class="ftr__lang"><span aria-current="true">IT</span> · <span title="Versione inglese predisposta, non ancora attiva">EN</span></li></ul>
    </div>
  </div>
</footer>
${ctx.mode === 'pretty' ? '' : '<button class="notes" type="button" data-notes aria-pressed="true" title="Evidenzia i contenuti segnaposto e le bozze da validare">Note di lavorazione</button>'}
<div class="vmodal" hidden data-vmodal role="dialog" aria-modal="true" aria-labelledby="vmodal-t">
  <div class="vmodal__box">
    <button class="vmodal__close" type="button" data-vmodal-close>Chiudi ✕</button>
    <p class="eyebrow">Anteprima video</p>
    <h2 id="vmodal-t" class="vmodal__title"></h2>
    <p class="vmodal__note"></p>
    <video class="vmodal__video" controls playsinline preload="none" hidden></video>
  </div>
</div>`;
}

export function head(ctx, p) {
  const canonical = ctx.url(ctx.route);
  const jsonld = (p.jsonld || []).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
${p.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow">'}
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="it" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="Élite Experience">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/${ctx.data.media[p.ogImage || 'lavatesta'].file}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F5F0EB">
<link rel="icon" type="image/png" ${ctx.src('brand/lotus.png').replace('src=', 'href=')}>
<link rel="preload" ${ctx.src('fonts/Newsreader-Variable.woff2').replace('src=', 'href=')} as="font" type="font/woff2" crossorigin>
<link rel="preload" ${ctx.src('fonts/InterTight-Variable.woff2').replace('src=', 'href=')} as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" ${ctx.src('site.css').replace('src=', 'href=')}>
${jsonld}`;
}

export function page(ctx, p) {
  const main = `<main id="contenuto" class="${p.bodyClass || ''}">${p.body}</main>`;
  if (ctx.mode === 'bundle') return { ...p, main };
  return {
    ...p,
    html: `<!doctype html>
<html lang="it">
<head>
${head(ctx, p)}
<script>document.documentElement.classList.add('js')</script>
</head>
<body${ctx.mode === 'pretty' ? '' : ' class="notes-on"'}>
${header(ctx)}
${main}
${footer(ctx)}
<script ${ctx.src('site.js')} defer></script>
</body>
</html>
`,
  };
}
