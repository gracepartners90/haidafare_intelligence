// Modello unico per tutte le schede corso: i contenuti arrivano da src/content/courses.json.
import { site } from '../config.js';
import { esc, tbd, draft, eyebrow, sectionHead, btn, arrow, media, slot, visual, tbdBlock, breadcrumb, accordion, faqList, faqPick, videoBlock } from '../components/core.js';
import { courseCard, courseImage, courseUrl, levelChip, priceLine, promoBanner } from '../components/course.js';
import { course as courseLd, breadcrumbs, faqPage } from '../components/seo.js';
import { page } from '../components/layout.js';

const list = (items, fallback) => (items && items.length
  ? `<ul class="bul">${items.map((x) => `<li>${esc(x.title || x)}${x.text ? `<span>${esc(x.text)}</span>` : ''}</li>`).join('')}</ul>`
  : fallback);

const val = (v, label) => (v ? esc(v) : tbd(label));

function competencies(c) {
  if (c.competencies && c.competencies.length) {
    return `<ol class="learn">${c.competencies.map((x, i) => `<li><span class="learn__n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(x.title || x)}</h3>${x.text ? `<p>${esc(x.text)}</p>` : ''}</div></li>`).join('')}</ol>`;
  }
  const slots = [
    ['Tecnica principale', 'Quale tecnica Hair Spa viene insegnata e come si esegue.'],
    ['Manualità', 'Le manualità specifiche del rituale: movimento, pressione, ritmo.'],
    ['Sequenza operativa', 'L’ordine dei passaggi e la loro organizzazione nel rituale.'],
    ['Strumenti e materiali', 'Eventuali strumenti utilizzati e come impiegarli.'],
    ['Organizzazione del rituale', 'Preparazione della postazione, tempi, accoglienza del cliente.'],
    ['Applicazione in salone', 'Come la competenza si porta nel lavoro quotidiano.'],
  ];
  return `<ol class="learn learn--tbd">${slots.map(([t, d], i) => `<li><span class="learn__n">${String(i + 1).padStart(2, '0')}</span><div><h3>${tbd(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}</ol>
  <p class="learn__note">Da compilare esclusivamente sul programma ufficiale del corso, con descrizioni orientate all’apprendimento professionale.</p>`;
}

function program(c) {
  if (c.program && c.program.modules && c.program.modules.length) {
    return accordion(c.program.modules.map((m, i) => ({
      title: `<b>Modulo ${String(i + 1).padStart(2, '0')}</b> ${esc(m.title)}${m.duration ? `<em>${esc(m.duration)}</em>` : ''}`,
      body: `${m.topics ? `<p class="sub-h">Argomenti</p>${list(m.topics)}` : ''}${m.skills ? `<p class="sub-h">Competenze</p>${list(m.skills)}` : ''}`,
    })), { cls: 'acc--program' });
  }
  return accordion([1, 2, 3].map((n) => ({
    title: `<b>Modulo ${String(n).padStart(2, '0')}</b> ${tbd('Titolo del modulo')}`,
    body: `<dl class="specs specs--tight">
      <div><dt>Argomenti trattati</dt><dd>${tbd('Elenco delle lezioni e degli argomenti')}</dd></div>
      <div><dt>Competenze affrontate</dt><dd>${tbd('Competenze sviluppate nel modulo')}</dd></div>
      <div><dt>Durata</dt><dd>${tbd('Se documentata')}</dd></div>
    </dl>`,
  })), { cls: 'acc--program' });
}

function coursePage(c, all, collection) {
  const crumbs = [
    { label: 'Home', to: '' }, { label: 'Academy', to: 'academy/' },
    { label: 'Formazione Online', to: 'academy/formazione-online/' }, { label: c.name, to: courseUrl(c) },
  ];
  return {
    route: courseUrl(c),
    render(ctx) {
      const buyUrl = c.purchaseUrl || site.academyUrl;
      const gallery = [...(c.gallery || []).map((k) => ({ key: k })), ...(c.gallerySlots || []).map((s) => ({ subject: s }))].slice(0, 3);
      const related = (c.related || []).map((r) => (r.id === 'collection' ? { col: true, reason: r.reason } : { c: all.find((x) => x.id === r.id), reason: r.reason }));

      const body = `
<!-- 01 HERO DEL CORSO -->
<section class="chero">
  <div class="chero__text">
    ${breadcrumb(ctx, crumbs)}
    <p class="chero__meta"><span class="chip chip--solid">Formazione online</span>${levelChip(c.level)}${c.nameVerified ? '' : '<span class="chip chip--tbd">Nome ufficiale da verificare</span>'}</p>
    <h1 class="chero__title">${esc(c.name)}</h1>
    <p class="chero__lead">${draft(c.shortDescription)}</p>
    <dl class="chero__facts">
      <div><dt>Modalità</dt><dd>Videolezioni online</dd></div>
      <div><dt>Durata</dt><dd>${tbd('Da confermare')}</dd></div>
      <div><dt>Lezioni</dt><dd>${tbd('Numero da confermare')}</dd></div>
      <div><dt>Prezzo</dt><dd>${c.price != null ? `€ ${esc(c.price)}` : tbd('Da verificare')}</dd></div>
    </dl>
    ${promoBanner(c)}
    <div class="actions">
      ${btn(ctx, { label: 'Iscriviti al corso', to: buyUrl, ext: true })}
      ${btn(ctx, { label: 'Cosa imparerai', to: '#cosa-imparerai', variant: 'ghost' })}
    </div>
    <p class="chero__pdf">${c.pdf ? `<a href="${ctx.asset(c.pdf)}" download>Scarica la scheda tecnica (PDF)</a>` : `Scheda tecnica PDF ${tbd('da allegare')}`}</p>
  </div>
  <div class="chero__media">
    ${c.heroImage ? media(ctx, c.heroImage, { fill: true, eager: true, position: '58% 45%' }) : courseImage(ctx, c, { fill: true })}
    <button class="chero__play" type="button" data-video-open data-video-title="Anteprima — ${esc(c.name)}" data-video-note="Inserire un estratto autentico del corso (non un video generico di trattamento)."${c.video && c.video.src ? ` data-video-src="${ctx.asset(c.video.src)}"` : ''}><span class="video__icon" aria-hidden="true"></span>Anteprima del corso</button>
  </div>
</section>

<!-- 02 COSA IMPARERAI -->
<section class="sec learn-sec" id="cosa-imparerai">
  <div class="wrap">
    ${sectionHead({ eyebrow: c.name, title: 'Cosa imparerai', lead: 'Le competenze concrete che il professionista acquisisce con il corso.' })}
    ${competencies(c)}
  </div>
</section>

<!-- 03 TECNICHE E MANUALITÀ -->
<section class="sec sec--deep tech">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Tecniche e manualità', title: 'Le tecniche che approfondirai' })}
    <div class="tech__grid">
      <div class="tech__a">${gallery[0] ? visual(ctx, { ...gallery[0], ratio: '4/5', tone: 'dark' }) : ''}</div>
      <div class="tech__b">${videoBlock(ctx, { poster: c.video && c.video.poster, src: c.video && c.video.src, posterSubject: 'Frame dimostrativo della manualità principale', title: 'La manualità in dettaglio', note: 'Inserire un estratto dimostrativo autentico del corso.', ratio: '16/10' })}</div>
      <div class="tech__c">${gallery[1] ? visual(ctx, { ...gallery[1], ratio: '1/1', tone: 'dark' }) : ''}</div>
      <div class="tech__text">
        <p class="sub-h">Tecniche</p>
        ${list(c.techniques, `<p>${tbd('Tecniche insegnate, da programma ufficiale')}</p>`)}
        <p class="sub-h">Manualità</p>
        ${list(c.manualities, `<p>${tbd('Manualità specifiche del rituale')}</p>`)}
        <p class="sub-h">Sequenza operativa</p>
        <ol class="steps">${[1, 2, 3, 4].map((n) => `<li><span>${n}</span>${tbd('Passaggio operativo')}</li>`).join('')}</ol>
      </div>
      <div class="tech__d">${gallery[2] ? visual(ctx, { ...gallery[2], ratio: '16/9', tone: 'dark' }) : ''}</div>
    </div>
  </div>
</section>

<!-- 04 PROGRAMMA -->
<section class="sec">
  <div class="wrap split split--4-8">
    <div>${sectionHead({ eyebrow: 'Programma formativo', title: 'Il programma del corso' })}<p>Moduli, argomenti e competenze, in ordine di apprendimento.</p></div>
    ${program(c)}
  </div>
</section>

<!-- 05 APPLICAZIONE IN SALONE -->
<section class="sec sec--ivory">
  <div class="wrap split split--6-6">
    <div>
      ${sectionHead({ eyebrow: 'Applicazione', title: 'Dalla formazione alla pratica in salone' })}
      <p class="lead">${c.salonApplication ? esc(c.salonApplication) : draft('Il corso è pensato per essere portato nel lavoro quotidiano: dalla preparazione della postazione all’esecuzione del rituale con il cliente.')}</p>
    </div>
    ${tbdBlock({ title: 'Come si applica nel salone', lines: ['Preparazione della postazione e dei materiali', 'Tempi del rituale nell’agenda del salone', 'Come presentare il rituale al cliente'], note: 'Descrivere l’applicazione pratica, senza promettere risultati economici non dimostrati.' })}
  </div>
</section>

<!-- 06 A CHI È RIVOLTO + 07 COME FUNZIONA -->
<section class="sec">
  <div class="wrap split split--6-6">
    <div>
      ${sectionHead({ eyebrow: 'A chi è rivolto', title: 'Il profilo consigliato' })}
      <dl class="specs">
        <div><dt>Profilo</dt><dd>${val(c.audience, 'Profilo professionale consigliato')}</dd></div>
        <div><dt>Livello</dt><dd>${levelChip(c.level)}</dd></div>
        <div><dt>Prerequisiti</dt><dd>${val(c.prerequisites, 'Eventuali prerequisiti')}</dd></div>
        <div><dt>Per chi fa già Hair Spa</dt><dd>${tbd('Utilità del corso per chi ha già competenze')}</dd></div>
      </dl>
      ${c.id === 'wellness-ritual' ? '<p class="note">Il corso ideale per i primi approcci all’Hair Spa.</p>' : ''}
    </div>
    <div>
      ${sectionHead({ eyebrow: 'Come funziona', title: 'Informazioni pratiche' })}
      <dl class="specs">
        <div><dt>Accesso</dt><dd>${val(c.access, 'Modalità di accesso')}</dd></div>
        <div><dt>Fruizione</dt><dd>${val(c.fruition, 'Come si seguono le lezioni')}</dd></div>
        <div><dt>Disponibilità</dt><dd>${val(c.availability, 'Durata della disponibilità dei contenuti')}</dd></div>
        <div><dt>Materiali inclusi</dt><dd>${val(c.materials, 'Materiali didattici')}</dd></div>
        <div><dt>Assistenza</dt><dd>${val(c.support, 'Eventuale assistenza')}</dd></div>
        <div><dt>Requisiti tecnici</dt><dd>${val(c.requirements, 'Dispositivi e connessione')}</dd></div>
      </dl>
    </div>
  </div>
</section>

<!-- 08 ANTEPRIMA VIDEO -->
<section class="sec sec--beige">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Anteprima', title: 'Un estratto del corso', lead: 'Una parte autentica della formazione, per vedere come sono costruite le lezioni.' })}
    ${videoBlock(ctx, { poster: c.heroImage, src: c.video && c.video.src, posterSubject: 'Frame dell’estratto del corso', title: `Estratto da ${c.name}`, note: 'Inserire un estratto autentico del corso: non utilizzare video generici di trattamenti al posto di una lezione.', ratio: '16/9', cls: 'video--wide' })}
  </div>
</section>

<!-- 09 ISCRIZIONE -->
<section class="sec sec--choc enroll" id="iscrizione">
  <div class="wrap enroll__in">
    <div>
      ${eyebrow('Iscrizione')}
      <h2 class="h2serif">${esc(c.name)}</h2>
      ${priceLine(c)}
      ${promoBanner(c)}
      <p>L’acquisto avviene sulla piattaforma Élite Experience Academy.</p>
    </div>
    <div class="enroll__actions">
      ${btn(ctx, { label: 'Iscriviti sulla piattaforma Academy', to: buyUrl, ext: true, variant: 'light' })}
      ${arrow(ctx, { label: 'Richiedi informazioni', to: 'contatti/#formazione', cls: 'arrow--light' })}
      ${c.purchaseUrl ? '' : `<p class="small">${tbd('Link diretto al corso sulla piattaforma da verificare')}</p>`}
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="sec">
  <div class="wrap split split--4-8">
    <div>${sectionHead({ eyebrow: 'FAQ', title: 'Domande sul corso' })}</div>
    ${faqList(courseFaq(ctx, c), ctx)}
  </div>
</section>

<!-- 10 CONTINUA LA FORMAZIONE -->
<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Continua la formazione', title: 'Percorsi coerenti con questo corso.' })}
    <div class="related">
      ${related.map((r) => r.col
        ? `<article class="related__col"><p class="eyebrow">La collezione completa</p><h3 class="h3serif">${esc(collection.name)}</h3><p>${draft(collection.description)}</p><p class="related__why">${r.reason ? esc(r.reason) : tbd('Relazione da definire sui programmi')}</p>${arrow(ctx, { label: 'Scopri la collezione', to: 'academy/formazione-online/#collezione' })}</article>`
        : `<div class="related__item">${courseCard(ctx, r.c, { size: 'm' })}<p class="related__why">${r.reason ? esc(r.reason) : tbd('Relazione da definire sulle competenze')}</p></div>`).join('')}
    </div>
  </div>
</section>`;
      return page(ctx, {
        title: `${c.name} — Corso online Hair Spa | Élite Experience Academy`,
        description: `${c.name}: scheda tecnica del corso online del Metodo Élite. Cosa imparerai, tecniche e manualità, programma, a chi è rivolto e iscrizione.`,
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
  if (c.price != null) items.push({ q: `Quanto costa il ${c.name}?`, a: `${c.price} €. Il corso si acquista sulla piattaforma Élite Experience Academy.`, verified: true, link: { label: 'Vai alla piattaforma Academy', to: c.purchaseUrl || site.academyUrl, ext: true } });
  if (c.level) {
    items.push(c.id === 'wellness-ritual'
      ? { q: `Il ${c.name} è adatto a chi inizia?`, a: 'Sì: è il corso ideale per i primi approcci all’Hair Spa.', verified: c.level.verified }
      : { q: `Che livello ha il ${c.name}?`, a: `Livello ${c.level.label}. Per i primi approcci all’Hair Spa il corso consigliato è il ${wellness.name}.`, verified: c.level.verified, link: { label: wellness.name, to: courseUrl(wellness) } });
  }
  return [...items, ...(c.faq || []), ...faqPick(ctx.data, ['lezioni', 'accesso', 'tempi', 'durata-accesso', 'materiali', 'assistenza'])];
}

export default (data) => data.courses.map((c) => coursePage(c, data.courses, data.collection));
