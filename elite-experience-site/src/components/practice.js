// Sequenza cinematografica "Il metodo, in pratica": i capitoli scorrono come un film
// quando la sezione è visibile. Dati in src/content/practice.json.
import { esc, draft } from './core.js';

export function practiceSequence(ctx, { id = 'in-pratica', compact = false } = {}) {
  const d = ctx.data.practice;
  const total = d.chapters.length * d.secondsPerChapter;
  return `<section class="seq${compact ? ' seq--compact' : ''}" id="${id}" data-seq data-seconds="${d.secondsPerChapter}" aria-label="${esc(d.title)}">
  <div class="seq__stage">
    ${d.chapters.map((c, i) => {
      const m = ctx.data.media[c.media];
      return `<figure class="seq__frame${i === 0 ? ' is-on' : ''}" style="--pos:${c.pos};--zoom:${c.zoom}${c.posMobile ? `;--pos-m:${c.posMobile}` : ''}">
        <img ${ctx.src(m.file)} width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" loading="lazy" decoding="async">
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
    <button class="seq__watch" type="button" data-video-open data-video-title="Il metodo, in pratica — selezione completa" ${d.video ? `data-video-src="${ctx.asset(d.video)}"` : 'data-video-note="Inserire il video della selezione dai videocorsi Élite Experience."'}>
      <span class="video__icon" aria-hidden="true"></span>
      <span><b>Guarda la selezione completa</b><small>Dai videocorsi Élite Experience</small></span>
    </button>
    <div class="seq__bar">
      <ol>${d.chapters.map((c, i) => `<li${i === 0 ? ' class="is-on"' : ''}><button type="button" data-seq-go="${i}">${esc(c.word)}</button><i aria-hidden="true"></i></li>`).join('')}</ol>
      <span class="seq__tc" data-seq-tc aria-hidden="true">00:00:00 / 00:00:${String(total).padStart(2, '0')}</span>
    </div>
  </div>
</section>`;
}
