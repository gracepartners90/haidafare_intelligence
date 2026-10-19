# Élite Experience — Sito Metodo e Formazione Hair Spa

Prototipo navigabile del nuovo sito **elitexperience.it**: architettura dell'informazione,
UX/UI, testi, SEO tecnica e frontend. Il sito è generato da contenuti strutturati (JSON)
con un generatore statico in Node, senza dipendenze.

> Porta l'esperienza Hair Spa nel tuo salone.

Il prototipo **non inventa contenuti**: dove un dato non è ancora verificato (prezzi,
programmi, durate, contatti, testimonianze, partnership, articoli) mostra un segnaposto
riconoscibile. Le fotografie sono solo quelle ufficiali di Elisabetta Tancini fornite dal
brand; nessuna immagine sintetica la rappresenta.

---

## Avvio rapido

Serve Node 18 o superiore.

```bash
cd elite-experience-site
npm run build      # genera dist/ (sito multipagina) e dist/elite-experience-prototipo.html
npm run preview    # serve dist/ su http://localhost:4180
```

| Comando | Risultato |
| --- | --- |
| `npm run build` | Sito statico in `dist/` con link `…/index.html`, più il file unico di anteprima |
| `npm run build:deploy` | Sito statico con URL puliti (`/metodo-elite/`) per la pubblicazione |
| `npm run preview` | Server locale su `dist/` |

**Il sito multipagina va aperto tramite un server HTTP** (`npm run preview` o qualsiasi
hosting statico): aperto con doppio clic dal file system, il browser blocca i font.

