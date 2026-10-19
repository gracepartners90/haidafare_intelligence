import { site } from '../config.js';
import { esc, tbd, draft, eyebrow, sectionHead, btn, arrow, media, slot, tbdBlock, breadcrumb, faqList, form, videoBlock } from '../components/core.js';
import { courseCard, courseUrl } from '../components/course.js';
import { breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';

const H = { label: 'Home', to: '' };

/* ---------------- PER I SALONI ---------------- */
const saloni = {
  route: 'per-i-saloni/',
  render(ctx) {
    const { courses, faq } = ctx.data;
    const crumbs = [H, { label: 'Per i Saloni', to: 'per-i-saloni/' }];
    const wellness = courses.find((c) => c.id === 'wellness-ritual');
    const body = `
<section class="phero phero--split">
  <div class="phero__text">
    ${breadcrumb(ctx, crumbs)}
    ${eyebrow('Per i titolari di salone')}
    <h1 class="phero__title">L’Hair Spa nel tuo salone.</h1>
    <p class="phero__lead">Che tu voglia iniziare o approfondire, il Metodo Élite ti accompagna con percorsi formativi online e in presenza, costruiti su rituali, tecniche e manualità.</p>
    <div class="actions">${btn(ctx, { label: 'Richiedi una consulenza formativa', to: 'contatti/#formazione' })}</div>
  </div>
  <div class="phero__media">${media(ctx, 'dettaglioMateriali', { fill: true, eager: true, position: '45% 60%' })}</div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Due esigenze', title: 'Da dove parte il tuo salone?' })}
    <div class="needs">
      <article class="need" id="iniziare">
        <p class="eyebrow">Per chi desidera iniziare</p>
        <h2 class="h2serif">Acquisire competenze e conoscere i rituali Hair Spa.</h2>
        <p>Per il salone che vuole introdurre l’Hair Spa: capire da dove partire, quali competenze acquisire e quali corsi scegliere per le prime manualità.</p>
        <p class="sub-h">Percorsi consigliati</p>
        <ul class="taglist"><li><a href="${ctx.href(courseUrl(wellness))}">${esc(wellness.name)}</a> <span class="chip chip--draft">introduttivo · da confermare</span></li><li><a href="${ctx.href('academy/formazione-in-presenza/')}">Formazione in presenza</a></li></ul>
      </article>
      <article class="need need--dark" id="approfondire">
        <p class="eyebrow">Per chi desidera approfondire</p>
        <h2 class="h2serif">Perfezionare le manualità e ampliare il repertorio.</h2>
        <p>Per il salone che offre già servizi Hair Spa e vuole conoscere nuove manualità e le differenze tra i singoli rituali.</p>
        <p class="sub-h">Percorsi consigliati</p>
        <ul class="taglist taglist--light">${courses.filter((c) => c.id !== 'wellness-ritual').map((c) => `<li><a href="${ctx.href(courseUrl(c))}">${esc(c.name)}</a></li>`).join('')}<li><a href="${ctx.href('academy/formazione-online/#collezione')}">${esc(ctx.data.collection.name)}</a></li></ul>
      </article>
    </div>
  </div>
</section>

<section class="sec sec--beige">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'I percorsi', title: 'Le schede dei corsi.' })}
    <div class="cgrid">${courses.map((c, i) => courseCard(ctx, c, { size: i < 3 ? 'm' : 'l' })).join('')}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--6-6">
    ${media(ctx, 'lavatesta', { ratio: '4/3', position: '62% 45%' })}
    <div>
      ${sectionHead({ eyebrow: 'Esempi di applicazione', title: 'Come la formazione entra nel salone.' })}
      <ul class="linelist">
        <li><b>${draft('Un rituale nel menu dei servizi')}</b><span>${draft('Introdurre un rituale appreso come servizio dedicato.')}</span></li>
        <li><b>${draft('Le manualità nei servizi esistenti')}</b><span>${draft('Arricchire i servizi al lavatesta con nuove manualità.')}</span></li>
        <li><b>${draft('Un linguaggio comune nel team')}</b><span>${draft('Formare più operatori sugli stessi rituali.')}</span></li>
      </ul>
      ${tbdBlock({ title: 'Casi reali di saloni', lines: ['Salone — città — rituale introdotto'], note: 'Da documentare con saloni che hanno seguito la formazione.' })}
    </div>
  </div>
</section>

<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Testimonianze', title: 'Dai saloni che si sono formati.' })}
    <div class="testi">
      ${videoBlock(ctx, { posterSubject: 'Videotestimonianza di un titolare di salone', title: 'Videotestimonianza', note: 'Inserire una testimonianza reale con autorizzazione.', ratio: '4/5', tone: 'light' })}
      <figure class="testi__quote testi__quote--text"><blockquote>${tbd('Citazione reale del titolare')}</blockquote><figcaption>${tbd('Nome, salone, città')}</figcaption></figure>
      <figure class="testi__quote testi__quote--text"><blockquote>${tbd('Citazione reale di un operatore')}</blockquote><figcaption>${tbd('Nome, salone, città')}</figcaption></figure>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap split split--4-8">
    <div>${sectionHead({ eyebrow: 'FAQ', title: 'Domande dei saloni' })}</div>
    ${faqList([faq[0], faq[3], { q: 'È possibile formare più operatori dello stesso salone?', a: null }, { q: 'La formazione può svolgersi nel mio salone?', a: 'Sì: la formazione in presenza può essere organizzata direttamente presso la sede del professionista.', verified: true }])}
  </div>
</section>

<section class="sec sec--choc band">
  <div class="wrap band__in">
    <div>${eyebrow('Consulenza formativa')}<h2 class="h2serif">Costruiamo il percorso per il tuo salone.</h2></div>
    <div class="actions">${btn(ctx, { label: 'Richiedi una consulenza formativa', to: 'contatti/#formazione', variant: 'light' })}</div>
  </div>
</section>`;
    return page(ctx, {
      title: 'Hair Spa per i saloni — Iniziare o approfondire | Élite Experience',
      description: 'L’Hair Spa nel tuo salone: percorsi di formazione del Metodo Élite per chi vuole iniziare e per chi vuole approfondire le manualità. Schede dei corsi e consulenza formativa.',
      jsonld: [breadcrumbs(crumbs)],
      bodyClass: 'p-salons',
      body,
    });
  },
};

/* ---------------- JOURNAL ---------------- */
function journalPages(data) {
  const j = data.editorial.journal;
  const base = [H, { label: 'Journal', to: 'journal/' }];
  const catLabel = (slug) => j.categories.find((c) => c.slug === slug).name;
  const planCard = (ctx, a) => `<article class="jcard jcard--plan">${a.image ? media(ctx, a.image, { ratio: '3/2', position: a.imagePos }) : slot({ subject: 'Immagine dell’articolo', ratio: '3/2' })}<p class="jcard__meta"><span>${esc(catLabel(a.category))}</span><span class="chip chip--tbd">In preparazione</span></p><h3 class="jcard__title">${esc(a.title)}</h3><p class="jcard__note">Proposta editoriale: non ancora pubblicato.</p></article>`;
  const cats = (ctx, active) => `<nav class="cats" aria-label="Categorie del Journal"><ul>
    <li><a href="${ctx.href('journal/')}"${!active ? ' aria-current="page"' : ''}>Tutti</a></li>
    ${j.categories.map((c) => `<li><a href="${ctx.href(`journal/categoria/${c.slug}/`)}"${active === c.slug ? ' aria-current="page"' : ''}>${esc(c.name)}</a></li>`).join('')}
  </ul></nav>`;

  const archive = {
    route: 'journal/',
    render(ctx) {
      const body = `
<section class="phero phero--center">
  <div class="wrap">
    ${breadcrumb(ctx, base)}
    ${eyebrow('Journal')}
    <h1 class="phero__title">Élite &amp; More</h1>
    <p class="phero__lead">Cultura Hair Spa, tecniche e manualità, formazione professionale e la visione di Elisabetta Tancini.</p>
  </div>
</section>
<section class="sec sec--tight">
  <div class="wrap">
    ${cats(ctx)}
    ${j.articles.length ? '' : `<p class="empty">Nessun articolo è ancora pubblicato. Di seguito il piano editoriale in preparazione.</p>`}
    <div class="jgrid">${j.plan.map((a) => planCard(ctx, a)).join('')}</div>
    <p class="small">${arrow(ctx, { label: 'Vedi l’impaginazione di un articolo (esempio di layout)', to: 'journal/esempio-impaginazione/' })}</p>
  </div>
</section>
<section class="sec sec--ivory">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Categorie', title: 'Gli argomenti del Journal.' })}
    <ul class="catlist">${j.categories.map((c) => `<li><a href="${ctx.href(`journal/categoria/${c.slug}/`)}"><h3 class="h3serif">${esc(c.name)}</h3><p>${esc(c.description)}</p><i aria-hidden="true">→</i></a></li>`).join('')}</ul>
  </div>
</section>`;
      return page(ctx, { title: 'Journal — Élite & More | Élite Experience', description: 'Il Journal di Élite Experience: cultura Hair Spa, tecniche e manualità, formazione professionale, la visione di Elisabetta Tancini, collaborazioni ed eventi.', jsonld: [breadcrumbs(base)], bodyClass: 'p-journal', body });
    },
  };

  const categories = j.categories.map((cat) => ({
    route: `journal/categoria/${cat.slug}/`,
    render(ctx) {
      const crumbs = [...base, { label: cat.name, to: `journal/categoria/${cat.slug}/` }];
      const plan = j.plan.filter((a) => a.category === cat.slug);
      const body = `
<section class="phero phero--center">
  <div class="wrap">
    ${breadcrumb(ctx, crumbs)}
    ${eyebrow('Journal — Categoria')}
    <h1 class="phero__title">${esc(cat.name)}</h1>
    <p class="phero__lead">${esc(cat.description)}</p>
  </div>
</section>
<section class="sec sec--tight">
  <div class="wrap">
    ${cats(ctx, cat.slug)}
    <p class="empty">Nessun articolo pubblicato in questa categoria.</p>
    ${plan.length ? `<div class="jgrid">${plan.map((a) => planCard(ctx, a)).join('')}</div>` : ''}
  </div>
</section>`;
      return page(ctx, { title: `${cat.name} — Journal | Élite Experience`, description: `${cat.description} Articoli del Journal di Élite Experience.`, jsonld: [breadcrumbs(crumbs)], bodyClass: 'p-journal', body });
    },
  }));

  const example = {
    route: 'journal/esempio-impaginazione/',
    render(ctx) {
      const crumbs = [...base, { label: 'Esempio di impaginazione', to: 'journal/esempio-impaginazione/' }];
      const body = `
<article class="article">
  <header class="article__head wrap">
    ${breadcrumb(ctx, crumbs)}
    <p class="article__flag">Esempio di layout — articolo non pubblicato</p>
    <p class="article__meta"><a href="${ctx.href('journal/categoria/metodo-e-rituali/')}">Metodo e rituali</a> · <time>${tbd('Data di pubblicazione')}</time></p>
    <h1 class="article__title">${tbd('Titolo dell’articolo')}</h1>
    <p class="article__lead">${tbd('Sommario: due righe che introducono l’argomento')}</p>
    <div class="article__author">${media(ctx, 'ritratto', { ratio: '1/1', position: '50% 18%', cls: 'avatar' })}<p><b>Elisabetta Tancini</b><span>Fondatrice di Élite Experience</span></p></div>
  </header>
  <div class="article__hero">${media(ctx, 'dettaglioMateriali', { ratio: '21/9' })}</div>
  <div class="article__body wrap-narrow">
    <p>${tbd('Corpo dell’articolo. Paragrafo di apertura.')}</p>
    <h2>${tbd('Sottotitolo di sezione')}</h2>
    <p>${tbd('Paragrafo. I testi del Journal devono essere originali e verificati.')}</p>
    <blockquote class="quote"><p>${tbd('Citazione evidenziata')}</p></blockquote>
    <figure>${media(ctx, 'dettaglioMani', { ratio: '16/10' })}<figcaption>${tbd('Didascalia')}</figcaption></figure>
    <p>${tbd('Paragrafo di chiusura.')}</p>
    <aside class="article__course">
      <p class="eyebrow">Approfondisci con la formazione</p>
      <p class="h3serif">${tbd('Corso collegato all’argomento')}</p>
      ${arrow(ctx, { label: 'Vai ai corsi online', to: 'academy/formazione-online/' })}
    </aside>
  </div>
  <section class="sec sec--ivory">
    <div class="wrap">
      ${sectionHead({ eyebrow: 'Articoli correlati', title: 'Continua a leggere.' })}
      <div class="jgrid">${j.plan.map((a) => planCard(ctx, a)).join('')}</div>
    </div>
  </section>
</article>`;
      return page(ctx, { title: 'Esempio di impaginazione articolo — Journal | Élite Experience', description: 'Modello di impaginazione degli articoli del Journal di Élite Experience.', noindex: true, bodyClass: 'p-article', body });
    },
  };
  return [archive, ...categories, example];
}

/* ---------------- CONTATTI ---------------- */
const contatti = {
  route: 'contatti/',
  render(ctx) {
    const { courses } = ctx.data;
    const crumbs = [H, { label: 'Contatti', to: 'contatti/' }];
    const courseOpts = [...courses.map((c) => c.name), ctx.data.collection.name, 'Non so ancora'];
    const c = site.contacts;
    const body = `
<section class="phero phero--center">
  <div class="wrap">
    ${breadcrumb(ctx, crumbs)}
    ${eyebrow('Contatti')}
    <h1 class="phero__title">Trova il percorso più adatto al tuo salone.</h1>
    <p class="phero__lead">Scegli il tipo di richiesta: ti risponderemo con le informazioni utili per il tuo caso.</p>
  </div>
</section>
<section class="sec sec--tight">
  <div class="wrap contact">
    <div class="tabs" role="tablist" aria-label="Tipo di richiesta" data-tabs>
      <button role="tab" id="tab-formazione" aria-controls="formazione" aria-selected="true">Informazioni sulla formazione</button>
      <button role="tab" id="tab-presenza" aria-controls="presenza" aria-selected="false">Formazione in presenza</button>
      <button role="tab" id="tab-collaborazioni" aria-controls="collaborazioni" aria-selected="false">Collaborazioni professionali</button>
    </div>
    <div class="contact__grid">
      <div class="contact__forms">
        <div role="tabpanel" id="formazione" aria-labelledby="tab-formazione">
          ${form(ctx, { id: 'form-formazione', title: 'Informazioni sulla formazione', intro: 'Per conoscere i corsi e ricevere un orientamento sul percorso più adatto.', submit: 'Richiedi informazioni', fields: [
            { name: 'nome', label: 'Nome e cognome', required: true, autocomplete: 'name', half: true },
            { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', half: true },
            { name: 'telefono', label: 'Telefono', type: 'tel', autocomplete: 'tel', half: true },
            { name: 'ruolo', label: 'Ruolo', type: 'select', options: ['Titolare di salone', 'Hairstylist', 'Operatore Hair Spa', 'Altro'], half: true },
            { name: 'esperienza', label: 'Esperienza Hair Spa', type: 'select', options: ['Nessuna, voglio iniziare', 'Offro già servizi Hair Spa'], required: true, half: true },
            { name: 'corso', label: 'Corso di interesse', type: 'select', options: courseOpts, half: true },
            { name: 'messaggio', label: 'Messaggio', type: 'textarea' },
          ] })}
        </div>
        <div role="tabpanel" id="presenza" aria-labelledby="tab-presenza" hidden>
          ${form(ctx, { id: 'form-presenza', title: 'Formazione in presenza', intro: 'Per verificare disponibilità e organizzazione, ad Arona o nel tuo salone.', submit: 'Richiedi disponibilità', fields: [
            { name: 'nome', label: 'Nome e cognome', required: true, autocomplete: 'name', half: true },
            { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', half: true },
            { name: 'telefono', label: 'Telefono', type: 'tel', autocomplete: 'tel', half: true },
            { name: 'salone', label: 'Salone e città', required: true, half: true },
            { name: 'modalita', label: 'Dove', type: 'select', options: ['Presso la sede di Arona', 'Nel mio salone'], required: true, half: true },
            { name: 'partecipanti', label: 'Numero di partecipanti', type: 'number', half: true },
            { name: 'periodo', label: 'Periodo preferito', half: true },
            { name: 'messaggio', label: 'Messaggio', type: 'textarea' },
          ] })}
        </div>
        <div role="tabpanel" id="collaborazioni" aria-labelledby="tab-collaborazioni" hidden>
          ${form(ctx, { id: 'form-collaborazioni', title: 'Collaborazioni professionali', intro: 'Per aziende, brand, distributori, accademie e organizzatori di eventi.', submit: 'Invia la proposta', fields: [
            { name: 'nome', label: 'Nome e cognome', required: true, autocomplete: 'name', half: true },
            { name: 'azienda', label: 'Azienda o ente', required: true, autocomplete: 'organization', half: true },
            { name: 'ruolo', label: 'Ruolo', half: true },
            { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', half: true },
            { name: 'telefono', label: 'Telefono', type: 'tel', autocomplete: 'tel', half: true },
            { name: 'tipologia', label: 'Tipo di collaborazione', type: 'select', options: ['Azienda o brand', 'Distributore', 'Accademia', 'Organizzatore di eventi', 'Altro'], required: true, half: true },
            { name: 'paese', label: 'Paese', autocomplete: 'country-name', half: true },
            { name: 'progetto', label: 'Descrizione del progetto', type: 'textarea', required: true },
          ] })}
        </div>
      </div>
      <aside class="contact__info">
        ${media(ctx, 'ritratto', { ratio: '4/5', position: '50% 22%' })}
        <dl class="specs specs--tight">
          <div><dt>Sede</dt><dd>${esc(site.city)}${c.address ? `, ${esc(c.address)}` : ` ${tbd('indirizzo')}`}</dd></div>
          <div><dt>Email</dt><dd>${c.email ? esc(c.email) : tbd('da inserire')}</dd></div>
          <div><dt>Telefono</dt><dd>${c.phone ? esc(c.phone) : tbd('da inserire')}</dd></div>
          <div><dt>Academy</dt><dd><a href="${site.academyUrl}" target="_blank" rel="noopener">academy.elitexperience.it ↗</a></dd></div>
        </dl>
      </aside>
    </div>
  </div>
</section>`;
    return page(ctx, { title: 'Contatti — Informazioni sulla formazione e collaborazioni | Élite Experience', description: 'Contatta Élite Experience: informazioni sui corsi Hair Spa, formazione in presenza con Elisabetta Tancini e proposte di collaborazione.', jsonld: [breadcrumbs(crumbs)], ogImage: 'ritratto', bodyClass: 'p-contact', body });
  },
};

/* ---------------- PRIVACY (struttura) + 404 ---------------- */
const privacy = {
  route: 'privacy/',
  render(ctx) {
    const body = `<section class="phero phero--center"><div class="wrap">${breadcrumb(ctx, [H, { label: 'Privacy e cookie', to: 'privacy/' }])}<h1 class="phero__title">Privacy e cookie</h1></div></section>
<section class="sec sec--tight"><div class="wrap-narrow">${tbdBlock({ title: 'Informativa privacy e cookie policy', lines: ['Titolare del trattamento', 'Finalità e basi giuridiche dei moduli di contatto', 'Cookie tecnici e di terze parti'], note: 'Testo da redigere con il consulente legale prima della pubblicazione.' })}<p id="cookie"></p></div></section>`;
    return page(ctx, { title: 'Privacy e cookie | Élite Experience', description: 'Informativa privacy e cookie di Élite Experience.', noindex: true, body });
  },
};

const notFound = {
  route: '404/',
  file: '404.html',
  render(ctx) {
    const body = `<section class="phero phero--center nf"><div class="wrap">${eyebrow('Pagina non trovata')}<h1 class="phero__title">Questa pagina non esiste.</h1><p class="phero__lead">Torna alla home o scopri la formazione.</p><div class="actions actions--center">${btn(ctx, { label: 'Home', to: '' })}${btn(ctx, { label: 'Scopri la formazione', to: 'academy/', variant: 'ghost' })}</div></div></section>`;
    return page(ctx, { title: 'Pagina non trovata | Élite Experience', description: 'Pagina non trovata.', noindex: true, body });
  },
};

export default (data) => [saloni, ...journalPages(data), contatti, privacy, notFound];
