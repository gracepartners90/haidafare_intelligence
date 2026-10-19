import { esc, draft, eyebrow, sectionHead, btn, arrow, media, slot, tbdBlock, breadcrumb } from '../components/core.js';
import { courseUrl, levelChip } from '../components/course.js';
import { breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';
import { practiceSequence } from '../components/practice.js';

const crumbs = [{ label: 'Home', to: '' }, { label: 'Il Metodo Élite', to: 'metodo-elite/' }];

export default [{
  route: 'metodo-elite/',
  render(ctx) {
    const { courses } = ctx.data;
    const principles = [
      ['Il gesto al centro', 'Il metodo si apprende attraverso la manualità: il gesto è il primo contenuto della formazione.'],
      ['Il rituale come struttura', 'Ogni rituale organizza tecniche e manualità in una sequenza riconoscibile e ripetibile.'],
      ['Dalla teoria alla pratica', 'L’apprendimento procede dalla spiegazione alla dimostrazione, fino alla pratica del professionista.'],
      ['L’applicazione in salone', 'La formazione è pensata per essere portata nel lavoro quotidiano del salone.'],
    ];
    const body = `
<section class="phero phero--split">
  <div class="phero__text">
    ${breadcrumb(ctx, crumbs)}
    ${eyebrow('Élite Experience')}
    <h1 class="phero__title">Il Metodo Élite</h1>
    <p class="phero__lead">Un metodo professionale Hair Spa ideato da Elisabetta Tancini, che si esprime attraverso rituali, tecniche e manualità.</p>
  </div>
  <div class="phero__media">${media(ctx, 'lavatesta', { fill: true, eager: true, position: '68% 45%' })}</div>
</section>

<section class="sec">
  <div class="wrap split split--5-7">
    <div>${sectionHead({ eyebrow: 'Origine e visione', title: 'Un metodo nato dal lavoro di una professionista.' })}</div>
    <div class="prose">
      <p class="lead">Il Metodo Élite nasce dall’esperienza professionale di Elisabetta Tancini ed è il patrimonio su cui si fonda Élite Experience: un modo di intendere l’Hair Spa che unisce rituale, tecnica e manualità.</p>
      ${tbdBlock({ title: 'Il racconto dell’origine del metodo', lines: ['Quando e in quale contesto professionale nasce il metodo', 'L’esigenza da cui è partita Elisabetta', 'Come il metodo si è sviluppato nel tempo'], note: 'Da raccogliere con Elisabetta Tancini.' })}
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Principi fondamentali', title: 'Quattro principi, un’unica idea di Hair Spa.' })}
    <ol class="principles">
      ${principles.map(([t, d], i) => `<li><span class="principles__n">${String(i + 1).padStart(2, '0')}</span><h3 class="h3serif">${esc(t)}</h3><p>${draft(d)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec manual">
  <div class="wrap manual__grid">
    <div class="manual__text">
      ${sectionHead({ eyebrow: 'La centralità delle manualità', title: 'Il metodo passa attraverso le mani.' })}
      <p class="lead">Nel Metodo Élite le manualità sono il contenuto principale: il modo in cui la mano lavora, la sequenza dei passaggi, l’uso degli strumenti e dei materiali.</p>
      ${tbdBlock({ title: 'Tecniche e manualità documentate', lines: ['Elenco delle tecniche del metodo', 'Strumenti e materiali utilizzati', 'Elementi che distinguono il Metodo Élite'], note: 'Da compilare sui programmi ufficiali dei corsi.' })}
    </div>
    ${media(ctx, 'dettaglioMani', { ratio: '4/3', cls: 'manual__a' })}
    ${media(ctx, 'dettaglioPinda', { ratio: '4/5', cls: 'manual__b' })}
    ${media(ctx, 'dettaglioMateriali', { ratio: '16/9', cls: 'manual__c' })}
  </div>
</section>

${practiceSequence(ctx, { id: 'in-pratica-metodo' })}

<section class="sec sec--deep">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'I rituali', title: 'I rituali, espressione pratica del metodo.', lead: 'Ogni rituale traduce il metodo in una sequenza di tecniche e manualità. Le schede dei corsi descrivono che cosa si apprende in ciascuno.' })}
    <ol class="ritual-index ritual-index--light">
      ${courses.map((c) => `<li><a href="${ctx.href(courseUrl(c))}">
        <span class="ritual-index__name">${esc(c.name)}</span>
        <span class="ritual-index__desc">${draft(c.shortDescription)}</span>
        <span class="ritual-index__go" aria-hidden="true">→</span>
      </a></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--6-6">
    <div>
      ${sectionHead({ eyebrow: 'Il metodo applicato alla formazione', title: 'Dal metodo alla formazione.' })}
      <p class="lead">Il Metodo Élite si apprende attraverso due modalità formative, pensate per esigenze diverse.</p>
    </div>
    <div class="duo">
      <div><h3 class="h3serif">Online</h3><p>Videolezioni teoriche e dimostrative dedicate ai rituali e alle manualità Hair Spa.</p>${arrow(ctx, { label: 'Formazione online', to: 'academy/formazione-online/' })}</div>
      <div><h3 class="h3serif">In presenza</h3><p>Percorsi pratici con Elisabetta Tancini, ad Arona o direttamente nel salone.</p>${arrow(ctx, { label: 'Formazione in presenza', to: 'academy/formazione-in-presenza/' })}</div>
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap eli-strip">
    ${media(ctx, 'ritratto', { ratio: '4/5', position: '50% 22%' })}
    <div>
      ${eyebrow('L’ideatrice del metodo')}
      <h2 class="display-name display-name--m">Elisabetta <em>Tancini</em></h2>
      <p class="lead">Fondatrice di Élite Experience, ideatrice del Metodo Élite e formatrice Hair Spa.</p>
      ${btn(ctx, { label: 'Conosci Elisabetta', to: 'elisabetta-tancini/' })}
    </div>
  </div>
</section>

<section class="sec sec--choc band">
  <div class="wrap band__in">
    <h2 class="h2serif">Impara il Metodo Élite.</h2>
    <div class="actions">
      ${btn(ctx, { label: 'Scopri la formazione', to: 'academy/', variant: 'light' })}
      ${arrow(ctx, { label: 'Richiedi informazioni', to: 'contatti/#formazione', cls: 'arrow--light' })}
    </div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Il Metodo Élite — Metodo professionale Hair Spa | Élite Experience',
      description: 'Il Metodo Élite è il metodo professionale Hair Spa ideato da Elisabetta Tancini: rituali, tecniche e manualità che si apprendono con la formazione online e in presenza.',
      jsonld: [breadcrumbs(crumbs)],
      bodyClass: 'p-method',
      body,
    });
  },
}];
