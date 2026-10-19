import { site } from '../config.js';
import { esc, tbd, draft, eyebrow, sectionHead, btn, arrow, media, slot, visual, videoBlock, tbdBlock } from '../components/core.js';
import { courseCard, collectionBlock, courseUrl } from '../components/course.js';
import { organization, website } from '../components/seo.js';
import { page } from '../components/layout.js';
import { practiceSequence } from '../components/practice.js';

export default [{
  route: '',
  render(ctx) {
    const { courses, collection, editorial } = ctx.data;
    const pinda = courses.find((c) => c.id === 'pinda-ritual');
    const others = courses.filter((c) => c.id !== 'pinda-ritual');
    const cat = (slug) => editorial.journal.categories.find((c) => c.slug === slug);

    const body = `
<!-- 01 HERO -->
<section class="hero">
  <div class="hero__text">
    ${eyebrow('Élite Experience — Metodo e Formazione Hair Spa')}
    <h1 class="hero__title">Porta l’esperienza Hair Spa nel tuo salone.</h1>
    <p class="hero__lead">Un metodo professionale ideato da Elisabetta Tancini, che attraverso percorsi di formazione online e in presenza ti accompagna nell’apprendimento di rituali, tecniche e manualità Hair Spa.</p>
    <div class="actions">
      ${btn(ctx, { label: 'Scopri la formazione', to: 'academy/' })}
      ${btn(ctx, { label: 'Il Metodo Élite', to: 'metodo-elite/', variant: 'ghost' })}
    </div>
  </div>
  <div class="hero__media">
    ${media(ctx, 'lavatesta', { fill: true, eager: true, position: '62% 45%' })}
    <p class="hero__cap">Elisabetta Tancini durante una manualità Hair Spa</p>
  </div>
</section>
<ul class="orient" aria-label="In sintesi">
  <li><b>Hair Spa</b>rituali, tecniche e manualità</li>
  <li><b>Un metodo professionale</b>ideato da Elisabetta Tancini</li>
  <li><b>Formazione</b>online e in presenza</li>
  <li><b>Per professionisti</b>e saloni</li>
</ul>

<!-- 02 IL METODO -->
<section class="sec home-method">
  <div class="wrap split split--7-5">
    <div>
      ${sectionHead({ eyebrow: 'Il Metodo Élite', title: 'Un metodo che prende forma attraverso il gesto.' })}
      <p class="lead">Il Metodo Élite è l’approccio professionale all’Hair Spa ideato da Elisabetta Tancini. Si fonda sull’apprendimento e sull’applicazione di rituali, tecniche e manualità che il professionista porta nel proprio salone.</p>
      <dl class="qa">
        <div><dt>Che cos’è</dt><dd>Un metodo professionale Hair Spa, fatto di rituali, tecniche e manualità ideati da Elisabetta Tancini.</dd></div>
        <div><dt>L’approccio</dt><dd>${draft('Il gesto al centro: ogni rituale si apprende attraverso la manualità, la sequenza e la pratica.')}</dd></div>
        <div><dt>Metodo, rituali, formazione</dt><dd>Il metodo è la base. I rituali ne sono l’espressione pratica. La formazione è il modo per apprenderli.</dd></div>
      </dl>
      ${btn(ctx, { label: 'Scopri il Metodo Élite', to: 'metodo-elite/' })}
    </div>
    <div class="home-method__media">
      ${media(ctx, 'dettaglioMani', { ratio: '4/3', cls: 'hm-a' })}
      ${media(ctx, 'dettaglioMateriali', { ratio: '4/3', cls: 'hm-b' })}
    </div>
  </div>
</section>

<!-- 03 ELISABETTA TANCINI -->
<section class="sec sec--deep home-eli">
  <div class="wrap home-eli__grid">
    <div class="home-eli__portrait">${media(ctx, 'ritratto', { ratio: '4/5', position: '50% 22%' })}</div>
    <div class="home-eli__text">
      ${eyebrow('La fondatrice')}
      <h2 class="display-name">Elisabetta <em>Tancini</em></h2>
      <p class="home-eli__sub">La professionista dietro il Metodo Élite.</p>
      <p>Fondatrice di Élite Experience e ideatrice del Metodo Élite, Elisabetta Tancini è formatrice Hair Spa. Il metodo nasce dal suo lavoro di professionista e si trasmette attraverso la formazione online e in presenza.</p>
      <blockquote class="quote quote--tbd"><p>${tbd('Dichiarazione di Elisabetta sulla sua visione dell’Hair Spa — da raccogliere')}</p></blockquote>
      <div class="actions">
        ${btn(ctx, { label: 'Conosci Elisabetta', to: 'elisabetta-tancini/', variant: 'light' })}
        ${arrow(ctx, { label: 'Il suo percorso', to: 'elisabetta-tancini/#percorso', cls: 'arrow--light' })}
      </div>
    </div>
  </div>
</section>

<!-- 04 I RITUALI -->
<section class="sec home-rituals">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'I rituali', title: 'Il metodo, attraverso le manualità.', lead: 'Ogni rituale è un’espressione pratica del Metodo Élite, con tecniche, manualità e sequenze proprie. Ognuno ha una scheda dedicata con il programma del corso.' })}
    <article class="ritual-feature">
      <div class="ritual-feature__media">${media(ctx, 'pinda', { ratio: '16/9', position: '55% 50%' })}</div>
      <div class="ritual-feature__text">
        <p class="eyebrow">Rituale</p>
        <h3 class="h3serif">${esc(pinda.name)}</h3>
        <p>${draft(pinda.shortDescription)}</p>
        ${media(ctx, 'dettaglioPinda', { ratio: '1/1', cls: 'ritual-feature__detail' })}
        ${arrow(ctx, { label: 'Approfondisci il rituale', to: courseUrl(pinda) })}
      </div>
    </article>
    <ol class="ritual-index">
      ${others.map((c) => `<li>
        <a href="${ctx.href(courseUrl(c))}">
          <span class="ritual-index__name">${esc(c.name)}</span>
          <span class="ritual-index__desc">${draft(c.shortDescription)}</span>
          <span class="ritual-index__go" aria-hidden="true">→</span>
        </a>
      </li>`).join('')}
    </ol>
  </div>
</section>

<!-- 04b IL METODO, IN PRATICA -->
${practiceSequence(ctx)}

<!-- 05 LA FORMAZIONE -->
<section class="training-split" aria-labelledby="t-form">
  <h2 class="sr-only" id="t-form">Il metodo diventa formazione</h2>
  <div class="training-split__intro wrap">${sectionHead({ eyebrow: 'La formazione', title: 'Il metodo diventa formazione.' })}</div>
  <div class="training-split__grid">
    <article class="tmode tmode--online">
      ${videoBlock(ctx, { posterSubject: 'Frame da una videolezione dimostrativa', title: 'Dentro una videolezione', note: 'Inserire un estratto autentico di una videolezione dei corsi online.', ratio: '16/10', tone: 'light' })}
      <div class="tmode__body">
        <p class="eyebrow">Formazione Online</p>
        <h3 class="h3serif">Videolezioni teoriche e dimostrative</h3>
        <p>Dedicate all’apprendimento dei rituali e delle manualità Hair Spa, da seguire con i tempi del proprio salone.</p>
        ${btn(ctx, { label: 'Esplora i corsi online', to: 'academy/formazione-online/' })}
      </div>
    </article>
    <article class="tmode tmode--presence">
      ${slot({ subject: 'Elisabetta Tancini in formazione con un gruppo di professionisti ad Arona', ratio: '16/10', tone: 'dark' })}
      <div class="tmode__body">
        <p class="eyebrow">Formazione in Presenza</p>
        <h3 class="h3serif">Percorsi pratici con Elisabetta Tancini</h3>
        <p>Presso la sede di Arona o direttamente nel salone del professionista.</p>
        ${btn(ctx, { label: 'Scopri la formazione in presenza', to: 'academy/formazione-in-presenza/', variant: 'light' })}
      </div>
    </article>
  </div>
</section>

<!-- 06 ANTEPRIMA DEI CORSI -->
<section class="sec sec--beige home-courses">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Corsi online', title: 'Scegli cosa vuoi imparare.', lead: 'Ogni corso ha una scheda con le competenze, le tecniche e il programma. Confronta i percorsi e scegli da dove partire.' })}
    <div class="cgrid">
      ${courses.map((c, i) => courseCard(ctx, c, { size: i < 3 ? 'm' : 'l' })).join('')}
    </div>
    ${collectionBlock(ctx, collection, courses)}
  </div>
</section>

<!-- 07 PER I SALONI -->
<section class="sec home-salons">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Per i saloni', title: 'Ogni salone ha il proprio punto di partenza.' })}
    <div class="paths">
      <article class="path">
        <h3 class="h3serif">Iniziare con l’Hair Spa</h3>
        <p>Per chi vuole avvicinarsi al settore e introdurre nuove competenze nel salone: conoscere i rituali, acquisire le prime manualità, capire da dove partire.</p>
        ${arrow(ctx, { label: 'Da dove iniziare', to: 'per-i-saloni/#iniziare' })}
      </article>
      <article class="path">
        <h3 class="h3serif">Approfondire l’Hair Spa</h3>
        <p>Per chi ha già esperienza e desidera perfezionare o ampliare le manualità, conoscendo le differenze tra i singoli rituali.</p>
        ${arrow(ctx, { label: 'Come approfondire', to: 'per-i-saloni/#approfondire' })}
      </article>
    </div>
  </div>
</section>

<!-- 08 COLLABORAZIONI -->
<section class="sec sec--deep home-collab">
  <div class="wrap split split--5-7">
    <div>
      ${sectionHead({ eyebrow: 'Collaborazioni', title: 'Elisabetta Tancini per aziende e progetti educational.' })}
      <p>Per brand, aziende Hair &amp; Beauty, distributori, accademie e organizzatori di eventi che cercano una formatrice Hair Spa per progetti professionali.</p>
      ${btn(ctx, { label: 'Proponi una collaborazione', to: 'contatti/#collaborazioni', variant: 'light' })}
    </div>
    <ul class="linelist linelist--light">
      ${editorial.collaborations.types.map((t) => `<li><b>${esc(t.name)}</b><span>${esc(t.text)}</span></li>`).join('')}
    </ul>
  </div>
</section>

<!-- 09 TESTIMONIANZE -->
<section class="sec home-testi">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Testimonianze', title: 'Le parole dei professionisti.', lead: 'Spazio riservato a testimonianze reali di chi ha seguito i percorsi: video, fotografie e citazioni, con nome, salone e autorizzazione.' })}
    <div class="testi">
      ${videoBlock(ctx, { posterSubject: 'Videotestimonianza di un partecipante', title: 'Videotestimonianza', note: 'Inserire una videotestimonianza reale, con autorizzazione del partecipante.', ratio: '4/5', tone: 'light' })}
      <figure class="testi__quote">${slot({ subject: 'Ritratto del partecipante nel suo salone', ratio: '1/1' })}<blockquote>${tbd('Citazione reale del partecipante')}</blockquote><figcaption>${tbd('Nome, salone, città')}</figcaption></figure>
      <figure class="testi__quote testi__quote--text"><blockquote>${tbd('Citazione reale del partecipante')}</blockquote><figcaption>${tbd('Nome, salone, città')}</figcaption></figure>
    </div>
  </div>
</section>

<!-- 10 JOURNAL -->
<section class="sec sec--ivory home-journal">
  <div class="wrap">
    <div class="row-head">
      ${sectionHead({ eyebrow: 'Journal — Élite & More', title: 'Cultura, tecnica e formazione Hair Spa.' })}
      ${arrow(ctx, { label: 'Vai al Journal', to: 'journal/' })}
    </div>
    <div class="jgrid">
      ${editorial.journal.plan.map((a) => `<article class="jcard jcard--plan">
        ${slot({ subject: 'Immagine dell’articolo', ratio: '3/2' })}
        <p class="jcard__meta"><span>${esc(cat(a.category).name)}</span><span class="chip chip--tbd">In preparazione</span></p>
        <h3 class="jcard__title">${esc(a.title)}</h3>
        <p class="jcard__note">Proposta editoriale: articolo non ancora pubblicato.</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- 11 CONTATTI -->
<section class="sec sec--choc home-contact">
  <div class="wrap home-contact__in">
    <h2 class="h2serif">Trova il percorso più adatto al tuo salone.</h2>
    <p>Raccontaci da dove parti: ti aiutiamo a orientarti tra formazione online, formazione in presenza e singoli rituali.</p>
    <div class="actions">
      ${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#formazione', variant: 'light' })}
      ${arrow(ctx, { label: 'Proposte di collaborazione', to: 'contatti/#collaborazioni', cls: 'arrow--light' })}
    </div>
  </div>
</section>`;

    return page(ctx, {
      title: 'Élite Experience — Metodo e Formazione Hair Spa | Elisabetta Tancini',
      description: 'Porta l’esperienza Hair Spa nel tuo salone: il metodo professionale ideato da Elisabetta Tancini, con formazione online e in presenza su rituali, tecniche e manualità Hair Spa.',
      jsonld: [organization(), website()],
      bodyClass: 'p-home',
      body,
    });
  },
}];
