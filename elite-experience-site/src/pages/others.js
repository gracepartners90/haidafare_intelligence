import { site } from '../config.js';
import { esc, tbd, eyebrow, btn, media, breadcrumb, form, extIcon } from '../components/core.js';
import { breadcrumbs } from '../components/seo.js';
import { page } from '../components/layout.js';
import { fullHero } from '../components/blocks.js';

const H = { label: 'Home', to: '' };

/* ---------------- CONTATTI ---------------- */
const contatti = {
  route: 'contatti/',
  render(ctx) {
    const { courses } = ctx.data;
    const crumbs = [H, { label: 'Contatti', to: 'contatti/' }];
    const courseOpts = [...courses.map((c) => c.name), ctx.data.collection.name, 'Non so ancora'];
    const c = site.contacts;
    const body = `
${fullHero(ctx, {
  image: 'vassoioRituale', position: '50% 50%', positionMobile: '45% 50%',
  eyebrow: 'Contatti',
  title: 'Trova il percorso più adatto al tuo salone.',
  lead: 'Scegli il tipo di richiesta: ti risponderemo con le informazioni utili per il tuo caso.',
})}
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
            { name: 'nome', label: 'Nome', required: true, autocomplete: 'given-name', half: true },
            { name: 'cognome', label: 'Cognome', required: true, autocomplete: 'family-name', half: true },
            { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', half: true },
            { name: 'telefono', label: 'Telefono', type: 'tel', autocomplete: 'tel', half: true },
            { name: 'salone', label: 'Salone', autocomplete: 'organization', half: true },
            { name: 'citta', label: 'Città', autocomplete: 'address-level2', half: true },
            { name: 'ruolo', label: 'Ruolo', type: 'select', options: ['Titolare di salone', 'Hairstylist', 'Operatore Hair Spa', 'Altro'], half: true },
            { name: 'esperienza', label: 'Esperienza Hair Spa', type: 'select', options: ['Nessuna, voglio iniziare', 'Offro già servizi Hair Spa'], required: true, half: true },
            { name: 'corso', label: 'Corso di interesse', type: 'select', options: courseOpts, half: true },
            { name: 'messaggio', label: 'Messaggio', type: 'textarea' },
          ] })}
        </div>
        <div role="tabpanel" id="presenza" aria-labelledby="tab-presenza" hidden>
          ${form(ctx, { id: 'form-presenza', title: 'Formazione in presenza', intro: 'Per verificare disponibilità e organizzazione, ad Arona o nel tuo salone.', submit: 'Richiedi disponibilità', fields: [
            { name: 'nome', label: 'Nome', required: true, autocomplete: 'given-name', half: true },
            { name: 'cognome', label: 'Cognome', required: true, autocomplete: 'family-name', half: true },
            { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', half: true },
            { name: 'telefono', label: 'Telefono', type: 'tel', autocomplete: 'tel', half: true },
            { name: 'salone', label: 'Salone', required: true, autocomplete: 'organization', half: true },
            { name: 'citta', label: 'Città', required: true, autocomplete: 'address-level2', half: true },
            { name: 'modalita', label: 'Dove', type: 'select', options: ['Presso la sede di Arona', 'Nel mio salone'], required: true, half: true },
            { name: 'partecipanti', label: 'Numero di partecipanti', type: 'number', half: true },
            { name: 'periodo', label: 'Periodo preferito', half: true },
            { name: 'messaggio', label: 'Messaggio', type: 'textarea' },
          ] })}
        </div>
        <div role="tabpanel" id="collaborazioni" aria-labelledby="tab-collaborazioni" hidden>
          ${form(ctx, { id: 'form-collaborazioni', title: 'Collaborazioni professionali', intro: 'Per aziende, brand, distributori, accademie e organizzatori di eventi.', submit: 'Invia la proposta', fields: [
            { name: 'nome', label: 'Nome', required: true, autocomplete: 'given-name', half: true },
            { name: 'cognome', label: 'Cognome', required: true, autocomplete: 'family-name', half: true },
            { name: 'azienda', label: 'Azienda o ente', required: true, autocomplete: 'organization', half: true },
            { name: 'ruolo', label: 'Ruolo', half: true },
            { name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', half: true },
            { name: 'telefono', label: 'Telefono', type: 'tel', autocomplete: 'tel', half: true },
            { name: 'tipologia', label: 'Tipo di collaborazione', type: 'select', options: ['Azienda o brand', 'Distributore', 'Accademia', 'Organizzatore di eventi', 'Altro'], required: true, half: true },
            { name: 'paese', label: 'Paese', autocomplete: 'country-name', half: true },
            { name: 'messaggio', label: 'Descrizione del progetto', type: 'textarea', required: true },
          ] })}
        </div>
      </div>
      <aside class="contact__info">
        ${media(ctx, 'contattiSpazzola', { ratio: '4/5', position: '50% 40%', sizes: '340px' })}
        <dl class="specs specs--tight">
          <div><dt>Email</dt><dd>${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : tbd('da inserire')}</dd></div>
          <div><dt>Telefono</dt><dd>${c.phone ? `<a href="tel:${c.phone.replace(/\s/g, '')}">${esc(c.phone)}</a>` : tbd('da inserire')}</dd></div>
          <div><dt>Academy</dt><dd><a href="${site.academyUrl}" target="_blank" rel="noopener">academy.elitexperience.it ${extIcon}</a></dd></div>
        </dl>
      </aside>
    </div>
  </div>
</section>`;
    return page(ctx, { title: 'Contatti — Formazione Hair Spa e collaborazioni', description: 'Contatta Élite Experience: informazioni sui corsi Hair Spa, formazione in presenza con Elisabetta Tancini e proposte di collaborazione.', jsonld: [breadcrumbs(crumbs)], ogImage: 'vassoioRituale', bodyClass: 'p-contact', body });
  },
};

