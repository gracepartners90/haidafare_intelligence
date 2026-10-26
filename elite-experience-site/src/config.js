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
    vat: null,
  },
  social: {
    instagram: 'https://www.instagram.com/elite_experienceacademy/',
  },
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
