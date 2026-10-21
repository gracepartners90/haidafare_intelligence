// Élite & More: il magazine di Élite Experience, sul modello «a numeri» di Rockstar Notes.
// Un numero si sfoglia in orizzontale su desktop (copertina, sommario, aperture, fine) e
// diventa una pila di pagine su mobile. Dati in src/content/editorial.json (journal).
import { esc, media, arrow, btn } from './core.js';

const pad = (n) => String(n).padStart(2, '0');
export const dateIt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
export const articlePath = (a) => `elite-e-more/${a.slug}/`;
export const catPath = (slug) => `elite-e-more/categoria/${slug}/`;

// Articoli, dal più recente
export function latestArticles(data, { n, category } = {}) {
  const list = data.editorial.journal.articles
    .filter((a) => !category || a.category === category)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return n ? list.slice(0, n) : list;
}

const catName = (data, slug) => (data.editorial.journal.categories.find((c) => c.slug === slug) || {}).name || 'Élite & More';
const sample = (a) => (a.sample ? '<span class="mag-flag" aria-hidden="true">Esempio</span>' : '');
const meta = (ctx, a) => `${esc(catName(ctx.data, a.category))} · <time datetime="${esc(a.date)}">${esc(dateIt(a.date))}</time> · ${a.minutes} min`;

export const issueLabel = (issue) => `N° ${pad(issue.n)} · ${issue.label}`;

/* ---------- Pagine del numero ---------- */

function pageWrap({ id, tone, n, N, cls = '', body }) {
  return `<section class="pg pg--${tone} ${cls}" id="${id}" data-tone="${tone}" aria-roledescription="pagina" aria-label="Pagina ${n} di ${N}" tabindex="-1">
    ${body}
    <p class="pg__folio" aria-hidden="true">${pad(n)} / ${pad(N)}</p>
  </section>`;
}

function cover(ctx, { issue, arts }) {
  const a = arts[0];
  return `<div class="pg-cover">
    <div class="pg-cover__main">
      <h1 class="mag-head"><span>Élite</span> <em>&amp; More</em></h1>
      <p class="pg-cover__tagline">${esc(issue.tagline)}</p>
      <p class="pg-cover__issue">Élite Experience · <mark>${esc(issueLabel(issue))}</mark></p>
      <div class="pg-cover__story">
        <p class="mag-eyebrow">In copertina · ${esc(catName(ctx.data, a.category))}</p>
        <h2 class="pg-cover__title"><a href="${ctx.href(articlePath(a))}">${esc(a.title)}</a>${sample(a)}</h2>
        <p class="pg-cover__excerpt">${esc(a.excerpt)}</p>
        ${arrow(ctx, { label: 'Leggi l’articolo', to: articlePath(a) })}
      </div>
    </div>
    <div class="pg-cover__photo">${media(ctx, a.image, { fill: true, eager: true, position: a.imagePos, alt: '' })}</div>
  </div>`;
}

function toc(ctx, { issue, arts, folios, minutes }) {
  const cats = [...new Set(arts.map((a) => catName(ctx.data, a.category)))];
  return `<div class="pg-toc">
    <div class="pg-toc__side">
      <h2 class="pg-toc__title" id="sommario">Sommario</h2>
      <p class="pg-toc__issue">${esc(issueLabel(issue))}</p>
      <dl class="pg-toc__brief">
        <div><dt>Il numero in breve</dt><dd>${arts.length} articoli · ${minutes} min di lettura</dd></div>
        <div><dt>Rubriche</dt><dd>${cats.map(esc).join(', ')}</dd></div>
      </dl>
      ${arrow(ctx, { label: 'Tutti gli articoli', to: '#archivio' })}
    </div>
    <ol class="registro">
      ${arts.map((a, i) => `<li><a href="${ctx.href(`#p-${pad(folios[i])}`)}">
        <span class="registro__p">p. ${pad(folios[i])}</span>
        <span class="registro__cat">${esc(catName(ctx.data, a.category))}</span>
        <span class="registro__title">${esc(a.title)}</span>
        <span class="registro__min">${a.minutes} min</span>
      </a></li>`).join('')}
    </ol>
  </div>`;
}

// Varianti di apertura: A testo + foto a destra (carta), B specchiata su fondo scuro, C tipografica
function opening(ctx, a, variant, folio) {
  const text = `<div class="pg-open__text">
      <p class="mag-eyebrow">${meta(ctx, a)}</p>
      <h2 class="pg-open__title"><a href="${ctx.href(articlePath(a))}">${esc(a.title)}</a>${sample(a)}</h2>
      <p class="pg-open__excerpt">${esc(a.excerpt)}</p>
      <p class="pg-open__by">di Redazione Élite &amp; More</p>
      ${arrow(ctx, { label: 'Leggi l’articolo', to: articlePath(a), cls: 'arrow--light' })}
    </div>`;
  const big = `<span class="pg-open__folio" aria-hidden="true">${pad(folio)}</span>`;
  if (variant === 'C') return `<div class="pg-open pg-open--C">${big}${text}</div>`;
  return `<div class="pg-open pg-open--${variant}">
    ${text}
    <div class="pg-open__photo">${media(ctx, a.image, { fill: true, position: a.imagePos, alt: '' })}</div>
    ${big}
  </div>`;
}

