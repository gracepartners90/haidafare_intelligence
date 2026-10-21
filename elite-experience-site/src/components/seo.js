import { site } from '../config.js';

// Dati strutturati schema.org. I campi non verificati (prezzi, date) vengono omessi.

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${site.url}/#organization`,
  name: 'Élite Experience',
  description: 'Metodo e formazione Hair Spa ideati da Elisabetta Tancini.',
  url: site.url,
  logo: `${site.url}/assets/brand/logo-elite-experience.png`,
  founder: { '@id': `${site.url}/elisabetta-tancini/#person` },
  address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'IT' },
});

export const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Élite Experience',
  url: site.url,
  inLanguage: 'it-IT',
  publisher: { '@id': `${site.url}/#organization` },
});

export const person = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${site.url}/elisabetta-tancini/#person`,
  name: 'Elisabetta Tancini',
  jobTitle: 'Hair Spa Specialist e formatrice internazionale',
  description: 'Imprenditrice, Hair Spa Specialist e formatrice internazionale, fondatrice di Élite Experience e ideatrice del Metodo Élite.',
  worksFor: { '@id': `${site.url}/#organization` },
  image: `${site.url}/assets/media/elisabetta-ritratto.jpg`,
  url: `${site.url}/elisabetta-tancini/`,
});

export const course = (c) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: c.name,
  description: c.shortDescription ? c.shortDescription.text : undefined,
  url: `${site.url}/academy/formazione-online/${c.slug}/`,
  inLanguage: 'it-IT',
  provider: { '@id': `${site.url}/#organization` },
  hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
  ...(c.price != null ? { offers: { '@type': 'Offer', price: c.price, priceCurrency: 'EUR', url: c.purchaseUrl || site.academyUrl } } : {}),
});

export const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: `${site.url}/${it.to}` })),
});

// Solo le risposte confermate entrano nei dati strutturati
export const faqPage = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.filter((f) => f.a && f.verified !== false).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const blog = () => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${site.url}/elite-e-more/#blog`,
  name: 'Élite & More',
  description: 'Il magazine Hair Spa di Élite Experience.',
  url: `${site.url}/elite-e-more/`,
  inLanguage: 'it-IT',
  publisher: { '@id': `${site.url}/#organization` },
});

export const blogPosting = (a) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: a.title,
  description: a.excerpt,
  datePublished: a.date,
  inLanguage: 'it-IT',
  author: { '@type': 'Organization', name: 'Redazione Élite & More' },
  isPartOf: { '@id': `${site.url}/elite-e-more/#blog` },
  url: `${site.url}/elite-e-more/${a.slug}/`,
});
