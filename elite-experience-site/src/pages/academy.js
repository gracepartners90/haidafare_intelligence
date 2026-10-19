import { site } from '../config.js';
import { esc, tbd, draft, eyebrow, sectionHead, btn, arrow, media, slot, tbdBlock, breadcrumb, faqList, videoBlock } from '../components/core.js';
import { courseCard, collectionBlock, courseUrl, levelChip, priceLine, promoBanner } from '../components/course.js';
import { breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';

const cAcademy = [{ label: 'Home', to: '' }, { label: 'Academy', to: 'academy/' }];
const cOnline = [...cAcademy, { label: 'Formazione Online', to: 'academy/formazione-online/' }];
const cPresence = [...cAcademy, { label: 'Formazione in Presenza', to: 'academy/formazione-in-presenza/' }];

const academyPage = {
  route: 'academy/',
  render(ctx) {
    const { courses, collection, faq } = ctx.data;
    const body = `
<section class="phero phero--center">
  <div class="wrap">
    ${breadcrumb(ctx, cAcademy)}
    ${eyebrow('Élite Experience Academy')}
    <h1 class="phero__title">La formazione Hair Spa del Metodo Élite.</h1>
    <p class="phero__lead">Percorsi online e in presenza per apprendere rituali, tecniche e manualità Hair Spa, pensati per professionisti e saloni.</p>
    <div class="actions actions--center">
      ${btn(ctx, { label: 'Esplora i corsi online', to: 'academy/formazione-online/' })}
      ${btn(ctx, { label: 'Formazione in presenza', to: 'academy/formazione-in-presenza/', variant: 'ghost' })}
    </div>
  </div>
</section>

<section class="modes">
  <article class="mode mode--online">
    ${videoBlock(ctx, { poster: 'ritualeOlio', posterPos: '45% 50%', title: 'Dentro una videolezione', note: 'Inserire un estratto autentico di una videolezione.', ratio: '16/9' })}
    <div class="mode__body">
      <p class="eyebrow">Online</p>
      <h2 class="h2serif">Formazione Online</h2>
      <p>Videolezioni teoriche e dimostrative dedicate all’apprendimento dei rituali e delle manualità Hair Spa. Ogni corso ha una scheda tecnica con competenze, tecniche e programma.</p>
      <ul class="facts">
        <li><span>Formato</span>Videolezioni teoriche e dimostrative</li>
        <li><span>Accesso</span>${tbd('Modalità di accesso da confermare')}</li>
        <li><span>Acquisto</span>Sulla piattaforma Academy</li>
      </ul>
      ${btn(ctx, { label: 'Vai al catalogo online', to: 'academy/formazione-online/' })}
    </div>
  </article>
  <article class="mode mode--presence">
    ${media(ctx, 'lavatesta', { ratio: '16/9', position: '60% 45%' })}
    <div class="mode__body">
      <p class="eyebrow">In presenza</p>
      <h2 class="h2serif">Formazione in Presenza</h2>
      <p>Percorsi pratici con Elisabetta Tancini, presso la sede di Arona o direttamente nel salone del professionista.</p>
      <ul class="facts facts--light">
        <li><span>Con</span>Elisabetta Tancini</li>
        <li><span>Dove</span>Arona o nel tuo salone</li>
        <li><span>Calendario</span>${tbd('Disponibilità da confermare')}</li>
      </ul>
      ${btn(ctx, { label: 'Scopri la formazione in presenza', to: 'academy/formazione-in-presenza/', variant: 'light' })}
    </div>
  </article>
</section>

<section class="sec sec--beige">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Corsi disponibili', title: 'I corsi online del Metodo Élite.' })}
    <div class="cgrid">${courses.map((c, i) => courseCard(ctx, c, { size: i < 3 ? 'm' : 'l', cta: 'Scopri cosa imparerai' })).join('')}</div>
    ${collectionBlock(ctx, collection, courses)}
  </div>
</section>

<section class="sec" id="confronto">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Confronta i corsi', title: 'Le differenze tra i percorsi.', lead: 'Il confronto si completa con i dati dei programmi ufficiali.' })}
    <div class="table-wrap" role="region" aria-label="Confronto tra i corsi" tabindex="0">
      <table class="compare">
        <thead><tr><th scope="col">Corso</th><th scope="col">Modalità</th><th scope="col">Livello</th><th scope="col">Tecniche principali</th><th scope="col">Prezzo</th><th scope="col"><span class="sr-only">Scheda</span></th></tr></thead>
        <tbody>${courses.map((c) => `<tr>
          <th scope="row">${esc(c.name)}</th>
          <td>Online</td>
          <td>${levelChip(c.level)}</td>
          <td>${c.techniques ? esc(c.techniques.map((t) => t.title || t).join(', ')) : tbd('Da programma ufficiale')}</td>
          <td>${c.price != null ? `€ ${esc(c.price)}` : tbd('Da verificare')}</td>
          <td><a class="arrow" href="${ctx.href(courseUrl(c))}"><span>Scheda</span><i aria-hidden="true">→</i></a></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Guida alla scelta', title: 'Da dove partire.' })}
    <div class="guide">
      <article><p class="guide__q">Non hai ancora esperienza Hair Spa</p><p>Il Wellness Ritual è il corso ideale per i primi approcci all’Hair Spa.</p>${arrow(ctx, { label: 'Wellness Ritual', to: 'academy/formazione-online/wellness-ritual/' })}</article>
      <article><p class="guide__q">Offri già servizi Hair Spa</p><p>Scegli il rituale in base alle manualità che vuoi approfondire, confrontando i programmi delle schede.</p>${arrow(ctx, { label: 'Confronta i corsi', to: '#confronto' })}</article>
      <article><p class="guide__q">Vuoi il percorso completo</p><p>La collezione riunisce tutti i rituali del Metodo Élite in un unico percorso.</p>${arrow(ctx, { label: esc(collection.name), to: 'academy/formazione-online/#collezione' })}</article>
      <article><p class="guide__q">Vuoi imparare con Elisabetta</p><p>La formazione in presenza si svolge ad Arona o direttamente nel tuo salone.</p>${arrow(ctx, { label: 'Formazione in presenza', to: 'academy/formazione-in-presenza/' })}</article>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--5-7">
    <div>
      ${sectionHead({ eyebrow: 'FAQ', title: 'Domande frequenti.' })}
      <p>Non trovi la risposta? ${arrow(ctx, { label: 'Scrivici', to: 'contatti/#formazione' })}</p>
      <p class="platform">${btn(ctx, { label: 'Accedi alla piattaforma Academy', to: site.academyUrl, ext: true, variant: 'ghost' })}</p>
    </div>
    ${faqList(faq)}
  </div>
</section>`;
    return page(ctx, {
      title: 'Academy — Formazione Hair Spa online e in presenza | Élite Experience',
      description: 'L’Academy di Élite Experience: corsi online e formazione in presenza con Elisabetta Tancini per apprendere rituali, tecniche e manualità Hair Spa. Confronta i corsi e scegli il percorso.',
      jsonld: [breadcrumbs(cAcademy)],
      bodyClass: 'p-academy',
      body,
    });
  },
};

const onlinePage = {
  route: 'academy/formazione-online/',
  render(ctx) {
    const { courses, collection } = ctx.data;
    const body = `
<section class="phero phero--split phero--light">
  <div class="phero__text">
    ${breadcrumb(ctx, cOnline)}
    ${eyebrow('Academy — Formazione Online')}
    <h1 class="phero__title">Formazione Online</h1>
    <p class="phero__lead">Videolezioni teoriche e dimostrative dedicate all’apprendimento dei rituali e delle manualità Hair Spa del Metodo Élite.</p>
    <div class="actions">${btn(ctx, { label: 'Vedi i corsi', to: '#catalogo' })}${btn(ctx, { label: 'Piattaforma Academy', to: site.academyUrl, ext: true, variant: 'ghost' })}</div>
  </div>
  <div class="phero__media">${media(ctx, 'pinda', { fill: true, eager: true, position: '60% 45%' })}</div>
</section>

<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Come funziona', title: 'Imparare online il Metodo Élite.' })}
    <ul class="howto">
      <li><h3>Le videolezioni</h3><p>Lezioni teoriche e dimostrative su rituali e manualità.</p></li>
      <li><h3>Accesso</h3><p>${tbd('Modalità e durata dell’accesso da confermare')}</p></li>
      <li><h3>Materiali</h3><p>${tbd('Materiali inclusi da confermare')}</p></li>
      <li><h3>Assistenza</h3><p>${tbd('Modalità di assistenza da confermare')}</p></li>
    </ul>
  </div>
</section>

<section class="sec sec--beige" id="catalogo">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Catalogo', title: 'Scegli il rituale da imparare.', lead: 'Per ogni corso: descrizione, risultati di apprendimento, livello e accesso alla scheda completa.' })}
    <div class="cgrid">${courses.map((c, i) => courseCard(ctx, c, { size: i < 3 ? 'm' : 'l', showPrice: true, cta: 'Scopri cosa imparerai' })).join('')}</div>
  </div>
</section>

<section class="sec sec--deep" id="collezione">
  <div class="wrap">${collectionBlock(ctx, collection, courses)}</div>
</section>

<section class="sec">
  <div class="wrap split split--6-6">
    <div>${sectionHead({ eyebrow: 'Non sai da dove iniziare?', title: 'Ti aiutiamo a scegliere.' })}</div>
    <div><p class="lead">Raccontaci la tua esperienza e il tuo salone: ti indichiamo il percorso più adatto.</p>${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#formazione' })}</div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Formazione Online Hair Spa — Corsi del Metodo Élite | Élite Experience',
      description: 'I corsi online del Metodo Élite: Wellness Ritual, Pinda Ritual, Brushing Ritual, Hairgym Ritual e Relax Full Ritual. Videolezioni teoriche e dimostrative su rituali e manualità Hair Spa.',
      jsonld: [breadcrumbs(cOnline)],
      ogImage: 'pinda',
      bodyClass: 'p-online',
      body,
    });
  },
};

