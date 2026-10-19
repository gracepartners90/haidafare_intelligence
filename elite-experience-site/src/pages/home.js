import { site } from '../config.js';
import { esc, tbd, draft, eyebrow, sectionHead, btn, arrow, media } from '../components/core.js';
import { courseUrl, ritualPicker, collectionBand } from '../components/course.js';
import { organization, website } from '../components/seo.js';
import { page } from '../components/layout.js';
import { practiceSequence } from '../components/practice.js';
import { latestArticles, articleGrid } from '../components/editorial.js';

export default [{
  route: '',
  render(ctx) {
    const { courses, collection } = ctx.data;
    const pinda = courses.find((c) => c.id === 'pinda-ritual');
    const others = courses.filter((c) => c.id !== 'pinda-ritual');

    const body = `
<!-- 01 HERO -->
<section class="hero">
  <div class="hero__bg">${media(ctx, 'heroHome', { fill: true, eager: true })}</div>
  <div class="hero__in">
    <div class="hero__text">
      <h1 class="hero__title">Porta l’esperienza Hair Spa nel tuo salone.</h1>
      <p class="hero__lead">Un metodo professionale ideato da Elisabetta Tancini, che attraverso percorsi di formazione online e in presenza ti accompagna nell’apprendimento di rituali, tecniche e manualità Hair Spa.</p>
      <div class="actions">
        ${btn(ctx, { label: 'Scopri la formazione', to: 'academy/', variant: 'light' })}
        ${btn(ctx, { label: 'Il Metodo Élite', to: 'metodo-elite/', variant: 'ghost-light' })}
      </div>
    </div>
    <ul class="hero__facts" aria-label="In sintesi">
      <li><b>Hair Spa</b>rituali, tecniche e manualità</li>
      <li><b>Un metodo professionale</b>ideato da Elisabetta Tancini</li>
      <li><b>Formazione</b>online e in presenza</li>
      <li><b>Per professionisti</b>e saloni</li>
    </ul>
  </div>
</section>

<!-- 02 IL METODO -->
<section class="sec home-method" id="metodo">
  <div class="wrap home-method__grid">
    <figure class="home-method__media">
      ${media(ctx, 'lavatestaAcqua', { fill: true, position: '50% 80%' })}
      <figcaption>Il gesto al centro del metodo</figcaption>
    </figure>
    <div class="home-method__text">
      ${sectionHead({ eyebrow: 'Il Metodo Élite', title: 'Un metodo che prende forma attraverso il gesto.' })}
      <p class="lead">Il Metodo Élite è l’approccio professionale all’Hair Spa ideato da Elisabetta Tancini. Si fonda sull’apprendimento e sull’applicazione di rituali, tecniche e manualità che il professionista porta nel proprio salone.</p>
      <ol class="pillars">
        <li><span class="pillars__n">01</span><div><h3>Che cos’è</h3><p>Un metodo professionale Hair Spa, fatto di rituali, tecniche e manualità ideati da Elisabetta Tancini.</p></div></li>
        <li><span class="pillars__n">02</span><div><h3>L’approccio</h3><p>${draft('Il gesto al centro: ogni rituale si apprende attraverso la manualità, la sequenza e la pratica.')}</p></div></li>
        <li><span class="pillars__n">03</span><div><h3>Metodo, rituali, formazione</h3><p>Il metodo è la base. I rituali ne sono l’espressione pratica. La formazione è il modo per apprenderli.</p></div></li>
      </ol>
      ${btn(ctx, { label: 'Scopri il Metodo Élite', to: 'metodo-elite/' })}
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

<!-- 05 ANTEPRIMA DEI CORSI -->
<section class="sec sec--beige home-courses">
  <div class="wrap">
    <div class="row-head">
      ${sectionHead({ eyebrow: 'Corsi online', title: 'Scegli cosa vuoi imparare.', lead: 'Cinque rituali, una scheda per ciascuno: competenze, tecniche e programma del corso.' })}
      ${arrow(ctx, { label: 'Confronta i corsi', to: 'academy/#confronto' })}
    </div>
    ${ritualPicker(ctx, courses)}
    ${collectionBand(ctx, collection)}
  </div>
</section>

<!-- 06 PER I SALONI -->
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

<!-- 07 ÉLITE & MORE: gli ultimi 3 articoli reali -->
<section class="sec sec--ivory home-journal">
  <div class="wrap">
    <div class="row-head">
      ${sectionHead({ eyebrow: 'Élite & More', title: 'Cultura, tecnica e formazione Hair Spa.', lead: 'Gli ultimi articoli pubblicati.' })}
      ${arrow(ctx, { label: 'Tutti gli articoli', to: 'elite-e-more/' })}
    </div>
    ${articleGrid(ctx, latestArticles(ctx.data, { n: 3 }), { min: 3 })}
  </div>
</section>

<!-- 08 CONTATTI -->
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