**`dist/elite-experience-prototipo.html`** è invece un file unico autosufficiente (immagini,
font, stili e script incorporati, navigazione tra le 22 pagine con l'indirizzo `#/pagina`):
si apre con doppio clic e si può inviare per la revisione.

---

## Struttura

```
elite-experience-site/
├── build.mjs                 Generatore: pagine, sitemap.xml, robots.txt, file unico
├── src/
│   ├── config.js             Dati del sito, contatti, social, navigazione
│   ├── content/              CONTENUTI (si modificano qui)
│   │   ├── courses.json      Schede corso, Élite Ritual Collection, FAQ
│   │   ├── media.json        Registro delle fotografie ufficiali con testi alternativi
│   │   ├── practice.json     Sequenza "Il metodo, in pratica"
│   │   └── editorial.json    Élite & More (articoli), collaborazioni, eventi
│   ├── components/           Componenti riutilizzabili (HTML generato da funzioni)
│   │   ├── core.js           Titoli, pulsanti, immagini, segnaposto, video, FAQ, form
│   │   ├── layout.js         Header, menu, footer, <head> con metadati SEO
│   │   ├── course.js         Card corso, livello, prezzo, promozione, collezione
│   │   ├── editorial.js      Anteprime degli articoli di Élite & More
│   │   ├── practice.js       Sequenza cinematografica a capitoli
│   │   └── seo.js            Dati strutturati JSON-LD
│   ├── pages/                Una funzione per pagina (course.js = modello unico delle schede)
│   ├── styles/               tokens · base · layout · components · sections
│   ├── scripts/site.js       Interazioni (menu, video, sequenza, tab, form)
│   └── assets/               brand/ (logo), media/ (foto), fonts/ (Newsreader, Inter Tight)
└── dist/                     Output generato
```

### Pagine

| Pagina | Percorso |
| --- | --- |
| Home | `/` |
| Il Metodo Élite | `/metodo-elite/` |
| Elisabetta Tancini (con la sezione Collaborazioni) | `/elisabetta-tancini/`, `#collaborazioni` |
| Academy | `/academy/` |
| Formazione Online (catalogo) | `/academy/formazione-online/` |
| Schede corso (5, da un unico modello) | `/academy/formazione-online/<slug>/` |
| Formazione in Presenza | `/academy/formazione-in-presenza/` |
| Per i Saloni | `/per-i-saloni/` |
| Élite & More: archivio, categorie, esempio di articolo | `/elite-e-more/…` (stesso indirizzo del sito attuale) |
| Contatti (3 moduli) | `/contatti/` |
| Privacy, 404 | `/privacy/`, `/404.html` |

---

## Come si aggiornano i contenuti

Tutto il testo verificabile vive nei file di `src/content/` e in `src/config.js`. Dopo ogni
modifica: `npm run build`.

### Convenzioni dei dati

| Valore nel JSON | Cosa mostra il sito |
| --- | --- |
| `null` | Segnaposto tratteggiato "da inserire" (il dato manca) |
| `{ "text": "…", "verified": false }` | Il testo, marcato **bozza** finché non viene validato |
| `{ "text": "…", "verified": true }` | Il testo definitivo, senza marcatura |
| Stringa semplice | Testo definitivo |

Il pulsante **Note di lavorazione** in basso a sinistra accende e spegne la marcatura delle
bozze, per rivedere il sito con o senza le note. Nella versione per la pubblicazione
(`npm run build:deploy`) il pulsante e la marcatura non ci sono.

### Scheda corso (`courses.json`)

Ogni corso ha gli stessi campi; il modello `src/pages/course.js` li impagina sempre nelle
stesse sezioni: apertura del corso, cosa imparerai, tecniche e manualità, programma,
applicazione in salone, a chi è rivolto, come funziona, anteprima video, iscrizione, FAQ e
continua la formazione.

Campi principali: `name`, `level`, `shortDescription`, `fullDescription`, `heroImage`,
`gallery`, `video` (`{ "src": "video/…mp4", "poster": "chiaveMedia" }`), `competencies`,
`techniques`, `manualities`, `program`, `salonApplication`, `audience`, `prerequisites`,
`access`, `fruition`, `availability`, `materials`, `support`, `requirements`, `price`,
`promotion`, `purchaseUrl`, `pdf` (percorso in `assets/`, es. `docs/pinda-ritual.pdf`),
`faq`, `related`.

- **Prezzo**: confermati Wellness Ritual € 190 e gli altri rituali € 290. Con `price` a
  `null` il prezzo non viene mostrato e i dati strutturati del corso non dichiarano un'offerta.
- **Livello**: Wellness Ritual "Primi approcci", Pinda e Brushing "Medium", Hairgym "Base e
  Medium", Relax Full "Pro".
- **Promozione**: il banner compare solo con `"active": true` **e** condizioni compilate.
- **Acquisto**: `purchaseUrl` è il link diretto al corso sulla piattaforma
  academy.elitexperience.it; se manca, il pulsante porta alla home della piattaforma.

### Fotografie (`media.json`)

Ogni immagine si registra una volta con chiave, file, dimensioni e testo alternativo, poi si
richiama per chiave nelle pagine. I file vanno in `src/assets/media/`. Gli spazi ancora
senza fotografia mostrano un riquadro con il soggetto da fotografare.

- **Hero della home**: chiave `heroHome`. Per cambiare la foto basta sostituire il file
  indicato (orizzontale, almeno 2000 px di lato lungo) e aggiornare `w`, `h` e `alt`. Il
  filtro (viraggio nel colore del brand, grana, vignettatura) è applicato in pagina da
  `sections.css` (sezione "Home: hero"): il file della foto resta originale.
- **Immagini delle card dei corsi**: campo `cardImage` di ogni corso in `courses.json`
  (chiave della foto e inquadratura).
- `"provisional": true` segnala una foto provvisoria: con le note di lavorazione attive
  compare l'etichetta "Immagine provvisoria".

### Sequenza "Il metodo, in pratica" (`practice.json`)

Quattro capitoli (Tecnica, Manualità, Protocollo, Applicazione) che scorrono come un film
quando la sezione è visibile, con barra dei capitoli cliccabile e timecode. Ogni capitolo
indica l'immagine (`media`), l'inquadratura (`pos`) e l'ingrandimento (`zoom`). Quando
saranno disponibili i frame dei videocorsi, basta registrarli in `media.json` e
richiamarli qui; con `"video": "video/selezione.mp4"` il pulsante "Guarda la selezione
completa" riproduce il filmato. Con la riduzione del movimento attiva nel sistema la
sequenza resta ferma e si sfoglia con i capitoli.

### Video

I video si mettono in `src/assets/video/` e si collegano con il campo `src` (corsi) o
`video` (sequenza). Il riquadro video li riproduce in una finestra; senza file mostra quale
contenuto inserire. Nel file unico di anteprima i video non vengono incorporati.

---

## Contenuti da fornire

Il prototipo è completo nella struttura; questi dati servono per andare online.

**Brand e contatti** — email, telefono, indirizzo della sede di Arona, P. IVA, profili social,
riferimenti per la privacy policy e la cookie policy.

**Elisabetta Tancini** — biografia verificata, percorso professionale, citazione firmata,
eventuali riconoscimenti, altre fotografie ufficiali (anche verticali, di dettaglio, in aula).

**Corsi** — per ciascuno dei 5 rituali: nome ufficiale, descrizioni, competenze, tecniche e
manualità, programma per moduli, durata, modalità di accesso, materiali, requisiti, eventuale
promozione con condizioni, link di acquisto, scheda PDF, FAQ, immagini e un estratto video
autentico (prezzi e livelli sono già confermati). Composizione e prezzo della Élite Ritual
Collection.

**Formazione in presenza** — date, sede, durata, numero di partecipanti, condizioni per la
formazione nel salone.

**Per i Saloni e Collaborazioni** (sezione della pagina di Elisabetta) — servizi effettivamente attivi, stato delle collaborazioni
con Z.One e Maletti (oggi "da verificare"), loghi autorizzati, eventi documentati.

**Élite & More** — gli articoli già pubblicati su elitexperience.it/elite-e-more (titolo,
indirizzo, data, estratto, immagine di copertina): la home mostra automaticamente i 3 più
recenti. Si inseriscono in `editorial.json` → `journal.articles`.

Le testimonianze sono state tolte dal sito: si possono reintrodurre quando saranno
disponibili testimonianze reali con autorizzazione alla pubblicazione.

**Video** — estratti dei videocorsi, selezione completa per "Il metodo, in pratica", frame
per le anteprime.

---

## SEO

- Titolo, descrizione e URL canonico per ogni pagina; `hreflang` (it, x-default).
- Open Graph per la condivisione.
- Dati strutturati JSON-LD: EducationalOrganization, WebSite, Person (Elisabetta Tancini),
  Course (con Offer solo se il prezzo è confermato), BreadcrumbList.
- `sitemap.xml` e `robots.txt` generati; la pagina di esempio di Élite & More è `noindex`.
- Un solo H1 per pagina, gerarchia dei titoli coerente, testi alternativi su ogni immagine.

## Accessibilità

Link "salta al contenuto", menu e sottomenu con `aria-expanded`, tab dei contatti navigabili
da tastiera, FAQ con `<details>`, campi dei moduli con etichette ed errori annunciati,
contrasti AA sui colori del brand, rispetto di `prefers-reduced-motion`.

## Moduli

I tre moduli di contatto (formazione, presenza, collaborazioni) validano i campi ma **non
inviano dati**: nessuna integrazione CRM o servizio esterno è collegata. Il collegamento va
scelto e autorizzato prima della pubblicazione.

## Versione inglese

La struttura è predisposta (`locales` in `config.js`, `hreflang` nel `<head>`). Per
attivarla: aggiungere `'en'` a `locales`, tradurre i contenuti di `src/content/` in file
paralleli (es. `courses.en.json`) e generare le pagine sotto `/en/`. La pagina di
Elisabetta Tancini è la prima candidata alla traduzione.

## Pubblicazione

`npm run build:deploy` e caricare il contenuto di `dist/` su qualsiasi hosting statico
(Netlify, Vercel, Cloudflare Pages, server Apache/Nginx). Impostare `404.html` come pagina di
errore. Prima della pubblicazione: verificare `site.url` in `config.js` e compilare i dati
mancanti (i segnaposto "da inserire" restano visibili anche in questa versione).

## Crediti tipografici

Newsreader e Inter Tight, distribuiti con licenza SIL Open Font License (file in
`src/assets/fonts/`).