function end(ctx, { issue }) {
  return `<div class="pg-end">
    <p class="mag-eyebrow">Fine del ${esc(issueLabel(issue).split(' · ')[0])}</p>
    <h2 class="pg-end__title">Porta l’esperienza Hair Spa <em>nel tuo salone</em>.</h2>
    <div class="actions">
      ${btn(ctx, { label: 'Scopri la formazione', to: 'academy/', variant: 'light' })}
      ${btn(ctx, { label: 'Il Metodo Élite', to: 'metodo-elite/', variant: 'ghost-light' })}
    </div>
    <p class="pg-end__links">${arrow(ctx, { label: '↖ Torna alla copertina', to: '#p-01', cls: 'arrow--light' })} ${arrow(ctx, { label: 'Tutti gli articoli', to: '#archivio', cls: 'arrow--light' })}</p>
  </div>`;
}

// Il numero in edicola, da sfogliare
export function magazineIssue(ctx) {
  const j = ctx.data.editorial.journal;
  const arts = latestArticles(ctx.data);
  const minutes = arts.reduce((s, a) => s + (a.minutes || 0), 0);
  const folios = arts.map((_, i) => i + 3);
  const ctxIssue = { issue: j.issue, arts, folios, minutes };
  // L'articolo di copertina ha la foto in copertina: la sua apertura è tipografica (C); poi B e A alternate
  const variants = arts.map((_, i) => (i === 0 ? 'C' : i % 2 ? 'B' : 'A'));
  const N = arts.length + 3;
  const pages = [
    pageWrap({ id: 'p-01', tone: 'ink', n: 1, N, cls: 'pg--cover', body: cover(ctx, ctxIssue) }),
    pageWrap({ id: 'p-02', tone: 'ink', n: 2, N, body: toc(ctx, ctxIssue) }),
    ...arts.map((a, i) => pageWrap({ id: `p-${pad(folios[i])}`, tone: 'ink', n: folios[i], N, body: opening(ctx, a, variants[i], folios[i]) })),
    pageWrap({ id: `p-${pad(N)}`, tone: 'ink', n: N, N, cls: 'pg--end', body: end(ctx, ctxIssue) }),
  ];
  return `<div class="sfoglio" data-sfoglio data-tone="ink">
  <nav class="sfoglio__nav" aria-label="Sfoglia il numero">
    <button type="button" class="sfoglio__btn" data-dir="-1" aria-label="Pagina precedente">‹</button>
    <button type="button" class="sfoglio__btn" data-dir="1" aria-label="Pagina successiva">›</button>
  </nav>
  <div class="sfoglio__fx" role="region" aria-roledescription="rivista" aria-label="Élite &amp; More ${esc(issueLabel(j.issue))}, ${N} pagine">
    ${pages.join('\n')}
  </div>
  <div class="sfoglio__bar" aria-hidden="true"><span></span></div>
  <p class="sfoglio__folio" aria-hidden="true"><b>01</b> — ${pad(N)}</p>
  <p class="sr-only" aria-live="polite" data-sfoglio-live></p>
</div>`;
}

/* ---------- Elenchi a registro ---------- */
export function registro(ctx, list) {
  return `<ol class="registro registro--archive">
    ${list.map((a) => `<li><a href="${ctx.href(articlePath(a))}">
      <span class="registro__p"><time datetime="${esc(a.date)}">${esc(dateIt(a.date))}</time></span>
      <span class="registro__cat">${esc(catName(ctx.data, a.category))}</span>
      <span class="registro__title">${esc(a.title)}${sample(a)}</span>
      <span class="registro__min">${a.minutes} min</span>
    </a></li>`).join('')}
  </ol>`;
}

/* ---------- Pagina articolo ---------- */
export function articleBody(ctx, a) {
  let first = true;
  return a.body.map((b) => {
    if (b.type === 'h2') return `<h2>${esc(b.text)}</h2>`;
    if (b.type === 'quote') return `<blockquote class="article__pull"><p>${esc(b.text)}</p></blockquote>`;
    const cls = first ? ' class="article__first"' : '';
    first = false;
    return `<p${cls}>${esc(b.text)}</p>`;
  }).join('\n');
}

export { meta as articleMeta, catName };
