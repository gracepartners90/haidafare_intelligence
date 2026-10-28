// Configurazione del sito. I valori null sono dati non ancora verificati:
// i componenti li mostrano come segnaposto riconoscibili ("da inserire").

export const site = {
  name: 'Élite Experience',
  definition: 'Élite Experience — Metodo e Formazione Hair Spa',
  url: 'https://elitexperience.it',
  academyUrl: 'https://academy.elitexperience.it/',
  locale: 'it',
  // Versione inglese: struttura prevista, vedi README (sezione "Versione inglese")
  locales: ['it'],
  founder: 'Elisabetta Tancini',
  city: 'Arona',
  contacts: {
    email: 'info@elitexperience.it',
    phone: '+39 379 377 8562',
    address: null, // indirizzo della sede di Arona
    vat: '02824540039',
  },
  social: {
    instagram: 'https://www.instagram.com/elite_experienceacademy/',
  },
  // Google Tag Manager: lo stesso contenitore del sito WordPress (Analytics, banner e informative di
  // Acconsento). Caricato solo nella versione pubblicata (npm run build:deploy), non nell'anteprima.
  gtm: 'GTM-TZ52ZFTG',
  // Moduli di contatto: URL dell'app web Google Apps Script che scrive le richieste nel foglio
  // «Lead - Élite Experience» (vedi integrations/google-sheets). Con null i moduli restano dimostrativi.
  forms: { endpoint: 'https://script.google.com/macros/s/AKfycbzwxyVLyQUvQQZghDDwS64mTz7sXNhoDEA8kGLw5Z0sAD7tXSbmm8bAisLl4vAeMUMbjg/exec' },
};

// Navigazione principale. `children` genera il sottomenu (Academy).
export const nav = [
  { label: 'Home', to: '' },
  { label: 'Il Metodo Élite', to: 'metodo-elite/' },
  { label: 'Elisabetta Tancini', to: 'elisabetta-tancini/' },
  {
    label: 'Academy',
    to: 'academy/',
    children: [
      { label: 'Panoramica Academy', to: 'academy/' },
      { label: 'Formazione Online', to: 'academy/formazione-online/' },
      { label: 'Formazione in Presenza', to: 'academy/formazione-in-presenza/' },
    ],
    courses: true, // aggiunge l'elenco delle schede corso
  },
  { label: 'Élite & More', to: 'elite-e-more/' },
  { label: 'Contatti', to: 'contatti/' },
];

export const headerCta = { label: 'Accedi in piattaforma', to: site.academyUrl, ext: true };
