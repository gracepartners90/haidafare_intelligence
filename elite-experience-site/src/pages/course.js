// Modello unico per tutte le schede corso: i contenuti arrivano da src/content/courses.json.
import { site } from '../config.js';
import { esc, rich, tbd, draft, eyebrow, sectionHead, btn, arrow, media, breadcrumb, faqList, faqPick } from '../components/core.js';
import { courseCard, courseImage, courseUrl, levelChip, priceLine, priceText, promoBanner } from '../components/course.js';
import { course as courseLd, breadcrumbs, faqPage } from '../components/seo.js';
import { page } from '../components/layout.js';
import { fullImage } from '../components/blocks.js';

// Testo definitivo, bozza ({ text, verified: false }) o segnaposto se manca
const val = (v, label) => (v == null ? tbd(label) : typeof v === 'string' ? rich(v) : draft(v));

// Le sei voci di «Cosa imparerai»
const competencies = (c) => `<ol class="learn">${(c.competencies || []).map((x, i) => `<li><span class="learn__n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(x.title)}</h3><p>${rich(x.text)}</p></div></li>`).join('')}</ol>`;

function coursePage(c, all, collection) {
  const crumbs = [
    { label: 'Home', to: '' }, { label: 'Academy', to: 'academy/' },
    { label: 'Formazione Online', to: 'academy/formazione-online/' }, { label: c.name, to: courseUrl(c) },
  ];
  return {
    route: courseUrl(c),
    render(ctx) {
      const buyUrl = c.purchaseUrl || site.academyUrl;
      const related = (c.related || []).map((r) => (r.id === 'collection' ? { col: true, reason: r.reason } : { c: all.find((x) => x.id === r.id), reason: r.reason }));

      const body = `
<!-- 01 HERO DEL CORSO -->
<section class="chero">
  <div class="chero__text">
    ${breadcrumb(ctx, crumbs)}
    <p class="chero__meta"><span class="chip chip--solid">Formazione online</span>${levelChip(c.level)}${c.nameVerified ? '' : '<span class="chip chip--tbd">Nome ufficiale da verificare</span>'}</p>
    <h1 class="chero__title">${esc(c.name)}</h1>
    <dl class="chero__facts">
      <div><dt>Modalità</dt><dd>${val(c.mode, 'Da confermare')}</dd></div>
      <div><dt>Durata</dt><dd>${val(c.duration, 'Da confermare')}</dd></div>
      <div><dt>Prezzo</dt><dd>${c.price != null ? esc(priceText(c)) : tbd('Da verificare')}</dd></div>
    </dl>
    ${promoBanner(c)}
    <div class="actions">${btn(ctx, { label: 'Acquista ora', to: buyUrl, ext: true })}</div>
  </div>
  <div class="chero__media">
    ${c.heroImage ? media(ctx, c.heroImage, { fill: true, eager: true, position: c.heroPos || '50% 50%' }) : courseImage(ctx, c, { fill: true })}
  </div>
</section>

<!-- 02 COSA IMPARERAI -->
<section class="sec learn-sec" id="cosa-imparerai">
  <div class="wrap">
    ${sectionHead({ eyebrow: c.name, title: 'Cosa imparerai', lead: draft(c.shortDescription) })}
    ${competencies(c)}
  </div>
</section>

<!-- 03 A CHI È RIVOLTO + COME FUNZIONA -->
<section class="sec">
  <div class="wrap split split--6-6">
    <div>
      ${sectionHead({ eyebrow: 'A chi è rivolto', title: 'Il profilo consigliato' })}
      <dl class="specs">
        <div><dt>Profilo</dt><dd>${val(c.audience, 'Profilo professionale consigliato')}</dd></div>
        <div><dt>Livello</dt><dd>${levelChip(c.level)}</dd></div>
        <div><dt>Prerequisiti</dt><dd>${val(c.prerequisites, 'Eventuali prerequisiti')}</dd></div>
        <div><dt>Per chi fa già Hair Spa</dt><dd>${val(c.forExperienced, 'Utilità del corso per chi ha già competenze')}</dd></div>
      </dl>
      ${c.id === 'wellness-ritual' ? '<p class="note">Il corso ideale per i <strong>primi approcci</strong> all’Hair Spa.</p>' : ''}
    </div>
    <div>
      ${sectionHead({ eyebrow: 'Come funziona', title: 'Informazioni pratiche' })}
      <dl class="specs">
        <div><dt>Accesso</dt><dd>${val(c.access, 'Modalità di accesso')}</dd></div>
        <div><dt>Fruizione</dt><dd>${val(c.fruition, 'Come si seguono le lezioni')}</dd></div>
        <div><dt>Disponibilità</dt><dd>${val(c.availability, 'Durata della disponibilità dei contenuti')}</dd></div>
        <div><dt>Assistenza</dt><dd>${val(c.support, 'Eventuale assistenza')}</dd></div>
        <div><dt>Requisiti tecnici</dt><dd>${val(c.requirements, 'Dispositivi e connessione')}</dd></div>
      </dl>
    </div>
  </div>
</section>

<!-- 04 IMMAGINE -->
${c.sectionImage ? fullImage(ctx, c.sectionImage.media, { position: c.sectionImage.pos, provisional: c.sectionImage.provisional, cls: 'fullimg--band' }) : ''}

<!-- 05 ISCRIZIONE -->
<section class="sec sec--choc enroll" id="iscrizione">
  <div class="wrap enroll__in">
    <div>
      ${eyebrow('Iscrizione')}
      <h2 class="h2serif">${esc(c.name)}</h2>
      ${priceLine(c)}
      ${promoBanner(c)}
      <p>L’acquisto avviene sulla <strong>piattaforma Élite Experience Academy</strong>.</p>
    </div>
    <div class="enroll__actions">${btn(ctx, { label: 'Acquista ora', to: buyUrl, ext: true, variant: 'light' })}</div>
  </div>
</section>

<!-- 06 FAQ -->
<section class="sec">
  <div class="wrap split split--4-8">
    <div>${sectionHead({ eyebrow: 'FAQ', title: 'Rispondiamo ai tuoi dubbi.' })}</div>
    ${faqList(courseFaq(ctx, c), ctx)}
  </div>
</section>

<!-- 07 CONTINUA LA FORMAZIONE -->
<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Continua la formazione', title: 'Percorsi coerenti con questo corso.' })}
    <div class="related">
      ${related.map((r) => r.col
        ? `<article class="related__col"><p class="eyebrow">La collezione completa</p><h3 class="h3serif">${esc(collection.name)}</h3><p>${draft(collection.description)}</p>${r.reason ? `<p class="related__why">${esc(r.reason)}</p>` : ''}${arrow(ctx, { label: 'Scopri la collezione', to: 'academy/formazione-online/#collezione' })}</article>`
        : `<div class="related__item">${courseCard(ctx, r.c)}${r.reason ? `<p class="related__why">${esc(r.reason)}</p>` : ''}</div>`).join('')}
    </div>
  </div>
</section>`;
      return page(ctx, {
        title: `${c.name} — Corso online Hair Spa | Élite Experience Academy`,
        description: `${c.name}: corso online del Metodo Élite, videolezione di ${c.duration || '1 h'}${c.price != null ? ` a ${priceText(c)}` : ''}. Cosa imparerai, a chi è rivolto e come acquistarlo.`,
        jsonld: [courseLd(c), breadcrumbs(crumbs), faqPage(courseFaq(ctx, c))],
        ogImage: c.heroImage || 'lavatesta',
        bodyClass: 'p-course',
        body,
      });
    },
  };
}

