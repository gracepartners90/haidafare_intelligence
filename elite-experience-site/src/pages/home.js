import { esc, draft, eyebrow, sectionHead, btn, arrow, media } from '../components/core.js';
import { courseUrl, ritualPicker, collectionBand } from '../components/course.js';
import { organization, website } from '../components/seo.js';
import { page } from '../components/layout.js';
import { practiceSequence } from '../components/practice.js';
import { fullHero, fullVideo, signedQuote } from '../components/blocks.js';

export default [{
  route: '',
  render(ctx) {
    const { courses, collection } = ctx.data;
    const pinda = courses.find((c) => c.id === 'pinda-ritual');
    const others = courses.filter((c) => c.id !== 'pinda-ritual');

    const body = `
<!-- 01 HERO -->
${fullHero(ctx, {
  image: 'petaliRosa', position: '62% 45%', cls: 'hero--home',
  title: 'Porta l’esperienza Hair&nbsp;Spa<br>nel tuo salone.',
  lead: 'Un metodo professionale ideato da Elisabetta Tancini, che attraverso percorsi di formazione online e in presenza ti accompagna nell’apprendimento di rituali, tecniche e manualità Hair Spa.',
  extra: `<div class="actions">
        ${btn(ctx, { label: 'Scopri la formazione', to: 'academy/', variant: 'light' })}
        ${btn(ctx, { label: 'Il Metodo Élite', to: 'metodo-elite/', variant: 'ghost-light' })}
      </div>`,
})}

<!-- 02 IL METODO -->
<section class="sec home-method" id="metodo">
  <div class="wrap home-method__grid">
    <figure class="home-method__media">
      ${media(ctx, 'lavatestaAcqua', { fill: true, position: '50% 80%' })}
    </figure>
    <div class="home-method__text">
      ${sectionHead({ eyebrow: 'Il Metodo Élite', title: 'Un metodo che prende forma attraverso il gesto.' })}
      <p class="lead">Il Metodo Élite è l’approccio professionale all’Hair Spa ideato da Elisabetta Tancini.<br>Si fonda sull’<strong>apprendimento</strong> e sull’<strong>applicazione</strong> di rituali, tecniche e manualità che il professionista porta nel proprio salone.</p>
      <ol class="pillars">
        <li><span class="pillars__n">01</span><div><h3>Che cos’è</h3><p>Un metodo professionale Hair Spa, fatto di rituali, tecniche e manualità ideati da Elisabetta Tancini.</p></div></li>
        <li><span class="pillars__n">02</span><div><h3>L’approccio</h3><p>${draft('Il gesto al centro: ogni rituale si apprende attraverso la manualità, la sequenza e la pratica.')}</p></div></li>
        <li><span class="pillars__n">03</span><div><h3>Metodo, rituali, formazione</h3><p>Il metodo è la base. I rituali ne sono l’espressione pratica.<br>La formazione è il modo per apprenderli.</p></div></li>
      </ol>
      ${btn(ctx, { label: 'Scopri il Metodo Élite', to: 'metodo-elite/' })}
    </div>
  </div>
</section>

<!-- 03 ELISABETTA TANCINI -->
<section class="sec sec--deep home-eli">
  <div class="wrap home-eli__grid">
    <div class="home-eli__text">
      ${eyebrow('La fondatrice')}
      <h2 class="display-name">Elisabetta Tancini</h2>
      <p class="home-eli__sub">La professionista dietro il Metodo Élite.</p>
      <p>Imprenditrice, Hair Spa Specialist e formatrice internazionale,<br>Elisabetta Tancini è la <strong>fondatrice</strong> di Élite Experience e l’ideatrice del Metodo Élite.<br>Il metodo nasce dal suo <strong>lavoro in salone</strong> e si trasmette attraverso la <strong>formazione</strong> online e in presenza.</p>
      ${signedQuote(`${esc('Ogni gesto ha un tempo e un’intenzione.')}<br>${esc('Insegnarlo significa trasmettere la cura che c’è dietro.')}`)}
      <div class="actions">${btn(ctx, { label: 'Conosci Elisabetta', to: 'elisabetta-tancini/', variant: 'light' })}</div>
    </div>
    <div class="home-eli__portrait">${media(ctx, 'ritratto', { ratio: '4/5', position: '50% 22%' })}</div>
  </div>
</section>

<!-- 04 I RITUALI -->
<section class="sec home-rituals">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'I rituali', title: 'Il metodo, attraverso le manualità.', lead: 'Ogni rituale è un’espressione pratica del Metodo Élite, con tecniche, manualità e sequenze proprie.<br>Ognuno dei quali ha una scheda dedicata con il programma del corso.' })}
    <article class="ritual-feature">
      <div class="ritual-feature__media">${media(ctx, 'pindaLino', { ratio: '16/9', position: '50% 55%' })}</div>
      <div class="ritual-feature__text">
        <p class="eyebrow">Special One</p>
        <h3 class="h3serif">${esc(pinda.name)}</h3>
        <p>${draft(pinda.shortDescription)}</p>
        ${media(ctx, 'pindaAsciugamano', { ratio: '1/1', position: '52% 60%', cls: 'ritual-feature__detail' })}
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
      ${sectionHead({ eyebrow: 'Formazione online', title: 'Il metodo, un rituale alla volta.', lead: '<strong>Cinque</strong> rituali completi: competenze, tecniche e programma dei <strong>corsi</strong>.' })}
      ${arrow(ctx, { label: 'Scopri i corsi online', to: 'academy/formazione-online/#confronto' })}
    </div>
    ${ritualPicker(ctx, courses)}
    ${collectionBand(ctx, collection)}
  </div>
</section>

<!-- 06 PER I SALONI -->
<section class="sec home-salons">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Per i saloni', title: 'Ogni salone ha il proprio punto di partenza.', cls: 'shead--line' })}
    <div class="paths">
      <article class="path">
        <h3 class="h3serif">Iniziare con l’Hair Spa</h3>
        <p>Per chi vuole <strong>avvicinarsi al mondo dell’Hair Spa</strong> e introdurre nuove competenze nel salone: conoscere i rituali, acquisire le prime manualità, <strong>capire da dove partire</strong>.</p>
        ${arrow(ctx, { label: 'Da dove iniziare', to: 'academy/#percorsi' })}
      </article>
      <article class="path">
        <h3 class="h3serif">Approfondire l’Hair Spa</h3>
        <p>Per chi ha già esperienza e desidera <strong>perfezionare</strong> o <strong>ampliare</strong> le manualità, conoscendo le differenze tra i singoli rituali.</p>
        ${arrow(ctx, { label: 'Come approfondire', to: 'academy/#percorsi' })}
      </article>
    </div>
  </div>
</section>

<!-- 07 VIDEO A TUTTO SCHERMO -->
${fullVideo(ctx, {
  poster: 'teaserFrame', position: '50% 50%', eyebrow: 'Il Metodo Élite in video',
  title: 'Il gesto, <em>in movimento</em>.',
  loop: { webm: 'video/elite-teaser-home.webm', mp4: 'video/elite-teaser-home.mp4' },
})}

<!-- 08 CONTATTI -->
<section class="sec sec--deep home-contact">
  <div class="wrap home-contact__in">
    <h2 class="h2serif">Trova il percorso più adatto al tuo salone.</h2>
    <p>Raccontaci da dove parti: ti aiutiamo a orientarti tra formazione online, formazione in presenza e singoli rituali.</p>
    <div class="actions">
      ${btn(ctx, { label: 'Richiedi informazioni', to: 'contatti/#formazione', variant: 'light' })}
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
