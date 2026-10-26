import { esc, eyebrow, sectionHead, btn, media, videoBlock } from '../components/core.js';
import { person, breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';
import { fullHero, fullImage, signedQuote } from '../components/blocks.js';

const crumbs = [{ label: 'Home', to: '' }, { label: 'Elisabetta Tancini', to: 'elisabetta-tancini/' }];

// Testo fornito da Élite Experience
const bio = [
  'Imprenditrice, Hair Spa Specialist e formatrice internazionale, Elisabetta Tancini ha costruito il proprio percorso professionale unendo l’esperienza quotidiana in salone alla ricerca e all’evoluzione delle tecniche dedicate al mondo Hair Spa.',
  'Alla guida di Maison BB, il suo salone ad Arona, <strong>vive ogni giorno la professione da una doppia prospettiva</strong>: quella di chi lavora a contatto con le persone e quella di chi conosce le esigenze, le responsabilità e le sfide di un’impresa nel settore Hair &amp; Beauty.',
  'Parallelamente, la sua attività di formatrice la porta a collaborare a <strong>livello internazionale</strong> con importanti protagonisti dell’industria Hair, condividendo competenze, tecniche e una visione dell’Hair Spa in cui precisione delle manualità, sensibilità e cura del dettaglio diventano elementi distintivi.',
  'Da questo incontro tra <strong>esperienza imprenditoriale, pratica professionale e formazione</strong> nasce Élite Experience, il metodo attraverso cui Elisabetta interpreta l’Hair Spa e trasmette il proprio sapere ai professionisti che desiderano introdurre o perfezionare questa disciplina nel proprio salone.',
  'Per Elisabetta, formare significa <strong>andare oltre</strong> la dimostrazione di un rituale: significa insegnare a comprenderne ogni gesto, acquisire sicurezza nelle manualità e sviluppare una propria <strong>consapevolezza professionale</strong>.',
];

export default [{
  route: 'elisabetta-tancini/',
  render(ctx) {
    const { editorial } = ctx.data;
    const body = `
${fullHero(ctx, {
  cls: 'hero--eli',
  slides: [
    { image: 'ritrattoFiori', position: '46% 30%', positionMobile: '45% 30%' },
    { image: 'palcoIntervento', position: '52% 35%', positionMobile: '51% 35%' },
    { image: 'lavatestaArco', position: '78% 12%', positionMobile: '95% 12%' },
    { image: 'palcoDimostrazione', position: '56% 35%', positionMobile: '59% 35%' },
  ],
  eyebrow: 'Fondatrice di Élite Experience',
  title: '<span class="rv"><span>Elisabetta</span></span> <span class="rv"><span>Tancini</span></span>',
  lead: 'Imprenditrice, Hair Spa Specialist e formatrice internazionale.',
})}

<section class="sec sec--deep vision">
  <div class="wrap">
    ${eyebrow('Vision')}
    ${signedQuote(`${esc('L’Hair Spa è l’arte di dare tempo:')}<br>${esc('al gesto, alla persona, alla cura che li unisce.')}`, { cls: 'signed--xl' })}
  </div>
</section>

<section class="sec sec--ivory bio" id="percorso">
  <div class="wrap">
    <header class="bio__top">
      ${eyebrow('Il percorso professionale')}
      <h2 class="bio__title">L’esperienza di un’imprenditrice.<br>La visione di una formatrice.</h2>
    </header>
    <div class="bio__grid">
      <div class="bio__head">${media(ctx, 'formatricePalco', { ratio: '4/5', position: '50% 28%', cls: 'bio__img' })}</div>
      <div class="bio__text">
        ${bio.map((t, i) => `<p${i === 0 ? ' class="lead"' : ''}>${t}</p>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="sec sec--deep teach">
  <div class="wrap split split--7-5">
    <div>
      ${sectionHead({ eyebrow: 'La formazione', title: 'Una visione da condividere.' })}
      <p class="lead">Le competenze prendono forma attraverso lo <strong>studio</strong>, la <strong>comprensione</strong> e la <strong>pratica</strong>.</p>
      <p>Elisabetta mostra ogni gesto, ne approfondisce la tecnica e la sequenza, accompagnando il professionista nell’apprendimento delle manualità e nella loro applicazione all’interno dei rituali Hair Spa.</p>
      <p class="teach__intro">Due modalità formative, pensate per rispondere a esigenze differenti:</p>
      <ul class="linelist linelist--light">
        <li><b>Online</b><span><strong>Videolezioni dimostrative</strong> e teoriche per approfondire tecniche, gesti e sequenze operative, con la libertà di apprendere secondo i propri tempi.</span></li>
        <li><b>In presenza</b><span><strong>Percorsi formativi</strong> ad Arona o direttamente nel salone del professionista, per apprendere le manualità a stretto contatto con Elisabetta, attraverso dimostrazioni, esercitazioni e confronto diretto.</span></li>
      </ul>
    </div>
    ${videoBlock(ctx, { poster: 'formazioneVideo', posterPos: '50% 45%', title: 'Elisabetta Tancini in formazione', loop: { webm: 'video/elisabetta-formazione.webm', mp4: 'video/elisabetta-formazione.mp4' }, ratio: '4/5' })}
  </div>
</section>

<section class="sec sec--beige eli-collab" id="collaborazioni">
  <div class="wrap">
    <div class="eli-collab__head">
      ${sectionHead({ eyebrow: 'Collaborazioni', title: 'Elisabetta Tancini per aziende e progetti <em>educational</em>.' })}
      <div class="eli-collab__intro">
        <p class="lead">Per brand e aziende Hair &amp; Beauty, distributori, accademie e organizzatori di eventi che cercano una formatrice Hair Spa per progetti professionali.</p>
        <p>Formazione per reti commerciali e team tecnici, contenuti formativi dedicati, masterclass ed eventi: ogni progetto viene definito insieme al partner.</p>
        ${btn(ctx, { label: 'Proponi una collaborazione', to: 'contatti/#collaborazioni' })}
      </div>
    </div>
    <div class="eli-collab__body">
      <div class="eli-collab__img">${media(ctx, 'dimostrazione', { fill: true, position: '42% 30%' })}</div>
      <ol class="collab-cards">${editorial.collaborations.types.map((t, i) => `<li class="collab-card">
        <span class="collab-card__n">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="collab-card__name">${esc(t.name)}</h3>
        <p>${esc(t.text)}</p>
      </li>`).join('')}</ol>
    </div>
  </div>
</section>

${fullImage(ctx, 'consulenzaSalone', { position: '30% 35%', positionMobile: '8% 35%' })}

<section class="sec sec--ivory partners-sec">
  <div class="wrap partners-sec__grid">
    <header class="partners-sec__head">
      ${eyebrow('Collaborazioni')}
      <h2 class="shead__title">Partnership attive.</h2>
      <p class="partners-sec__lead">L’attività di formatrice porta Elisabetta a collaborare a livello internazionale con importanti protagonisti dell’industria Hair.</p>
    </header>
    <ul class="partners">
      ${editorial.collaborations.documented.map((p) => `<li class="partner">
        <div class="partner__logo">${p.logo ? `<img ${ctx.src(p.logo)}${p.logoW ? ` width="${p.logoW}" height="${p.logoH}"` : ''} alt="${esc(p.name)}" loading="lazy">` : `<span class="partner__word">${esc(p.name)}</span><span class="ph__flag partner__flag" aria-hidden="true">Logo ufficiale da inserire</span>`}</div>
        <div class="partner__meta">
          <h3 class="partner__name sr-only">${esc(p.name)}</h3>
          <span class="partner__role">${esc(p.role)}</span>
          ${p.status === 'attiva' ? '<span class="partner__status">Partnership attiva</span>' : ''}
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>

<section class="sec sec--deep band" id="collaboriamo">
  <div class="wrap band__in">
    <div>
      ${eyebrow('Collaboriamo')}
      <h2 class="h2serif">Per aziende, accademie, distributori e organizzatori di eventi.</h2>
    </div>
    <div class="actions">${btn(ctx, { label: 'Proponi una collaborazione', to: 'contatti/#collaborazioni', variant: 'light' })}</div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Elisabetta Tancini — Hair Spa Specialist e formatrice',
      description: 'Imprenditrice, Hair Spa Specialist e formatrice internazionale: Elisabetta Tancini guida Maison BB ad Arona ed è la fondatrice di Élite Experience.',
      jsonld: [person(), breadcrumbs(crumbs)],
      ogImage: 'ritrattoFiori',
      ogType: 'profile',
      bodyClass: 'p-eli',
      body,
    });
  },
}];
