import { site } from '../config.js';
import { esc, tbd, draft, visual, media, btn, arrow } from './core.js';

export const courseUrl = (c) => `academy/formazione-online/${c.slug}/`;

export function levelChip(level) {
  if (!level) return `<span class="chip chip--tbd">Livello da definire</span>`;
  return `<span class="chip${level.verified ? '' : ' chip--draft'}">${esc(level.label)}${level.verified ? '' : ' · da confermare'}</span>`;
}

// Prezzo in formato italiano (1.200, anche a quattro cifre), con «IVA inclusa» quando confermato
export const euro = (n) => `€ ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
export const priceText = (item) => (item.price == null ? '' : `${euro(item.price)}${item.vatIncluded ? ' IVA inclusa' : ''}`);

// Con compare (somma dei corsi singoli) il prezzo è più grande e mostra il confronto e il risparmio
export function priceLine(item, { compare } = {}) {
  if (item.price == null) return `<p class="price">${tbd('Prezzo da verificare')}</p>`;
  const promo = item.promotion && item.promotion.active
    ? ` <span class="promo">-${item.promotion.percent}%${item.promotion.code ? ` con codice ${esc(item.promotion.code)}` : ''}</span>` : '';
  const vat = item.vatIncluded ? ' <small>IVA inclusa</small>' : '';
  if (compare > item.price) {
    return `<p class="price price--deal"><span class="price__now">${euro(item.price)}${vat}</span>${promo}
      <span class="price__was">Corsi acquistati singolarmente: <s>${euro(compare)}</s></span>
      <span class="price__save">Risparmi ${euro(compare - item.price)}</span></p>`;
  }
  return `<p class="price">${euro(item.price)}${vat}${promo}</p>`;
}

// Somma dei prezzi dei corsi inclusi nella collezione (per mostrare lo sconto)
const coursesTotal = (col, courses) => col.includes.reduce((s, id) => s + ((courses.find((c) => c.id === id) || {}).price || 0), 0);

// Le promozioni compaiono solo se attive e con condizioni confermate
export function promoBanner(item) {
  const p = item.promotion;
  if (!p || !p.active || !p.conditions) return '';
  return `<p class="promo-banner"><b>-${p.percent}%</b> ${p.code ? `con il codice <code>${esc(p.code)}</code> — ` : ''}${esc(p.conditions)}${p.validUntil ? ` (fino al ${esc(p.validUntil)})` : ''}</p>`;
}

// Immagine del corso nelle card: cardImage, altrimenti la foto di apertura della scheda
export function courseImage(ctx, c, { ratio, cls, fill } = {}) {
  const ci = c.cardImage;
  if (ci) return media(ctx, ci.media, { ratio, cls, fill, position: ci.pos, provisional: ci.provisional });
  return visual(ctx, { key: c.heroImage, subject: c.heroSlot, ratio, cls, fill, tone: c.order % 2 ? 'light' : 'dark' });
}

// Card del corso, uguale per tutti: foto, livello, cosa imparerai, tecniche, prezzo
export function courseCard(ctx, c, { cta = 'Scopri il corso' } = {}) {
  return `<article class="ccard">
    <a class="ccard__media" href="${ctx.href(courseUrl(c))}" tabindex="-1" aria-hidden="true">${courseImage(ctx, c, { ratio: '4/5' })}</a>
    <div class="ccard__body">
      <p class="ccard__meta"><span>Formazione online</span>${levelChip(c.level)}</p>
      <h3 class="ccard__name"><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></h3>
      <p class="ccard__lab">Cosa imparerai</p>
      <p class="ccard__desc">${draft(c.shortDescription)}</p>
      ${c.techniques ? `<ul class="ccard__tech">${c.techniques.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <div class="ccard__foot">${priceLine(c)}${arrow(ctx, { label: cta, to: courseUrl(c) })}</div>
    </div>
  </article>`;
}

// Collezione completa (catalogo online)
export function collectionBlock(ctx, col, courses) {
  return `<div class="coll">
    <div class="coll__head">
      <p class="eyebrow">La collezione completa</p>
      <h3 class="coll__name">${esc(col.name)}</h3>
      <p class="coll__desc">${draft(col.description)}</p>
    </div>
    <ol class="coll__list">${col.includes.map((id, i) => {
      const c = courses.find((x) => x.id === id);
      return `<li><span>${String(i + 1).padStart(2, '0')}</span><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></li>`;
    }).join('')}</ol>
    <div class="coll__foot">
      ${priceLine(col, { compare: coursesTotal(col, courses) })}
      ${promoBanner(col)}
      ${col.purchaseUrl ? btn(ctx, { label: 'Acquista la collezione', to: col.purchaseUrl, ext: true, variant: 'light' }) : btn(ctx, { label: 'Vai alla piattaforma Academy', to: site.academyUrl, ext: true, variant: 'light' })}
    </div>
  </div>`;
}

// Selettore dei rituali (home): elenco chiaro dei corsi con immagine che cambia al passaggio
export function ritualPicker(ctx, courses) {
  const meta = (c) => `<span class="picker__meta"><span>Online</span>${levelChip(c.level)}${c.price != null ? `<span class="picker__price">${esc(priceText(c))}</span>` : ''}</span>`;
  return `<div class="picker" data-picker>
    <div class="picker__stage" aria-hidden="true">
      ${courses.map((c, i) => `<div class="picker__img${i === 0 ? ' is-on' : ''}">${courseImage(ctx, c, { fill: true })}</div>`).join('')}
    </div>
    <ol class="picker__list">
      ${courses.map((c, i) => `<li class="picker__item${i === 0 ? ' is-on' : ''}" data-picker-item="${i}">
        <a class="picker__link" href="${ctx.href(courseUrl(c))}">
          <div class="picker__thumb" aria-hidden="true">${courseImage(ctx, c, { ratio: '1/1' })}</div>
          <span class="picker__num">${String(i + 1).padStart(2, '0')}</span>
          <div class="picker__body">
            <span class="picker__name">${esc(c.name)}</span>
            <span class="picker__desc">${draft(c.shortDescription)}</span>
            ${meta(c)}
          </div>
          <span class="picker__go"><span>Scopri il corso</span><i aria-hidden="true">→</i></span>
        </a>
      </li>`).join('')}
    </ol>
  </div>`;
}

// Fascia della collezione completa (home)
export function collectionBand(ctx, col) {
  return `<div class="coll-band">
    <div>
      <p class="eyebrow">La collezione completa</p>
      <h3 class="coll-band__name">${esc(col.name)}</h3>
      <p class="coll-band__desc">${draft(col.description)}</p>
    </div>
    <div class="coll-band__foot">
      ${priceLine(col, { compare: coursesTotal(col, ctx.data.courses) })}
      ${promoBanner(col)}
      ${col.purchaseUrl ? btn(ctx, { label: 'Acquista la collezione', to: col.purchaseUrl, ext: true, variant: 'light' }) : btn(ctx, { label: 'Vai alla piattaforma Academy', to: site.academyUrl, ext: true, variant: 'light' })}
    </div>
  </div>`;
}
