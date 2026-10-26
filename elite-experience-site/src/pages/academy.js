import { site } from '../config.js';
import { esc, draft, eyebrow, sectionHead, btn, arrow, media, faqList, faqAll, faqGroups } from '../components/core.js';
import { collectionBlock, courseImage, courseUrl, levelChip, priceText } from '../components/course.js';
import { breadcrumbs, faqPage } from '../components/seo.js';
import { page } from '../components/layout.js';
import { fullHero, fullImage } from '../components/blocks.js';

const cAcademy = [{ label: 'Home', to: '' }, { label: 'Academy', to: 'academy/' }];
const cOnline = [...cAcademy, { label: 'Formazione Online', to: 'academy/formazione-online/' }];
const cPresence = [...cAcademy, { label: 'Formazione in Presenza', to: 'academy/formazione-in-presenza/' }];

// Livelli su una scala di quattro gradini, per il confronto visivo
const LEVELS = ['Primi approcci', 'Base', 'Medium', 'Pro'];
const levelSteps = { 'Primi approcci': [0], 'Base e Medium': [1, 2], Medium: [2], Pro: [3] };
const levelMeter = (level) => {
  const on = (level && levelSteps[level.label]) || [];
  return `<span class="lvl" role="img" aria-label="Livello ${esc(level ? level.label : 'da definire')}">${LEVELS.map((_, i) => `<i${on.includes(i) ? ' class="on"' : ''}></i>`).join('')}</span>`;
};

// Confronto dei cinque rituali, con la breve descrizione di ogni corso
const compareCards = (ctx, courses) => `<div class="cmp" role="list">
      ${courses.map((c, i) => `<article class="cmp__card" role="listitem">
        <a class="cmp__media" href="${ctx.href(courseUrl(c))}" tabindex="-1" aria-hidden="true">${courseImage(ctx, c, { ratio: '3/2' })}</a>
        <p class="cmp__n">${String(i + 1).padStart(2, '0')}</p>
        <h3 class="cmp__name"><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></h3>
        <p class="cmp__desc">${draft(c.shortDescription)}</p>
        <div class="cmp__row"><span class="cmp__k">Livello</span><span class="cmp__level">${levelMeter(c.level)}<b>${esc(c.level ? c.level.label : '')}</b></span></div>
        <div class="cmp__row"><span class="cmp__k">Tecniche principali</span><span class="cmp__tech">${(c.techniques || []).map((t) => esc(t)).join(' · ')}</span></div>
        <div class="cmp__row"><span class="cmp__k">Modalità</span><span>Online</span></div>
        <p class="cmp__price">${esc(priceText(c))}</p>
        ${arrow(ctx, { label: 'Scheda del corso', to: courseUrl(c), cls: 'arrow--light' })}
      </article>`).join('')}
    </div>`;