// Domande del corso: prezzo e livello dai dati del corso, poi le domande generali sui corsi online
function courseFaq(ctx, c) {
  const wellness = ctx.data.courses.find((x) => x.id === 'wellness-ritual');
  const items = [];
  if (c.price != null) items.push({ q: `Quanto costa il ${c.name}?`, a: `${c.price} €${c.vatIncluded ? ' IVA inclusa' : ''}. Il corso si acquista sulla piattaforma Élite Experience Academy.`, verified: true, link: { label: 'Vai alla piattaforma Academy', to: c.purchaseUrl || site.academyUrl, ext: true } });
  if (c.level) {
    items.push(c.id === 'wellness-ritual'
      ? { q: `Il ${c.name} è adatto a chi inizia?`, a: 'Sì: è il corso ideale per i primi approcci all’Hair Spa.', verified: c.level.verified }
      : { q: `Che livello ha il ${c.name}?`, a: `Livello ${c.level.label}. Per i primi approcci all’Hair Spa il corso consigliato è il ${wellness.name}.`, verified: c.level.verified, link: { label: wellness.name, to: courseUrl(wellness) } });
  }
  return [...items, ...(c.faq || []), ...faqPick(ctx.data, ['lezioni', 'accesso', 'tempi', 'durata-accesso', 'assistenza'])];
}

export default (data) => data.courses.map((c) => coursePage(c, data.courses, data.collection));
