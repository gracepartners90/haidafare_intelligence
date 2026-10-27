// Sequenza cinematografica "Il metodo, in pratica": i capitoli scorrono come un film
// quando la sezione è visibile. Dati in src/content/practice.json.
import { esc, draft, photo } from './core.js';

// Larghezza reale della foto nel riquadro (object-fit: cover, alto quanto lo schermo): quando lo schermo
// è più stretto della foto, la foto è più larga dello schermo. Così il browser sceglie la versione abbastanza grande.
const coverSizes = (m) => `(max-aspect-ratio: ${m.w}/${m.h}) ${Math.ceil((100 * m.w) / m.h)}vh, 100vw`;

export function practiceSequence(ctx, { id = 'in-pratica', compact = false } = {}) {
  const d = ctx.data.practice;
  const total = d.chapters.length * d.secondsPerChapter;
  return `<section class="seq${compact ? ' seq--compact' : ''}" id="${id}" data-seq data-seconds="${d.secondsPerChapter}" aria-label="${esc(d.title)}">
  <div class="seq__stage">
    ${d.chapters.map((c, i) => {
      const m = ctx.data.media[c.media];
      // Con la versione verticale, posMobile è l'inquadratura di quella foto (--pos-v), non di quella orizzontale
      const tall = c.mediaMobile && ctx.data.media[c.mediaMobile];
      const posSmall = c.posMobile ? `;--pos-${tall ? 'v' : 'm'}:${c.posMobile}` : '';
      return `<figure class="seq__frame${tall ? ' seq__frame--v' : ''}${i === 0 ? ' is-on' : ''}" style="--pos:${c.pos};--zoom:${c.zoom}${posSmall}">
        ${photo(ctx, m, `alt="${esc(m.alt)}" loading="lazy" decoding="async"`, coverSizes(m), tall, tall && coverSizes(tall))}
      </figure>`;
    }).join('')}
    <div class="seq__shade" aria-hidden="true"></div>
    <header class="seq__intro">
      <h2 class="seq__title">${esc(d.title)}</h2>
      <p>${esc(d.line)}</p>
    </header>
    <div class="seq__chapter" aria-live="polite">
      ${d.chapters.map((c, i) => `<div class="seq__cap${i === 0 ? ' is-on' : ''}"><p class="seq__word">${esc(c.word)}</p><p class="seq__line">${draft(c.line)}</p></div>`).join('')}
    </div>
    <div class="seq__bar">
      <ol>${d.chapters.map((c, i) => `<li${i === 0 ? ' class="is-on"' : ''}><button type="button" data-seq-go="${i}">${esc(c.word)}</button><i aria-hidden="true"></i></li>`).join('')}</ol>
      <span class="seq__tc" data-seq-tc aria-hidden="true">00:00:00 / 00:00:${String(total).padStart(2, '0')}</span>
    </div>
  </div>
</section>`;
}
