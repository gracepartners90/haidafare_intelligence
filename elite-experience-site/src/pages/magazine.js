// Élite & More: edicola (il numero da sfogliare), archivio, rubriche e articoli.
import { esc, eyebrow, sectionHead, arrow, media, breadcrumb } from '../components/core.js';
import { breadcrumbs, blog, blogPosting } from '../components/seo.js';
import { page } from '../components/layout.js';
import { magazineIssue, latestArticles, relatedArticles, registro, articlePath, catPath, articleBody, articleMeta, catName } from '../components/editorial.js';

const H = { label: 'Home', to: '' };
// Titolo della pagina: il nome del magazine solo se il titolo resta entro circa 60 caratteri
const articleTitle = (a) => {
  const t = a.seoTitle || a.title;
  return t.length + 15 <= 62 ? `${t} — Élite & More` : t;
};
const base = [H, { label: 'Élite & More', to: 'elite-e-more/' }];

const rubriche = (ctx, active) => {
  const all = latestArticles(ctx.data);
  return `<ul class="rubriche">${ctx.data.editorial.journal.categories.map((c) => {
    const n = all.filter((a) => a.category === c.slug).length;
    return `<li><a href="${ctx.href(catPath(c.slug))}"${active === c.slug ? ' aria-current="page"' : ''}><span>${esc(c.name)}</span><b>${n}</b></a></li>`;
  }).join('')}</ul>`;
};

export default (data) => {
  const j = data.editorial.journal;

  const edicola = {
    route: 'elite-e-more/',
    render(ctx) {
      const body = `
${magazineIssue(ctx)}

<section class="sec sec--deep mag-archive" id="archivio">
  <div class="wrap split split--4-8">
    <div>
      ${sectionHead({ eyebrow: 'Élite & More', title: 'Tutti gli articoli.' })}
      <p class="mag-archive__label">Rubriche</p>
      ${rubriche(ctx)}
    </div>
    ${registro(ctx, latestArticles(ctx.data))}
  </div>
</section>`;
      return page(ctx, {
        title: 'Élite & More — Il magazine Hair Spa di Élite Experience',
        description: 'Élite & More, il magazine di Élite Experience: cultura Hair Spa, rituali, formazione professionale e vita del salone. Sfoglia il numero in edicola.',
        jsonld: [blog(), breadcrumbs(base)],
        bodyClass: 'p-mag',
        body,
      });
    },
  };

  const categories = j.categories.map((cat) => ({
    route: catPath(cat.slug),
    render(ctx) {
      const crumbs = [...base, { label: cat.name, to: catPath(cat.slug) }];
      const list = latestArticles(ctx.data, { category: cat.slug });
      const body = `
<section class="phero phero--center mag-cat">
  <div class="wrap">
    ${breadcrumb(ctx, crumbs)}
    ${eyebrow('Élite & More — Rubrica')}
    <h1 class="phero__title">${esc(cat.name)}</h1>
    <p class="phero__lead">${esc(cat.description)}</p>
  </div>
</section>
<section class="sec sec--tight">
  <div class="wrap split split--4-8">
    <div><p class="mag-archive__label">Rubriche</p>${rubriche(ctx, cat.slug)}</div>
    ${list.length ? registro(ctx, list) : '<p class="empty">Nessun articolo in questa rubrica, per ora.</p>'}
  </div>
</section>`;
      return page(ctx, { title: `${cat.name} — Élite & More | Élite Experience`, description: `${cat.description} Gli articoli della rubrica su Élite & More.`, jsonld: [breadcrumbs(crumbs)], bodyClass: 'p-mag', body });
    },
  }));

  const articles = j.articles.map((a) => ({
    route: articlePath(a),
    render(ctx) {
      const crumbs = [...base, { label: catName(ctx.data, a.category), to: catPath(a.category) }, { label: a.title, to: articlePath(a) }];
      const body = `
<article class="article">
  <header class="article__head wrap">
    ${breadcrumb(ctx, crumbs)}
    ${a.sample ? '<p class="article__flag">Articolo di esempio per l’anteprima del magazine</p>' : ''}
    <p class="mag-eyebrow article__meta">${articleMeta(ctx, a)}</p>
    <h1 class="article__title">${esc(a.title)}</h1>
    ${a.leadFromBody ? '' : `<p class="article__lead">${esc(a.excerpt)}</p>`}
    <p class="article__by">di Redazione Élite &amp; More</p>
  </header>
  <div class="article__hero">${media(ctx, a.image, { ratio: '21/9', position: a.imagePos, eager: true, sizes: '100vw' })}</div>
  <div class="article__body wrap-narrow">
    ${articleBody(ctx, a)}
    <aside class="article__course">
      <p class="eyebrow">Approfondisci con la formazione</p>
      <p class="h3serif">Il metodo, un rituale alla volta.</p>
      ${arrow(ctx, { label: 'Scopri la formazione online', to: 'academy/formazione-online/' })}
    </aside>
  </div>
  <section class="sec sec--ivory">
    <div class="wrap split split--4-8">
      <div>${sectionHead({ eyebrow: 'Élite & More', title: 'Continua a leggere.' })}${arrow(ctx, { label: 'Sfoglia il numero', to: 'elite-e-more/' })}</div>
      ${registro(ctx, relatedArticles(ctx.data, a))}
    </div>
  </section>
</article>`;
      return page(ctx, {
        title: articleTitle(a),
        description: a.seoDescription || a.excerpt,
        jsonld: [blogPosting(a, ctx.data.media[a.image]), breadcrumbs(crumbs)],
        ogImage: a.image,
        ogType: 'article',
        published: a.date,
        modified: a.modified,
        noindex: !!a.sample,
        bodyClass: 'p-article',
        section: 'elite-e-more/',
        body,
      });
    },
  }));

  return [edicola, ...categories, ...articles];
};