/* ---------------- PANORAMICA ---------------- */
const academyPage = {
  route: 'academy/',
  render(ctx) {
    const { courses, collection, faq } = ctx.data;
    const wellness = courses.find((c) => c.id === 'wellness-ritual');
    const min = Math.min(...courses.map((c) => c.price).filter((p) => p != null));
    const body = `
${fullHero(ctx, {
  image: 'academySpazzola', position: '50% 45%', positionMobile: '52% 45%', cls: 'hero--line',
  eyebrow: 'Élite Experience Academy',
  title: 'La formazione Hair Spa del Metodo <em>Élite</em>.',
  lead: 'Percorsi online e in presenza per apprendere rituali, tecniche e manualità Hair Spa, pensati per professionisti e saloni.',
})}

<section class="sec modes-sec" id="modalita">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Due modalità', title: 'Online o in presenza: lo stesso metodo.', lead: 'Scegli come imparare. Le due modalità condividono rituali, tecniche e manualità del Metodo Élite.', cls: 'shead--wide' })}
    <div class="switch" data-switch>
      <div class="switch__tabs" role="tablist" aria-label="Modalità di formazione">
        <button type="button" role="tab" id="sw-online" aria-controls="sw-p-online" aria-selected="true"><span>01</span>Formazione online</button>
        <button type="button" role="tab" id="sw-presenza" aria-controls="sw-p-presenza" aria-selected="false" tabindex="-1"><span>02</span>Formazione in presenza</button>
      </div>
      <div class="switch__panel" role="tabpanel" id="sw-p-online" aria-labelledby="sw-online">
        <div class="switch__lead">
          <p class="switch__big">Impara con i tuoi tempi, <em>dove vuoi</em>.</p>
          <p>Videolezioni teoriche e dimostrative dedicate all’apprendimento dei rituali e delle manualità Hair Spa. Ogni corso ha una scheda con competenze, tecniche e programma.</p>
          ${arrow(ctx, { label: 'Scopri la formazione online', to: 'academy/formazione-online/' })}
        </div>
        <dl class="switch__facts">
          <div><dt>Modalità</dt><dd>Videolezioni teoriche e dimostrative</dd></div>
          <div><dt>Accesso</dt><dd>Account dedicato su piattaforma Academy</dd></div>
          <div><dt>Acquisto</dt><dd>Sulla piattaforma Academy</dd></div>
          <div><dt>Corsi</dt><dd>${courses.length} rituali, da ${esc(priceText({ price: min, vatIncluded: true }))}</dd></div>
        </dl>
      </div>
      <div class="switch__panel" role="tabpanel" id="sw-p-presenza" aria-labelledby="sw-presenza" hidden>
        <div class="switch__lead">
          <p class="switch__big">Impara <em>accanto a Elisabetta</em>.</p>
          <p>Percorsi pratici con Elisabetta Tancini, presso il salone Maison BB ad Arona o direttamente nel salone del professionista.</p>
          ${arrow(ctx, { label: 'Scopri la formazione in presenza', to: 'academy/formazione-in-presenza/' })}
        </div>
        <dl class="switch__facts">
          <div><dt>Con</dt><dd>Elisabetta Tancini</dd></div>
          <div><dt>Dove</dt><dd>Arona – Salone Maison BB, o nel tuo salone</dd></div>
          <div><dt>Partecipanti</dt><dd>Max 8 persone ad Arona, il team del salone nel tuo salone</dd></div>
          <div><dt>Calendario</dt><dd>Disponibilità da concordare</dd></div>
        </dl>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--ivory" id="percorsi">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Due esigenze', title: 'Da dove parte il tuo salone?' })}
    <div class="needs">
      <article class="need need--choc" id="iniziare">
        <p class="eyebrow">Per chi desidera iniziare</p>
        <h3 class="h2serif">Acquisire competenze e conoscere i rituali Hair Spa.</h3>
        <p>Per il salone che vuole introdurre l’Hair Spa: capire da dove partire, quali competenze acquisire e quali corsi scegliere per le prime manualità.</p>
        <p class="sub-h">Percorsi consigliati</p>
        <ul class="taglist taglist--light"><li><a href="${ctx.href(courseUrl(wellness))}">${esc(wellness.name)}</a> ${levelChip(wellness.level)}</li><li><a href="${ctx.href('academy/formazione-in-presenza/')}">Formazione in presenza</a></li></ul>
      </article>
      <article class="need need--dark" id="approfondire">
        <p class="eyebrow">Per chi desidera approfondire</p>
        <h3 class="h2serif">Perfezionare le manualità e ampliare il repertorio.</h3>
        <p>Per il salone che offre già servizi Hair Spa e vuole conoscere nuove manualità e le differenze tra i singoli rituali.</p>
        <p class="sub-h">Percorsi consigliati</p>
        <ul class="taglist taglist--light">${courses.filter((c) => c.id !== 'wellness-ritual').map((c) => `<li><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></li>`).join('')}<li><a href="${ctx.href('academy/formazione-online/#collezione')}">${esc(collection.name)}</a></li></ul>
      </article>
    </div>
  </div>
</section>

${fullImage(ctx, 'arcoDoratoMani', { position: '50% 50%', positionMobile: '55% 50%' })}

<section class="sec" id="faq">
  <div class="wrap split split--4-8">
    <div class="faq-aside">
      ${sectionHead({ eyebrow: 'FAQ', title: 'Rispondiamo ai tuoi dubbi.' })}
      <ul class="faq-index">${faq.groups.map((g) => `<li><a href="${ctx.href(`#faq-${g.id}`)}">${esc(g.title)}</a></li>`).join('')}</ul>
      <p>Non trovi la risposta? ${arrow(ctx, { label: 'Scrivici', to: 'contatti/#formazione' })}</p>
      <p class="platform">${btn(ctx, { label: 'Accedi alla piattaforma Academy', to: site.academyUrl, ext: true, variant: 'ghost' })}</p>
    </div>
    ${faqGroups(ctx, faq.groups, { idPrefix: 'faq-' })}
  </div>
</section>`;
    return page(ctx, {
      title: 'Academy — Formazione Hair Spa online e in presenza | Élite Experience',
      description: 'L’Academy di Élite Experience: formazione Hair Spa online e in presenza con Elisabetta Tancini. Due modalità e il percorso giusto per il tuo salone.',
      jsonld: [breadcrumbs(cAcademy), faqPage(faqAll(ctx.data))],
      bodyClass: 'p-academy',
      body,
    });
  },
};

