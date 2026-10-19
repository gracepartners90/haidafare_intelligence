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
  jobTitle: 'Fondatrice di Élite Experience e formatrice Hair Spa',
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
