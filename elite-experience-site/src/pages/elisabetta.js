import { esc, eyebrow, sectionHead, btn, media, videoBlock } from '../components/core.js';
import { person, breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';
import { fullHero, fullImage, signedQuote } from '../components/blocks.js';

const crumbs = [{ label: 'Home', to: '' }, { label: 'Elisabetta Tancini', to: 'elisabetta-tancini/' }];

// Testo fornito da Élite Experience
const bio = [
  'Imprenditrice, Hair Spa Specialist e formatrice internazionale, Elisabetta Tancini ha costruito il proprio percorso professionale unendo l’esperienza quotidiana in salone alla ricerca e all’evoluzione delle tecniche dedicate al mondo Hair Spa.',
  'Alla guida di Maison BB, il suo salone ad Arona, vive ogni giorno la professione da una doppia prospettiva: quella di chi lavora a contatto con le persone e quella di chi conosce le esigenze, le responsabilità e le sfide di un’impresa nel settore Hair &amp; Beauty.',
  'Parallelamente, la sua attività di formatrice la porta a collaborare a livello internazionale con importanti protagonisti dell’industria Hair, condividendo competenze, tecniche e una visione dell’Hair Spa in cui precisione delle manualità, sensibilità e cura del dettaglio diventano elementi distintivi.',
  'Da questo incontro tra esperienza imprenditoriale, pratica professionale e formazione nasce Élite Experience, il metodo attraverso cui Elisabetta interpreta l’Hair Spa e trasmette il proprio sapere ai professionisti che desiderano introdurre o perfezionare questa disciplina nel proprio salone.',
  'Per Elisabetta, formare significa andare oltre la dimostrazione di un rituale: significa insegnare a comprenderne ogni gesto, acquisire sicurezza nelle manualità e sviluppare una propria consapevolezza professionale.',
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

<section class="sec vision">
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
      <p class="lead">Le competenze prendono forma attraverso lo studio, la comprensione e la pratica.</p>
      <p>Elisabetta mostra ogni gesto, ne approfondisce la tecnica e la sequenza, accompagnando il professionista nell’apprendimento delle manualità e nella loro applicazione all’interno dei rituali Hair Spa.</p>
      <p class="teach__intro">Due modalità formative, pensate per rispondere a esigenze differenti:</p>
      <ul class="linelist linelist--light">
        <li><b>Online</b><span>Videolezioni dimostrative e teoriche per approfondire tecniche, gesti e sequenze operative, con la libertà di apprendere secondo i propri tempi.</span></li>
        <li><b>In presenza</b><span>Percorsi formativi ad Arona o direttamente nel salone del professionista, per apprendere le manualità a stretto contatto con Elisabetta, attraverso dimostrazioni, esercitazioni e confronto diretto.</span></li>
      </ul>
    </div>
    ${videoBlock(ctx, { poster: 'formazioneGruppo', posterPos: '50% 50%', title: 'Elisabetta in formazione', note: 'Inserire un estratto autentico di Elisabetta durante una lezione.', ratio: '4/5' })}
  </div>
</section>

<section class="sec eli-collab" id="collaborazioni">
  <div class="wrap split split--5-7">
    <div>${sectionHead({ eyebrow: 'Collaborazioni', title: 'Elisabetta Tancini per aziende e progetti educational.' })}</div>
    <div class="prose">
      <p class="lead">Per brand e aziende Hair &amp; Beauty, distributori, accademie e organizzatori di eventi che cercano una formatrice Hair Spa per progetti professionali.</p>
      <p>Formazione per reti commerciali e team tecnici, contenuti formativi dedicati, masterclass ed eventi: ogni progetto viene definito insieme al partner.</p>
      <ul class="collab-list">${editorial.collaborations.types.map((t) => `<li><b>${esc(t.name)}</b><span>${esc(t.text)}</span></li>`).join('')}</ul>
      ${btn(ctx, { label: 'Proponi una collaborazione', to: 'contatti/#collaborazioni' })}
    </div>
  </div>
</section>

${fullImage(ctx, 'consulenzaSalone', { position: '30% 35%', positionMobile: '8% 35%' })}

<section class="sec partners-sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Collaborazioni', title: 'Partnership attive.' })}
    <div class="partners">
      ${editorial.collaborations.documented.map((p) => `<article class="partner">
        <div class="partner__logo">${p.logo ? `<img ${ctx.src(p.logo)}${p.logoW ? ` width="${p.logoW}" height="${p.logoH}"` : ''} alt="${esc(p.name)}" loading="lazy">` : `<span class="partner__word">${esc(p.name)}</span><span class="ph__flag partner__flag" aria-hidden="true">Logo ufficiale da inserire</span>`}</div>
        <h3 class="partner__name sr-only">${esc(p.name)}</h3>
        <p class="partner__role">${esc(p.role)}</p>
      </article>`).join('')}
    </div>
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
      title: 'Elisabetta Tancini — Hair Spa Specialist, formatrice e fondatrice di Élite Experience',
      description: 'Elisabetta Tancini, imprenditrice, Hair Spa Specialist e formatrice internazionale: alla guida del salone Maison BB ad Arona, è la fondatrice di Élite Experience e l’ideatrice del Metodo Élite.',
      jsonld: [person(), breadcrumbs(crumbs)],
      ogImage: 'ritrattoFiori',
      ogType: 'profile',
      bodyClass: 'p-eli',
      body,
    });
  },
}];