const presencePage = {
  route: 'academy/formazione-in-presenza/',
  render(ctx) {
    const { courses } = ctx.data;
    const body = `
<section class="phero phero--split phero--dark">
  <div class="phero__text">
    ${breadcrumb(ctx, cPresence)}
    ${eyebrow('Academy — Formazione in Presenza')}
    <h1 class="phero__title">Formazione in Presenza con Elisabetta Tancini</h1>
    <p class="phero__lead">Percorsi pratici per apprendere tecniche, rituali e manualità Hair Spa direttamente con Elisabetta, presso la sede di Arona o nel tuo salone.</p>
    <div class="actions">${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#presenza', variant: 'light' })}</div>
  </div>
  <div class="phero__media">${media(ctx, 'dimostrazione', { fill: true, eager: true, position: '50% 55%' })}</div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Due modalità', title: 'Ad Arona o nel tuo salone.' })}
    <div class="duo duo--cards">
      <article class="duo__item">
        ${media(ctx, 'lavatestaAcqua', { ratio: '16/10', position: '50% 30%', provisional: true })}
        <h3 class="h3serif">Presso la sede di Arona</h3>
        <p>Percorso formativo in presenza presso la sede di Elisabetta.</p>
        <ul class="facts"><li><span>Sede</span>Arona ${tbd('indirizzo')}</li><li><span>Partecipanti</span>${tbd('Formato individuale o di gruppo da confermare')}</li></ul>
      </article>
      <article class="duo__item">
        ${media(ctx, 'lavatesta', { ratio: '16/10', position: '62% 45%', provisional: true })}
        <h3 class="h3serif">Direttamente nel salone</h3>
        <p>Formazione organizzata presso la sede del professionista, con il suo team.</p>
        <ul class="facts"><li><span>Dove</span>Nel salone del professionista</li><li><span>Area servita</span>${tbd('Zone e trasferte da confermare')}</li></ul>
      </article>
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap split split--5-7">
    <div>${sectionHead({ eyebrow: 'Il percorso', title: 'Presentazione e obiettivi formativi.' })}</div>
    <div class="prose">
      <p class="lead">La formazione in presenza permette di apprendere il Metodo Élite con Elisabetta Tancini, lavorando sul gesto in modo diretto.</p>
      ${tbdBlock({ title: 'Obiettivi formativi', lines: ['Obiettivo 1', 'Obiettivo 2', 'Obiettivo 3'], note: 'Da definire sul programma ufficiale della formazione in presenza.' })}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--6-6">
    <div>
      ${sectionHead({ eyebrow: 'Cosa si apprende', title: 'Competenze, tecniche e rituali.' })}
      ${tbdBlock({ title: 'Competenze acquisite', lines: ['Competenza tecnica', 'Manualità', 'Organizzazione del rituale in salone'] })}
      <p class="sub-h">Rituali che possono essere affrontati</p>
      <ul class="taglist">${courses.map((c) => `<li><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></li>`).join('')}</ul>
      <p class="small">${tbd('Confermare quali rituali sono inclusi nella formazione in presenza')}</p>
    </div>
    <div>
      ${media(ctx, 'dettaglioMani', { ratio: '4/3' })}
      ${media(ctx, 'dettaglioMateriali', { ratio: '16/9', cls: 'mt' })}
    </div>
  </div>
</section>

<section class="sec sec--beige">
  <div class="wrap split split--5-7">
    <div>${sectionHead({ eyebrow: 'Programma e organizzazione', title: 'Come si svolge.' })}</div>
    <div>
      <dl class="specs">
        <div><dt>Programma</dt><dd>${tbd('Moduli e argomenti da programma ufficiale')}</dd></div>
        <div><dt>Durata</dt><dd>${tbd('Da confermare')}</dd></div>
        <div><dt>Organizzazione</dt><dd>${tbd('Giornate, orari, numero partecipanti')}</dd></div>
        <div><dt>Sede e disponibilità</dt><dd>Arona o nel salone del professionista · ${tbd('calendario da confermare')}</dd></div>
        <div><dt>Requisiti</dt><dd>${tbd('Eventuali prerequisiti')}</dd></div>
        <div><dt>Investimento</dt><dd>${tbd('Non pubblicato: su richiesta, da confermare')}</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="sec sec--choc band">
  <div class="wrap band__in">
    <h2 class="h2serif">Organizza la tua formazione con Elisabetta.</h2>
    <div class="actions">${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#presenza', variant: 'light' })}</div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Formazione Hair Spa in Presenza con Elisabetta Tancini — Arona o nel tuo salone',
      description: 'Formazione Hair Spa in presenza con Elisabetta Tancini, presso la sede di Arona o direttamente nel salone: competenze, tecniche e rituali del Metodo Élite.',
      jsonld: [breadcrumbs(cPresence)],
      bodyClass: 'p-presence',
      body,
    });
  },
};

export default [academyPage, onlinePage, presencePage];
