import { site } from '../config.js';
import { esc, tbd, draft, visual, btn, arrow } from './core.js';

export const courseUrl = (c) => `academy/formazione-online/${c.slug}/`;

export function levelChip(level) {
  if (!level) return `<span class="chip chip--tbd">Livello da definire</span>`;
  return `<span class="chip${level.verified ? '' : ' chip--draft'}">${esc(level.label)}${level.verified ? '' : ' · da confermare'}</span>`;
}

export function priceLine(item) {
  if (item.price == null) return `<p class="price">${tbd('Prezzo da verificare')}</p>`;
  const promo = item.promotion && item.promotion.active
    ? ` <span class="promo">-${item.promotion.percent}%${item.promotion.code ? ` con codice ${esc(item.promotion.code)}` : ''}</span>` : '';
  return `<p class="price">€ ${esc(item.price)}${promo}</p>`;
}

// Le promozioni compaiono solo se attive e con condizioni confermate
export function promoBanner(item) {
  const p = item.promotion;
  if (!p || !p.active || !p.conditions) return '';
  return `<p class="promo-banner"><b>-${p.percent}%</b> ${p.code ? `con il codice <code>${esc(p.code)}</code> — ` : ''}${esc(p.conditions)}${p.validUntil ? ` (fino al ${esc(p.validUntil)})` : ''}</p>`;
}

export function outcomes(c, n = 3) {
  if (c.competencies && c.competencies.length) {
    return `<ul class="outcomes">${c.competencies.slice(0, n).map((x) => `<li>${esc(x.title || x)}</li>`).join('')}</ul>`;
  }
  const slots = ['Tecnica principale insegnata', 'Manualità / sequenza operativa', 'Applicazione nel rituale in salone'];
  return `<ul class="outcomes outcomes--tbd">${slots.slice(0, n).map((x) => `<li>${tbd(x)}</li>`).join('')}</ul>`;
}

// Card editoriale del corso (home, catalogo)
export function courseCard(ctx, c, { showPrice = false, cta = 'Scopri il programma', size = 'm' } = {}) {
  return `<article class="ccard ccard--${size}">
    <a class="ccard__media" href="${ctx.href(courseUrl(c))}" tabindex="-1" aria-hidden="true">
      ${visual(ctx, { key: c.heroImage, subject: c.heroSlot, ratio: size === 'l' ? '16/10' : '4/5', tone: c.order % 2 ? 'light' : 'dark' })}
    </a>
    <div class="ccard__body">
      <p class="ccard__meta"><span>Formazione online</span>${levelChip(c.level)}</p>
      <h3 class="ccard__name"><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></h3>
      <p class="ccard__desc">${draft(c.shortDescription)}</p>
      <p class="ccard__lab">Cosa imparerai</p>
      ${outcomes(c)}
      ${showPrice ? priceLine(c) : ''}
      ${arrow(ctx, { label: cta, to: courseUrl(c) })}
    </div>
  </article>`;
}

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
      ${priceLine(col)}
      ${promoBanner(col)}
      ${col.purchaseUrl ? btn(ctx, { label: 'Acquista la collezione', to: col.purchaseUrl, ext: true, variant: 'light' }) : btn(ctx, { label: 'Vai alla piattaforma Academy', to: site.academyUrl, ext: true, variant: 'light' })}
    </div>
  </div>`;
}