/* ---------------- PRIVACY POLICY, COOKIE POLICY + 404 ---------------- */
// I testi arrivano da Acconsento, caricato da Google Tag Manager (site.gtm) nel contenitore con
// questo id, come sul sito WordPress. Nell'anteprima Tag Manager non c'è: compare un avviso.
function policy({ route, label, container }) {
  return {
    route,
    render(ctx) {
      const live = ctx.mode === 'pretty' && site.gtm;
      const body = `<section class="phero phero--center"><div class="wrap">${breadcrumb(ctx, [H, { label, to: route }])}<h1 class="phero__title">${esc(label)}</h1></div></section>
<section class="sec sec--tight"><div class="wrap-narrow policy">
  <div id="${container}"></div>
  ${live
    ? `<noscript><p>Per leggere il testo è necessario JavaScript. Puoi chiederlo anche a <a href="mailto:${esc(site.contacts.email)}">${esc(site.contacts.email)}</a>.</p></noscript>`
    : '<p class="policy__note">Nell’anteprima il testo non viene caricato: nella versione pubblicata arriva da Acconsento tramite Google Tag Manager.</p>'}
</div></section>`;
      return page(ctx, { title: `${label} | Élite Experience`, description: `${label} di Élite Experience.`, noindex: true, body });
    },
  };
}
const privacy = policy({ route: 'privacy-policy/', label: 'Privacy Policy', container: 'acconsento-informative-container' });
const cookie = policy({ route: 'cookie-policy/', label: 'Cookie Policy', container: 'acconsento-cookies-container' });

const notFound = {
  route: '404/',
  file: '404.html',
  render(ctx) {
    const body = `<section class="phero phero--center nf"><div class="wrap">${eyebrow('Pagina non trovata')}<h1 class="phero__title">Questa pagina non esiste.</h1><p class="phero__lead">Torna alla home o scopri la formazione.</p><div class="actions actions--center">${btn(ctx, { label: 'Home', to: '' })}${btn(ctx, { label: 'Scopri la formazione', to: 'academy/', variant: 'ghost' })}</div></div></section>`;
    return page(ctx, { title: 'Pagina non trovata | Élite Experience', description: 'Pagina non trovata.', noindex: true, body });
  },
};

export default () => [contatti, privacy, cookie, notFound];
