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
| `npm start` | Server dell'anteprima di revisione (`server.mjs`): nascosta ai motori di ricerca, con password se è impostata `PREVIEW_PASSWORD` |

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
│   │   ├── courses.json      Schede corso, Élite Ritual Collection
│   │   ├── faq.json          Domande frequenti divise per tema
│   │   ├── media.json        Registro delle fotografie ufficiali con testi alternativi
│   │   ├── practice.json     Sequenza "Il metodo, in pratica"
│   │   └── editorial.json    Élite & More (numero, rubriche, articoli), collaborazioni
│   ├── components/           Componenti riutilizzabili (HTML generato da funzioni)
│   │   ├── core.js           Titoli, pulsanti, immagini, segnaposto, video, FAQ, form
│   │   ├── layout.js         Header, menu, footer, <head> con metadati SEO
│   │   ├── blocks.js         Hero a tutto schermo, immagine e video a tutto schermo, galleria, firma
│   │   ├── course.js         Card corso, livello, prezzo, promozione, collezione
│   │   ├── editorial.js      Élite & More: il numero da sfogliare, registro, corpo articolo
│   │   ├── practice.js       Sequenza cinematografica a capitoli
│   │   └── seo.js            Dati strutturati JSON-LD
│   ├── pages/                Una funzione per pagina (course.js = modello unico delle schede)
│   ├── styles/               tokens · base · layout · components · sections · blocks · magazine
│   ├── scripts/site.js       Interazioni (menu, video, sequenza, foto in dissolvenza, schede, sfoglio, form)
│   └── assets/               brand/ (logo), media/ (foto), fonts/ (Newsreader, Inter Tight, Mrs Saint Delafield)
└── dist/                     Output generato
```

### Pagine

| Pagina | Percorso |
| --- | --- |
| Home | `/` |
| Il Metodo Élite | `/metodo-elite/` |
| Elisabetta Tancini (con la sezione Collaborazioni) | `/elisabetta-tancini/`, `#collaborazioni` |
| Academy (panoramica, «Da dove parte il tuo salone?») | `/academy/`, `#percorsi` |
| Formazione Online (i cinque rituali a confronto e la collezione) | `/academy/formazione-online/`, `#confronto`, `#collezione` |
| Schede corso (5, da un unico modello) | `/academy/formazione-online/<slug>/` |
| Formazione in Presenza | `/academy/formazione-in-presenza/` |
| Élite & More: il numero da sfogliare, archivio, rubriche, articoli | `/elite-e-more/…` (stesso indirizzo del sito attuale) |
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
stesse sezioni: apertura del corso (modalità, durata, prezzo, «Acquista ora»), cosa
imparerai, a chi è rivolto e informazioni pratiche, immagine a tutto schermo, iscrizione,
FAQ e continua la formazione.

Campi principali: `name`, `level`, `shortDescription` (la frase di «Cosa imparerai»),
`competencies` (le sei voci), `techniques` (le tre tecniche del confronto in Formazione online),
`mode`, `duration`, `heroImage`, `cardImage`, `sectionImage`, `video`
(`{ "src": "video/…mp4", "poster": "chiaveMedia" }`), `audience`, `prerequisites`,
`forExperienced` (per chi fa già Hair Spa), `access`,
`fruition`, `availability`, `support`, `requirements`, `price`, `vatIncluded`, `promotion`,
`purchaseUrl`, `faq`, `related`.

- **Prezzo**: confermati Wellness Ritual € 190 e gli altri rituali € 290, IVA inclusa
  (`vatIncluded`); Élite Ritual Collection € 1.200 IVA inclusa, scontata rispetto ai corsi
  singoli (il sito mostra in automatico, in evidenza, la somma dei corsi inclusi, € 1.350, e il
  risparmio, quando la somma è più alta). Con `price` a
  `null` il prezzo non viene mostrato e i dati strutturati del corso non dichiarano un'offerta.
- **Durata e modalità**: «Videolezione online», 1 h per tutti i corsi.
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
- **Immagine a tutto schermo della scheda corso**: campo `sectionImage`.
- **Loghi dei partner**: in `src/assets/partners/` (PNG con fondo trasparente), collegati in
  `editorial.json` → `collaborations.documented[].logo`.
- **Inquadratura su mobile**: `positionMobile` (pagine) o `posMobile` (sequenza) sposta il
  soggetto al centro quando lo schermo è stretto.
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

### Élite & More (`editorial.json` → `journal`)

Il magazine segue il modello «a numeri» di Rockstar Notes, sul marrone scuro del sito: un
**numero** (`issue`: numero, mese, sottotitolo) si sfoglia come una rivista — copertina con la
foto dell'articolo principale, sommario, un'apertura per ogni articolo (tre impaginazioni che
si alternano), pagina di fine — in orizzontale su desktop
(frecce, rotellina, tastiera ← → PagSu PagGiù, link del sommario) e come pila di pagine su
mobile o senza JavaScript. Sotto il numero: l'archivio a registro e le rubriche
(`categories`). Ogni articolo (`articles`) ha titolo, rubrica, data, minuti di lettura,
estratto, immagine e corpo (`body`: paragrafi `p`, titoletti `h2`, citazioni `quote`).