/* ---------------- FORMAZIONE ONLINE ---------------- */
const onlinePage = {
  route: 'academy/formazione-online/',
  render(ctx) {
    const { courses, collection, faq } = ctx.data;
    const body = `
${fullHero(ctx, {
  image: 'onlinePostazione', position: '50% 50%', positionMobile: '56% 50%',
  eyebrow: 'Academy',
  title: 'Formazione <em>Online</em>',
  lead: 'Videolezioni teoriche e dimostrative dedicate all’apprendimento dei rituali e delle manualità Hair Spa del Metodo Élite.',
})}

<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Le modalità del percorso', title: 'Imparare online il Metodo Élite.' })}
    <ul class="howto howto--3">
      <li><span class="howto__n">01</span><h3>Le videolezioni</h3><p>Lezioni teoriche e dimostrative su rituali e manualità.</p></li>
      <li><span class="howto__n">02</span><h3>Accesso</h3><p>Video di 1 ora, accesso in piattaforma Academy.</p></li>
      <li><span class="howto__n">03</span><h3>Assistenza</h3><p>Team Élite Experience.</p></li>
    </ul>
  </div>
</section>

<section class="sec sec--deep compare-sec" id="confronto">
  <div class="wrap">
    <div class="row-head">
      ${sectionHead({ eyebrow: 'Scopri i corsi online', title: 'Cinque rituali, a confronto.' })}
      <ol class="lvl-legend" aria-label="Scala dei livelli">${LEVELS.map((l, i) => `<li><span class="lvl">${LEVELS.map((_, k) => `<i${k === i ? ' class="on"' : ''}></i>`).join('')}</span>${esc(l)}</li>`).join('')}</ol>
    </div>
    ${compareCards(ctx, courses)}
    <div id="collezione">${collectionBlock(ctx, collection, courses)}</div>
  </div>
</section>

<section class="sec" id="faq-online">
  <div class="wrap split split--4-8">
    <div class="faq-aside">${sectionHead({ eyebrow: 'FAQ', title: 'Rispondiamo ai tuoi dubbi.' })}<p>${arrow(ctx, { label: 'Tutte le domande frequenti', to: 'academy/#faq' })}</p></div>
    ${faqGroups(ctx, faq.groups.filter((g) => ['scegliere', 'prezzi', 'online'].includes(g.id)))}
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap split split--6-6">
    <div>${sectionHead({ eyebrow: 'Non sai da dove iniziare?', title: 'Ti aiutiamo a scegliere.' })}</div>
    <div><p class="lead">Raccontaci la tua esperienza e il tuo salone: ti indichiamo il percorso più adatto.</p>${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#formazione' })}</div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Formazione Online Hair Spa — Corsi del Metodo Élite | Élite Experience',
      description: 'I corsi online del Metodo Élite: Wellness Ritual, Pinda Ritual, Brushing Ritual, Hairgym Ritual e Relax Full Ritual. Videolezioni di 1 ora su piattaforma Academy, da 190 € IVA inclusa.',
      jsonld: [breadcrumbs(cOnline)],
      ogImage: 'onlinePostazione',
      bodyClass: 'p-online',
      body,
    });
  },
};

/* ---------------- FORMAZIONE IN PRESENZA ---------------- */
const learn = [
  ['Manualità', 'Pressione, ritmo e continuità del gesto, allenati con dimostrazioni ed esercitazioni guidate.'],
  ['Sequenze', 'La struttura completa del rituale: accoglienza, consulenza, detersione, manualità e conclusione dell’esperienza.'],
  ['Strumenti e postazione', 'Preparazione della postazione e uso dei materiali e degli strumenti previsti da ciascun rituale.'],
  ['Applicazione in salone', 'Come portare il rituale nel lavoro quotidiano, organizzarne i tempi e renderlo replicabile.'],
  ['Confronto diretto', 'Domande, correzioni e consigli sul proprio modo di lavorare, a stretto contatto con Elisabetta.'],
];

const presencePage = {
  route: 'academy/formazione-in-presenza/',
  render(ctx) {
    const { courses, faq } = ctx.data;
    const body = `
${fullHero(ctx, {
  image: 'presenzaHero', position: '50% 45%', positionMobile: '56% 40%',
  eyebrow: 'Academy',
  title: 'Formazione <em>in presenza</em>',
  lead: 'Percorsi pratici per apprendere tecniche, rituali e manualità Hair Spa direttamente con Elisabetta Tancini, presso il salone Maison BB ad Arona o nel tuo salone.',
})}

<section class="sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Due modalità', title: 'Ad Arona o nel tuo salone.' })}
    <div class="duo duo--cards">
      <article class="duo__item">
        ${media(ctx, 'salaHairSpa', { ratio: '16/10', position: '50% 55%' })}
        <h3 class="h3serif">Presso la sede di Arona</h3>
        <p>Percorso formativo in presenza presso Maison BB, il salone di Elisabetta ad Arona.</p>
        <ul class="facts"><li><span>Sede</span>Arona – Salone Maison BB</li><li><span>Partecipanti</span>Max 8 persone</li></ul>
      </article>
      <article class="duo__item">
        ${media(ctx, 'materialiRituale', { ratio: '16/10', position: '50% 50%' })}
        <h3 class="h3serif">Direttamente nel salone</h3>
        <p>Formazione organizzata presso la sede del professionista, con il suo team.</p>
        <ul class="facts"><li><span>Dove</span>Nel salone del professionista</li><li><span>Partecipanti</span>Team del salone</li></ul>
      </article>
    </div>
  </div>
</section>

<section class="sec sec--deep learnp">
  <div class="wrap">
    <div class="learnp__head">
      ${sectionHead({ eyebrow: 'Cosa si apprende', title: 'Competenze, tecniche e rituali.' })}
      <p class="lead">In presenza il metodo si apprende con le mani: Elisabetta mostra ogni gesto, lo spiega e lo corregge, mentre il professionista lo ripete fino a renderlo proprio.</p>
    </div>
    <ol class="learnp__list">
      ${learn.map(([t, d], i) => `<li><span class="learnp__n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}
    </ol>
    <div class="learnp__rituals">
      <p class="sub-h">I rituali del Metodo Élite</p>
      <ul class="taglist taglist--light">${courses.map((c) => `<li><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="sec" id="faq-presenza">
  <div class="wrap split split--4-8">
    <div class="faq-aside">${sectionHead({ eyebrow: 'FAQ', title: 'Rispondiamo ai tuoi dubbi.' })}<p>${arrow(ctx, { label: 'Tutte le domande frequenti', to: 'academy/#faq' })}</p></div>
    ${faqList(faq.groups.find((g) => g.id === 'presenza').items, ctx)}
  </div>
</section>

<section class="sec sec--deep band">
  <div class="wrap band__in">
    <h2 class="h2serif">Organizza la tua formazione con Elisabetta.</h2>
    <div class="actions">${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#presenza', variant: 'light' })}</div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Formazione Hair Spa in Presenza con Elisabetta Tancini — Arona o nel tuo salone',
      description: 'Formazione Hair Spa in presenza con Elisabetta Tancini, presso il salone Maison BB ad Arona (max 8 persone) o direttamente nel salone con il tuo team.',
      jsonld: [breadcrumbs(cPresence)],
      bodyClass: 'p-presence',
      body,
    });
  },
};

export default [academyPage, onlinePage, presencePage];
