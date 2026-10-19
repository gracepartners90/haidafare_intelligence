import { esc, tbd, draft, eyebrow, sectionHead, btn, arrow, media, slot, tbdBlock, breadcrumb, videoBlock } from '../components/core.js';
import { person, breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';

const crumbs = [{ label: 'Home', to: '' }, { label: 'Elisabetta Tancini', to: 'elisabetta-tancini/' }];

export default [{
  route: 'elisabetta-tancini/',
  render(ctx) {
    const { editorial } = ctx.data;
    const body = `
<section class="eli-hero">
  <div class="eli-hero__media">${media(ctx, 'ritratto', { fill: true, eager: true, position: '50% 20%' })}</div>
  <div class="eli-hero__text">
    ${breadcrumb(ctx, crumbs)}
    ${eyebrow('Fondatrice di Élite Experience')}
    <h1 class="display-name display-name--xl">Elisabetta <em>Tancini</em></h1>
    <ul class="roles">
      <li>Ideatrice del Metodo Élite</li>
      <li>Formatrice Hair Spa</li>
      <li>Fondatrice di Élite Experience</li>
    </ul>
    <p class="eli-hero__more">${tbd('Ulteriori qualifiche e ruoli documentati')}</p>
    <div class="actions">
      ${btn(ctx, { label: 'Collaboriamo', to: '#collaboriamo', variant: 'light' })}
      ${arrow(ctx, { label: 'La formazione', to: 'academy/', cls: 'arrow--light' })}
    </div>
  </div>
</section>

<section class="sec vision">
  <div class="wrap">
    ${eyebrow('La sua visione')}
    <blockquote class="quote quote--xl quote--tbd"><p>${tbd('Dichiarazione personale di Elisabetta sul suo approccio all’Hair Spa e alla formazione — da raccogliere in prima persona')}</p><cite>Elisabetta Tancini</cite></blockquote>
  </div>
</section>

<section class="sec sec--ivory" id="percorso">
  <div class="wrap split split--5-7">
    <div>
      ${sectionHead({ eyebrow: 'Il percorso professionale', title: 'Esperienze, competenze, tappe.' })}
      ${media(ctx, 'lavatesta', { ratio: '4/3', position: '30% 40%' })}
    </div>
    <div>
      <ol class="timeline">
        ${[1, 2, 3, 4].map(() => `<li><span class="timeline__y">${tbd('Anno')}</span><div><h3>${tbd('Tappa professionale')}</h3><p>${tbd('Descrizione: formazione, esperienze in salone, specializzazioni, riconoscimenti documentati')}</p></div></li>`).join('')}
      </ol>
      ${tbdBlock({ title: 'Biografia', lines: ['Formazione e specializzazioni', 'Anni di esperienza nel settore', 'Competenze distintive'], note: 'Inserire solo dati verificati con Elisabetta.' })}
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--6-6">
    ${media(ctx, 'pinda', { ratio: '4/3', position: '62% 50%' })}
    <div>
      ${sectionHead({ eyebrow: 'La nascita di Élite Experience', title: 'Dall’esperienza personale al metodo.' })}
      <p class="lead">Élite Experience nasce dal lavoro di Elisabetta: un’esperienza professionale che diventa metodo, e un metodo che diventa progetto formativo.</p>
      ${tbdBlock({ title: 'Il racconto della nascita di Élite Experience', lines: ['Anno di fondazione', 'Come il metodo è diventato formazione online e in presenza'] })}
    </div>
  </div>
</section>

<section class="sec sec--deep teach">
  <div class="wrap split split--7-5">
    <div>
      ${sectionHead({ eyebrow: 'L’approccio all’insegnamento', title: 'Come Elisabetta trasferisce il metodo.' })}
      <p class="lead">${draft('Le competenze passano dalla dimostrazione alla pratica: Elisabetta mostra il gesto, ne spiega la sequenza e accompagna il professionista nell’esecuzione.')}</p>
      <ul class="linelist linelist--light">
        <li><b>Online</b><span>Videolezioni teoriche e dimostrative.</span></li>
        <li><b>In presenza</b><span>Percorsi pratici ad Arona o nel salone del professionista.</span></li>
      </ul>
    </div>
    ${videoBlock(ctx, { poster: 'dettaglioPinda', title: 'Elisabetta in formazione', note: 'Inserire un estratto autentico di Elisabetta durante una lezione.', ratio: '4/5' })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Collaborazioni professionali', title: 'Con brand e aziende del settore.', lead: 'Collaborazioni da documentare con materiali ufficiali (loghi, periodo, tipo di attività) prima della pubblicazione.' })}
    <div class="partners">
      ${editorial.collaborations.documented.map((p) => `<article class="partner">
        <div class="partner__logo">${tbd('Logo ' + p.name)}</div>
        <h3>${esc(p.name)} <span class="chip chip--tbd">${esc(p.status)}</span></h3>
        <p>${tbd('Tipo di collaborazione, periodo e attività svolte')}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap split split--6-6">
    <div>
      ${sectionHead({ eyebrow: 'Eventi e masterclass', title: 'Attività educational e interventi.' })}
      ${tbdBlock({ title: 'Elenco di eventi, masterclass e interventi documentati', lines: ['Evento — luogo — data', 'Masterclass — organizzatore — data'], note: 'Nessun evento viene mostrato finché non è documentato.' })}
    </div>
    <div>
      ${sectionHead({ eyebrow: 'Journal di Elisabetta', title: 'Contenuti firmati.' })}
      <p>I contenuti editoriali firmati da Elisabetta saranno raccolti nella categoria dedicata del Journal.</p>
      ${arrow(ctx, { label: 'Journal — Elisabetta Tancini', to: 'journal/categoria/elisabetta-tancini/' })}
    </div>
  </div>
</section>

<section class="sec sec--choc band" id="collaboriamo">
  <div class="wrap band__in">
    <div>
      ${eyebrow('Collaboriamo')}
      <h2 class="h2serif">Per aziende, accademie, distributori e organizzatori di eventi.</h2>
    </div>
    <div class="actions">
      ${btn(ctx, { label: 'Proponi una collaborazione', to: 'contatti/#collaborazioni', variant: 'light' })}
      ${arrow(ctx, { label: 'Tipologie di collaborazione', to: 'collaborazioni/', cls: 'arrow--light' })}
    </div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Elisabetta Tancini — Fondatrice di Élite Experience e formatrice Hair Spa',
      description: 'Elisabetta Tancini è la fondatrice di Élite Experience, ideatrice del Metodo Élite e formatrice Hair Spa. Visione, percorso professionale, insegnamento e collaborazioni.',
      jsonld: [person(), breadcrumbs(crumbs)],
      ogImage: 'ritratto',
      ogType: 'profile',
      bodyClass: 'p-eli',
      body,
    });
  },
}];
