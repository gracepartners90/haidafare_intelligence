// Blocchi a tutto schermo condivisi dalle pagine: hero, immagine, video e galleria in dissolvenza.
import { esc, media } from './core.js';

// Hero a tutto schermo (stessa struttura della home). `slides` = più foto in dissolvenza.
export function fullHero(ctx, { image, position, slides, eyebrow, title, lead, extra = '', cls = '' }) {
  const bg = slides
    ? `<div class="hero__slides" data-slides>${slides.map((s, i) => `<div class="hero__slide${i === 0 ? ' is-on' : ''}">${media(ctx, s.image, { fill: true, eager: i === 0, position: s.position, positionMobile: s.positionMobile })}</div>`).join('')}</div>`
    : media(ctx, image, { fill: true, eager: true, position });
  return `<section class="hero ${cls}">
  <div class="hero__bg">${bg}</div>
  <div class="hero__in">
    <div class="hero__text">
      ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
      <h1 class="hero__title">${title}</h1>
      ${lead ? `<p class="hero__lead">${lead}</p>` : ''}
      ${extra}
    </div>
    ${slides ? `<ol class="hero__progress" aria-hidden="true">${slides.map((_, i) => `<li${i === 0 ? ' class="is-on"' : ''}><i></i></li>`).join('')}</ol>` : ''}
  </div>
</section>`;
}

// Immagine a tutto schermo, con lieve avvicinamento quando entra nella pagina
export function fullImage(ctx, image, { position, caption, provisional = false, cls = '' } = {}) {
  return `<section class="fullimg ${cls}" data-reveal>
  ${media(ctx, image, { fill: true, position, provisional })}
  ${caption ? `<p class="fullimg__cap">${esc(caption)}</p>` : ''}
</section>`;
}

// Video a tutto schermo: con `src` il pulsante riproduce il filmato, senza dichiara lo spazio da riempire
export function fullVideo(ctx, { poster, position, eyebrow, title, src, note }) {
  return `<section class="fullvideo" data-reveal>
  ${media(ctx, poster, { fill: true, position })}
  <div class="fullvideo__in">
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h2 class="fullvideo__title">${title}</h2>
    <button class="fullvideo__play" type="button" data-video-open data-video-title="${esc(title.replace(/<[^>]+>/g, ''))}"${src ? ` data-video-src="${ctx.asset(src)}"` : ` data-video-note="${esc(note || 'Video in preparazione.')}"`}>
      <span class="video__icon" aria-hidden="true"></span><span>Guarda il video</span>
    </button>
  </div>
</section>`;
}

// Galleria in dissolvenza: le foto si alternano con la loro didascalia quando il blocco è visibile
export function fader(ctx, items, { ratio = '4/5', cls = '' } = {}) {
  return `<div class="fader ${cls}" data-fader style="aspect-ratio:${ratio}">
  ${items.map((it, i) => `<figure class="fader__item${i === 0 ? ' is-on' : ''}">${media(ctx, it.image, { fill: true, position: it.position })}${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ''}</figure>`).join('')}
  <ol class="fader__dots" aria-hidden="true">${items.map((_, i) => `<li${i === 0 ? ' class="is-on"' : ''}></li>`).join('')}</ol>
</div>`;
}

// Dichiarazione firmata
export function signedQuote(text, { name = 'Elisabetta Tancini', cls = '' } = {}) {
  return `<figure class="signed ${cls}">
  <blockquote><p>${text}</p></blockquote>
  <figcaption><span class="signed__sign" aria-hidden="true">${esc(name)}</span><span class="sr-only">${esc(name)}</span></figcaption>
</figure>`;
}
