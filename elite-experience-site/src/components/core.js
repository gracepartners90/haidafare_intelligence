// Componenti di base: restituiscono stringhe HTML.
// Convenzione contenuti: null = dato non documentato → segnaposto visibile; {text, verified:false} → bozza da validare.

export const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const join = (arr) => (Array.isArray(arr) ? arr.filter(Boolean).join('') : arr || '');

/* ---------- Segnaposto e bozze ---------- */
export const tbd = (text) => `<span class="tbd">${esc(text)}</span>`;

export function tbdBlock({ title, lines = [], note, tone = 'light', cls = '' }) {
  return `<div class="tbd-block tbd-block--${tone} ${cls}">
    <p class="tbd-block__label">Contenuto da completare</p>
    ${title ? `<p class="tbd-block__title">${esc(title)}</p>` : ''}
    ${lines.length ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    ${note ? `<p class="tbd-block__note">${esc(note)}</p>` : ''}
  </div>`;
}

// Testo di copy in bozza: visibile normalmente, evidenziato quando le note di lavorazione sono attive
// Testo con **grassetti**: escape dell'HTML, poi ** … ** diventa <strong>
export const rich = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

export function draft(t) {
  if (!t) return '';
  if (typeof t === 'string') return `<span class="draft">${esc(t)}</span>`;
  return t.verified ? esc(t.text) : `<span class="draft">${esc(t.text)}</span>`;
}

/* ---------- Tipografia ---------- */
export const eyebrow = (text, cls = '') => `<p class="eyebrow ${cls}">${esc(text)}</p>`;

export function sectionHead({ eyebrow: eb, title, lead, align = 'left', level = 2, cls = '' }) {
  return `<header class="shead shead--${align} ${cls}">
    ${eb ? eyebrow(eb) : ''}
    <h${level} class="shead__title">${title}</h${level}>
    ${lead ? `<p class="shead__lead">${lead}</p>` : ''}
  </header>`;
}

/* ---------- Azioni ---------- */
export function btn(ctx, { label, to, variant = 'primary', ext = false, cls = '', attrs = '' }) {
  const href = ext ? to : ctx.href(to);
  const extAttrs = ext ? ' target="_blank" rel="noopener"' : '';
  return `<a class="btn btn--${variant} ${cls}" href="${href}"${extAttrs} ${attrs}><span>${esc(label)}</span><i aria-hidden="true">${ext ? '↗' : '→'}</i></a>`;
}

export function arrow(ctx, { label, to, ext = false, cls = '' }) {
  const href = ext ? to : ctx.href(to);
  const extAttrs = ext && !to.startsWith('mailto:') ? ' target="_blank" rel="noopener"' : '';
  return `<a class="arrow ${cls}" href="${href}"${extAttrs}><span>${esc(label)}</span><i aria-hidden="true">${ext ? '↗' : '→'}</i></a>`;
}

/* ---------- Immagini ---------- */
export function media(ctx, key, { ratio, cls = '', caption, eager = false, position, positionMobile, fill = false, provisional = false, alt } = {}) {
  const m = ctx.data.media[key];
  if (!m) return slot({ subject: `Immagine "${key}" non registrata`, ratio });
  const style = [ratio ? `aspect-ratio:${ratio}` : '', position ? `--pos:${position}` : '', positionMobile ? `--pos-m:${positionMobile}` : ''].filter(Boolean).join(';');
  // Foto provvisoria: segnalata solo con le note di lavorazione attive
  const flag = provisional || m.provisional ? '<span class="ph__flag" aria-hidden="true">Immagine provvisoria</span>' : '';
  return `<figure class="ph ${fill ? 'ph--fill' : ''} ${cls}"${style ? ` style="${style}"` : ''}>
    <img ${ctx.src(m.file)} width="${m.w}" height="${m.h}" alt="${esc(alt ?? m.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}${flag}
  </figure>`;
}

// Spazio per una fotografia non ancora disponibile: descrive lo scatto da realizzare
export function slot({ subject, ratio, tone = 'light', label = 'Fotografia da inserire', cls = '', fill = false }) {
  return `<figure class="slot slot--${tone} ${fill ? 'ph--fill' : ''} ${cls}"${ratio ? ` style="aspect-ratio:${ratio}"` : ''} role="img" aria-label="${esc(label)}: ${esc(subject)}">
    <span class="slot__mark" aria-hidden="true"></span>
    <span class="slot__text"><b>${esc(label)}</b>${esc(subject)}</span>
  </figure>`;
}

export function visual(ctx, { key, subject, ratio, tone, cls, caption, eager, position, fill }) {
  return key ? media(ctx, key, { ratio, cls, caption, eager, position, fill }) : slot({ subject, ratio, tone, cls, fill });
}

