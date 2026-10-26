import { esc, draft, sectionHead, arrow } from '../components/core.js';
import { courseUrl } from '../components/course.js';
import { breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';
import { practiceSequence } from '../components/practice.js';
import { fullHero, fullImage, fader } from '../components/blocks.js';

const crumbs = [{ label: 'Home', to: '' }, { label: 'Il Metodo Élite', to: 'metodo-elite/' }];

export default [{
  route: 'metodo-elite/',
  render(ctx) {
    const { courses } = ctx.data;
    // Testi in bozza, su due righe: le parole chiave sono in grassetto
    const principles = [
      ['Il gesto al centro', 'Si apprende con la <strong>manualità</strong>: il gesto è il primo contenuto.'],
      ['Il rituale come struttura', '<strong>Tecniche</strong> e manualità in una sequenza ripetibile.'],
      ['Dalla teoria alla pratica', 'Dalla spiegazione alla <strong>dimostrazione</strong>, fino alla pratica del professionista.'],
      ['L’applicazione in salone', 'La formazione si porta nel <strong>lavoro quotidiano</strong> del salone.'],
    ];
    const body = `
${fullHero(ctx, {
  image: 'metodoHero', position: '55% 45%', positionMobile: '55% 45%',
  eyebrow: 'Élite Experience',
  title: 'Il Metodo <em>Élite</em>',
  lead: 'Un metodo professionale Hair Spa ideato da Elisabetta Tancini,<br>che si esprime attraverso rituali, tecniche e manualità.',
})}

<section class="sec origin">
  <div class="wrap split split--5-7">
    <div>${sectionHead({ eyebrow: 'Origine e visione', title: 'Un metodo nato dal lavoro di una <strong>professionista</strong>.' })}</div>
    <div class="prose origin__text">
      <p>Il Metodo Élite nasce dall’esperienza professionale di Elisabetta Tancini ed è il patrimonio su cui si fonda Élite Experience: un modo di intendere l’Hair Spa che unisce rituale, tecnica e manualità.</p>
      <p>Prende forma nella <strong>pratica quotidiana</strong> di Maison BB, il salone che Elisabetta guida ad Arona, e nell’attività di <strong>formatrice internazionale</strong> al fianco di importanti protagonisti dell’industria Hair.<br>Due prospettive che si incontrano: quella di chi lavora ogni giorno a contatto con le persone e quella di chi conosce le esigenze, le responsabilità e le sfide di un’impresa nel settore Hair &amp; Beauty.</p>
      <p>Il metodo traduce questa esperienza in un <strong>sistema</strong>: rituali strutturati, tecniche precise e manualità che si possono <strong>apprendere</strong>, <strong>ripetere</strong> e <strong>portare nel proprio salone</strong>.<br>Ogni rituale ha una sequenza riconoscibile, dall’accoglienza alla conclusione dell’esperienza, e ogni gesto ha una ragione.</p>
      <p>La visione è un Hair Spa in cui precisione delle <strong>manualità</strong>, <strong>sensibilità</strong> e <strong>cura del dettaglio</strong> diventano elementi distintivi: per il cliente, un’esperienza da ricordare; per il salone, un servizio di valore, riconoscibile e replicabile.</p>
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Principi fondamentali', title: 'Quattro principi, un’unica idea di Hair Spa.' })}
    <ol class="principles">
      ${principles.map(([t, d], i) => `<li><span class="principles__n">${String(i + 1).padStart(2, '0')}</span><h3 class="h3serif">${esc(t)}</h3><p><span class="draft">${d}</span></p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec hands">
  <div class="wrap hands__grid">
    <div class="hands__text">
      ${sectionHead({ eyebrow: 'La centralità delle manualità', title: 'Il metodo passa attraverso le mani.' })}
      <p class="lead">Nel Metodo Élite le manualità sono il contenuto principale: il modo in cui la mano lavora, la sequenza dei passaggi, l’uso degli strumenti e dei materiali.</p>
      <ol class="hands__list">
        <li><span>01</span><div><h3>Pressione</h3><p>Dosata sulla persona e sulla zona trattata, regolata con la sensibilità più<br class="br-d"> che con la forza.</p></div></li>
        <li><span>02</span><div><h3>Ritmo</h3><p>Lento e avvolgente o dinamico e stimolante: ogni rituale ha un tempo proprio, che si alterna senza strappi.</p></div></li>
        <li><span>03</span><div><h3>Continuità</h3><p>Il contatto non si interrompe: le mani passano da un passaggio all’altro, dall’accoglienza alla conclusione.</p></div></li>
        <li><span>04</span><div><h3>Strumenti</h3><p>Lettino ad acqua, pinda riscaldati, spazzole, calore e vapore: ogni rituale ha i suoi materiali e la sua postazione.</p></div></li>
      </ol>
    </div>
    ${fader(ctx, [
      { image: 'pressioneTesta', position: '42% 50%' },
      { image: 'ritmoArco', position: '58% 50%' },
      { image: 'continuitaPennello', position: '48% 45%' },
      { image: 'strumentiPinda', position: '46% 55%' },
    ], { cls: 'hands__fader' })}
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
  <div class="wrap split split--5-7">
    <div>
      ${sectionHead({ eyebrow: 'Il metodo applicato alla formazione', title: 'Dal metodo alla formazione.' })}
      <p class="lead">Il Metodo Élite si apprende attraverso due modalità formative,<br>pensate per esigenze diverse.</p>
    </div>
    <div class="duo">
      <div><h3 class="h3serif">Online</h3><p>Videolezioni teoriche e dimostrative dedicate ai rituali e alle manualità Hair Spa.</p>${arrow(ctx, { label: 'Formazione online', to: 'academy/formazione-online/' })}</div>
      <div><h3 class="h3serif">In presenza</h3><p>Percorsi pratici con Elisabetta Tancini, ad Arona o direttamente nel salone.</p>${arrow(ctx, { label: 'Formazione in presenza', to: 'academy/formazione-in-presenza/' })}</div>
    </div>
  </div>
</section>

${fullImage(ctx, 'pinda', { position: '62% 45%' })}`;
    return page(ctx, {
      title: 'Il Metodo Élite — Metodo professionale Hair Spa | Élite Experience',
      description: 'Il Metodo Élite è il metodo professionale Hair Spa ideato da Elisabetta Tancini: rituali, tecniche e manualità che si apprendono con la formazione online e in presenza.',
      jsonld: [breadcrumbs(crumbs)],
      bodyClass: 'p-method',
      body,
    });
  },
}];