I tre articoli presenti sono **esempi** per l'anteprima (`"sample": true`): con le note di
lavorazione attive mostrano l'etichetta "Esempio" e le loro pagine sono `noindex`. Vanno
sostituiti con gli articoli reali prima della pubblicazione.

### Video

I video si mettono in `src/assets/video/` e si collegano con il campo `src` (corsi) o
`video` (sequenza). La sezione «Il gesto, in movimento» della home usa `fullVideo()` con
`loop: { webm, mp4 }`: il teaser (`video/elite-teaser-home.*`, 8 secondi, senza audio) scorre
muto in sottofondo quando la sezione è visibile, con il pulsante per metterlo in pausa; con la
riduzione del movimento attiva parte solo se lo si avvia. Il server dell'anteprima risponde
alle richieste parziali, necessarie a Safari per i video. Il riquadro video li riproduce in una finestra; senza file mostra quale
contenuto inserire. Nel file unico di anteprima i video non vengono incorporati.

---

## Contenuti da fornire

Il prototipo è completo nella struttura; questi dati servono per andare online.

**Brand e contatti** — email, telefono, indirizzo della sede di Arona, P. IVA, profili social,
riferimenti per la privacy policy e la cookie policy.

**Elisabetta Tancini** — eventuali riconoscimenti, altre fotografie ufficiali (anche verticali,
di dettaglio, in aula). Le due citazioni firmate (home e «La sua visione») sono approvate.

**Corsi** — per ciascuno dei 5 rituali: eventuale promozione con condizioni, link di acquisto
e un estratto video autentico (le foto di apertura e a tutto schermo sono inserite). Prezzi, durata, accesso illimitato, livelli, tecniche,
«Cosa imparerai», profilo consigliato, prerequisiti, requisiti tecnici e prezzo della Élite
Ritual Collection sono già compilati.

**Formazione in presenza** — durata e condizioni (sede Maison BB ad Arona, max 8
partecipanti, calendario da concordare e prezzo di 990 € IVA inclusa a persona sono già
indicati).

**Élite & More** — gli articoli reali (titolo, data, estratto, immagine, testo) al posto dei
tre esempi.

Le testimonianze sono state tolte dal sito: si possono reintrodurre quando saranno
disponibili testimonianze reali con autorizzazione alla pubblicazione.

**Video** — estratti dei videocorsi, selezione completa per "Il metodo, in pratica", frame per le anteprime.

---

## SEO

- Titolo, descrizione e URL canonico per ogni pagina; `hreflang` (it, x-default).
- Open Graph per la condivisione.
- Dati strutturati JSON-LD: EducationalOrganization, WebSite, Person (Elisabetta Tancini),
  Course (con Offer solo se il prezzo è confermato), FAQPage, Blog e BlogPosting (Élite &
  More), BreadcrumbList.
- `sitemap.xml` e `robots.txt` generati; gli articoli di esempio di Élite & More sono `noindex`.
- Un solo H1 per pagina, gerarchia dei titoli coerente, testi alternativi su ogni immagine.

## Accessibilità

Link "salta al contenuto", menu e sottomenu con `aria-expanded`, tab dei contatti e schede
online/in presenza navigabili da tastiera, sfoglio del magazine con pagine annunciate e
raggiungibili con Tab, FAQ con `<details>`, campi dei moduli con etichette ed errori annunciati,
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

## Anteprima di revisione (Railway)

L'anteprima online è un servizio Railway collegato al ramo di lavoro: a ogni push esegue
`npm run build` e `npm start` dalla cartella `elite-experience-site`. `server.mjs` serve `dist/`
senza dipendenze, risponde a `/healthz` per il controllo di salute e tiene l'anteprima
nascosta: intestazione `X-Robots-Tag: noindex` e `robots.txt` che esclude tutto. Con le
variabili `PREVIEW_PASSWORD` (e `PREVIEW_USER`, predefinito `elite`) chiede la password; senza
`PREVIEW_PASSWORD` resta accessibile a chi ha l'indirizzo. Le note di lavorazione sono attive
come nel file unico.

## Pubblicazione

`npm run build:deploy` e caricare il contenuto di `dist/` su qualsiasi hosting statico
(Netlify, Vercel, Cloudflare Pages, server Apache/Nginx). Impostare `404.html` come pagina di
errore. Prima della pubblicazione: verificare `site.url` in `config.js` e compilare i dati
mancanti (i segnaposto "da inserire" restano visibili anche in questa versione).

## Crediti tipografici

Newsreader, Inter Tight e Mrs Saint Delafield (la firma di Elisabetta nelle citazioni),
distribuiti con licenza SIL Open Font License (file in `src/assets/fonts/`).