// Video: se manca il file, mostra uno spazio dichiarato (nessun video generico al suo posto)
// Con loop: { webm, mp4 } il video (muto) scorre da solo quando è visibile, con il pulsante di pausa
export function videoBlock(ctx, { poster, posterPos, posterSubject, title, note, src, loop, ratio = '16/9', tone = 'dark', cls = '' }) {
  const bg = poster ? media(ctx, poster, { fill: true, position: posterPos }) : slot({ subject: posterSubject || 'Frame del video', tone, fill: true, label: 'Video da inserire' });
  if (loop) {
    return `<div class="video video--loop ${cls}" style="aspect-ratio:${ratio}${posterPos ? `;--pos:${posterPos}` : ''}" data-loop-video>
    ${bg}
    <video class="video__loop" muted loop playsinline preload="none" aria-label="${esc(title || 'Video')}">
      ${loop.webm ? `<source src="${ctx.asset(loop.webm)}" type="video/webm">` : ''}
      ${loop.mp4 ? `<source src="${ctx.asset(loop.mp4)}" type="video/mp4">` : ''}
    </video>
    <button class="fullvideo__toggle video__toggle" type="button" data-loop-toggle aria-pressed="false"><span class="fullvideo__toggle-icon" aria-hidden="true"></span><span class="sr-only" data-loop-label>Metti in pausa il video</span></button>
  </div>`;
  }
  return `<div class="video ${cls}" style="aspect-ratio:${ratio}">
    ${bg}
    <button class="video__play" type="button" data-video-open data-video-title="${esc(title || 'Video')}" data-video-note="${esc(note || '')}"${src ? ` data-video-src="${ctx.asset(src)}"` : ''}>
      <span class="video__icon" aria-hidden="true"></span>
      <span class="sr-only">Anteprima video${title ? `: ${esc(title)}` : ''}</span>
    </button>
  </div>`;
}

/* ---------- Struttura ---------- */
export function breadcrumb(ctx, items) {
  return `<nav class="crumbs" aria-label="Percorso">
    <ol>${items.map((it, i) => i < items.length - 1
      ? `<li><a href="${ctx.href(it.to)}">${esc(it.label)}</a></li>`
      : `<li aria-current="page">${esc(it.label)}</li>`).join('')}</ol>
  </nav>`;
}

export function accordion(items, { cls = '' } = {}) {
  return `<div class="acc ${cls}">${items.map((it) => `<details class="acc__item">
      <summary><span>${it.title}</span><i aria-hidden="true"></i></summary>
      <div class="acc__body">${it.body}</div>
    </details>`).join('')}</div>`;
}

// FAQ: risposta confermata, bozza (verified = false) o segnaposto (a = null), con link facoltativo
export function faqList(items, ctx) {
  return accordion(items.map((f) => ({
    title: esc(f.q),
    body: f.a
      ? `<p>${f.verified === false ? draft(f.a) : esc(f.a)}</p>${f.link && ctx ? arrow(ctx, { label: f.link.label, to: f.link.to, ext: !!f.link.ext }) : ''}`
      : `<p>${tbd('Risposta da confermare con Élite Experience')}</p>`,
  })));
}

export const faqAll = (data) => data.faq.groups.flatMap((g) => g.items);

export function faqPick(data, ids) {
  const all = faqAll(data);
  return ids.map((id) => {
    const f = all.find((x) => x.id === id);
    if (!f) throw new Error(`FAQ "${id}" non presente in faq.json`);
    return f;
  });
}

// FAQ divise per tema (gruppi di faq.json)
export function faqGroups(ctx, groups, { idPrefix } = {}) {
  return `<div class="faqg">${groups.map((g) => `<div class="faqg__group"${idPrefix ? ` id="${idPrefix}${g.id}"` : ''}>
    <h3 class="faqg__title">${esc(g.title)}</h3>
    ${faqList(g.items, ctx)}
  </div>`).join('')}</div>`;
}

/* ---------- Form ---------- */
export function field({ name, label, type = 'text', required = false, options, autocomplete, rows = 4, half = false, hint, prefix = 'f' }) {
  const id = `${prefix}-${name}`;
  const req = required ? ' required' : '';
  const lab = `<label for="${id}">${esc(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>`;
  let input;
  if (type === 'select') input = `<select id="${id}" name="${name}"${req}><option value="">Seleziona</option>${options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (type === 'textarea') input = `<textarea id="${id}" name="${name}" rows="${rows}"${req}></textarea>`;
  else input = `<input id="${id}" name="${name}" type="${type}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${req}>`;
  return `<div class="field${half ? ' field--half' : ''}">${lab}${input}${hint ? `<small>${esc(hint)}</small>` : ''}<span class="field__err" aria-live="polite"></span></div>`;
}

export function form(ctx, { id, title, intro, fields, submit }) {
  return `<form class="form" id="${id}" novalidate data-form>
    ${title ? `<h3 class="form__title">${esc(title)}</h3>` : ''}
    ${intro ? `<p class="form__intro">${esc(intro)}</p>` : ''}
    <div class="form__grid">${fields.map((f) => field({ ...f, prefix: id })).join('')}</div>
    <div class="field field--check">
      <label><input type="checkbox" name="privacy" id="${id}-privacy" required> Ho letto l’<a href="${ctx.href('privacy/')}">informativa privacy</a> e acconsento al trattamento dei dati per ricevere una risposta. <span aria-hidden="true">*</span></label>
      <span class="field__err" aria-live="polite"></span>
    </div>
    <div class="form__foot">
      <button class="btn btn--primary" type="submit"><span>${esc(submit)}</span><i aria-hidden="true">→</i></button>
      <p class="form__note">Prototipo: l’invio non è ancora collegato a un servizio di ricezione.</p>
    </div>
    <p class="form__ok" role="status" hidden>Richiesta pronta per l’invio. Nel sito pubblicato verrà inoltrata a Élite Experience.</p>
  </form>`;
}
