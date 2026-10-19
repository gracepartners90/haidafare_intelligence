// Élite & More: anteprime degli articoli reali pubblicati su elitexperience.it/elite-e-more.
// Dati in src/content/editorial.json (journal.articles). Nessun articolo viene inventato:
// finché l'elenco è vuoto le card mostrano uno spazio "Articolo da collegare".
import { esc, tbd, media, slot, arrow } from './core.js';

const dateIt = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

// Articoli reali, dal più recente
export function latestArticles(data, { n, category } = {}) {
  const list = data.editorial.journal.articles
    .filter((a) => !category || a.category === category)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return n ? list.slice(0, n) : list;
}

export function articleCard(ctx, a) {
  const cat = a.category && ctx.data.editorial.journal.categories.find((c) => c.slug === a.category);
  const url = esc(a.url);
  return `<article class="jcard">
    <a class="jcard__media" href="${url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${a.image ? media(ctx, a.image, { ratio: '3/2', position: a.imagePos }) : slot({ subject: 'Copertina dell’articolo', ratio: '3/2' })}</a>
    <p class="jcard__meta">${cat ? `<span>${esc(cat.name)}</span>` : ''}${a.date ? `<time datetime="${esc(a.date)}">${esc(dateIt(a.date))}</time>` : ''}</p>
    <h3 class="jcard__title"><a href="${url}" target="_blank" rel="noopener">${esc(a.title)}</a></h3>
    ${a.excerpt ? `<p class="jcard__excerpt">${esc(a.excerpt)}</p>` : ''}
    ${arrow(ctx, { label: 'Leggi l’articolo', to: a.url, ext: true })}
  </article>`;
}

// Spazio per uno degli ultimi articoli reali, non ancora collegato
export function pendingArticle() {
  return `<article class="jcard jcard--pending">
    ${slot({ subject: 'Copertina di uno degli ultimi articoli pubblicati', ratio: '3/2', label: 'Articolo da collegare' })}
    <p class="jcard__meta"><span>Élite &amp; More</span></p>
    <h3 class="jcard__title">${tbd('Titolo dell’articolo pubblicato')}</h3>
    <p class="jcard__note">Da importare da elitexperience.it/elite-e-more</p>
  </article>`;
}

// Griglia di articoli; con `min` completa gli spazi mancanti con card da collegare
export function articleGrid(ctx, list, { min = 0 } = {}) {
  const cards = list.map((a) => articleCard(ctx, a));
  while (cards.length < min) cards.push(pendingArticle());
  return `<div class="jgrid">${cards.join('')}</div>`;
}
