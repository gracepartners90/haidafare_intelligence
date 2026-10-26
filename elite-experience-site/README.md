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
│   │   ├── media-elite-e-more.json  Immagini degli articoli importati da elitexperience.it
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
| Élite & More: il numero da sfogliare, archivio, rubriche | `/elite-e-more/…` (stesso indirizzo del sito attuale) |
| Articoli di Élite & More (23) | `/<slug>/`, alla radice come sul sito WordPress attuale |
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
  Nota: oggi la piattaforma Academy indica prezzi diversi (€ 290, € 390, collezione € 1.790);
  per scelta il sito mantiene per ora i propri, da allineare prima della pubblicazione.
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
richiamarli qui. Le foto hanno un filtro leggero e caldo, senza grana; non c'è un video
della selezione. Con la riduzione del movimento attiva nel sistema la sequenza resta
ferma e si sfoglia con i capitoli.

### Élite & More (`editorial.json` → `journal`)

Il magazine segue il modello «a numeri» di Rockstar Notes, sul marrone scuro del sito: un
**numero** (`issue`: numero, mese, sottotitolo) si sfoglia come una rivista — copertina con la
foto dell'articolo principale, sommario, un'apertura per ogni articolo (tre impaginazioni che
si alternano), pagina di fine — in orizzontale su desktop
(frecce, rotellina, tastiera ← → PagSu PagGiù, link del sommario) e come pila di pagine su
mobile o senza JavaScript. Sotto il numero: l'archivio a registro e le rubriche
(`categories`). Ogni articolo (`articles`) ha titolo, rubrica, data, minuti di lettura,
estratto, immagine e corpo (`body`: paragrafi `p`, titoletti `h2`/`h3`, elenchi `ul`/`ol`,
immagini `img`, citazioni `quote`; il testo è in `html` con grassetti, corsivi e link).

Il numero in edicola mostra i **6 articoli più recenti**; l'archivio e le rubriche li elencano
tutti. In fondo a ogni articolo, «Continua a leggere» propone 6 articoli, prima della stessa
rubrica.

**Articoli importati da elitexperience.it.** I 23 articoli del blog WordPress sono stati
importati con testo, grassetti, elenchi, immagini e data originali. Restano **allo stesso
indirizzo** (`elitexperience.it/<slug>/`), così i link già indicizzati continuano a
funzionare. Dettagli:

- i link interni al vecchio sito sono rimappati sulle pagine nuove (i nomi dei corsi portano
  alla loro scheda; `/about-us/` → Elisabetta Tancini; `/#rituali` → Formazione Online;
  `/#formazione` → Academy); nei dati sono scritti come `@percorso`;
- titolo SEO (`seoTitle`) e descrizione (`seoDescription`) vengono da Yoast; due descrizioni
  copiate da un altro articolo non sono state riprese;
- l'estratto è quello scritto su WordPress; se mancava, si usa la descrizione Yoast o la prima
  frase del testo (`leadFromBody`: in questo caso non si ripete in testa all'articolo);
- le rubriche sono state assegnate in fase di import (campo `category`): vanno verificate.

### Video

I video si mettono in `src/assets/video/` e si collegano con il campo `src` (corsi) o
`video` (sequenza). La sezione «Il gesto, in movimento» della home usa `fullVideo()` con
`loop: { webm, mp4 }`: il teaser (`video/elite-teaser-home.*`, 8 secondi, senza audio) scorre
muto in sottofondo quando la sezione è visibile, con il pulsante per metterlo in pausa; con la
riduzione del movimento attiva parte solo se lo si avvia. Allo stesso modo `videoBlock()` con
`loop` mostra in un riquadro il video della formazione nella pagina di Elisabetta
(`video/elisabetta-formazione.*`, 15 secondi, verticale, senza audio). Il server dell'anteprima risponde
alle richieste parziali, necessarie a Safari per i video. Il riquadro video li riproduce in una finestra; senza file mostra quale
contenuto inserire. Nel file unico di anteprima i video non vengono incorporati.

---

## Contenuti da fornire

Il prototipo è completo nella struttura; questi dati servono per andare online.

**Brand e contatti** — email, telefono, profilo Instagram e P. IVA sono già inseriti (la sede
non compare nel footer né nella pagina Contatti). Servono ancora i riferimenti per la privacy
policy e la cookie policy.

**Elisabetta Tancini** — eventuali riconoscimenti, altre fotografie ufficiali (anche verticali,
di dettaglio, in aula). Le due citazioni firmate (home e «La sua visione») sono approvate.

**Corsi** — per ciascuno dei 5 rituali: eventuale promozione con condizioni e un estratto
video autentico (i link di acquisto diretti alla piattaforma Academy sono inseriti) (le foto di apertura e a tutto schermo sono inserite). Prezzi, durata, accesso illimitato, livelli, tecniche,
«Cosa imparerai», profilo consigliato, prerequisiti, requisiti tecnici e prezzo della Élite
Ritual Collection sono già compilati.

**Formazione in presenza** — durata e condizioni (sede Maison BB ad Arona, max 8
partecipanti e calendario da concordare sono già indicati; per il costo il sito invita a
richiedere informazioni).

**Élite & More** — verifica delle rubriche assegnate ai 23 articoli importati; modalità di
pubblicazione dei nuovi articoli (il sito è statico: oggi un articolo si aggiunge in
`editorial.json`).

Le testimonianze sono state tolte dal sito: si possono reintrodurre quando saranno
disponibili testimonianze reali con autorizzazione alla pubblicazione.

**Video** — estratti dei videocorsi e frame per le anteprime.

---

## SEO

- Titolo, descrizione e URL canonico per ogni pagina; `hreflang` (it, x-default).
- Open Graph per la condivisione.
- Dati strutturati JSON-LD: EducationalOrganization, WebSite, Person (Elisabetta Tancini),
  Course (con Offer solo se il prezzo è confermato), FAQPage, Blog e BlogPosting (Élite &
  More), BreadcrumbList.
- `sitemap.xml` (con data di aggiornamento degli articoli) e `robots.txt` generati; gli articoli
  di Élite & More mantengono l'indirizzo del sito attuale.
- Titoli entro circa 60 caratteri e descrizioni entro 155; per gli articoli titolo e descrizione
  vengono da Yoast (il nome del magazine si aggiunge solo se c'è spazio).
- **Redirect 301** dai vecchi indirizzi WordPress che non esistono più (`/about-us/`,
  `/privacy-policy/`, `/cookie-policy/`, `/dati-aziendali/`, `/video-elite/`, categorie, tag,
  autori, feed): elenco in `src/content/redirects.json`. Il build genera `dist/_redirects`
  (Netlify, Cloudflare Pages) e `dist/.htaccess` (Apache); `server.mjs` li applica
  sull'anteprima. Con un altro hosting vanno riportati nella sua configurazione.
- Prima della pubblicazione: allineare i prezzi dei corsi con la piattaforma Academy (i dati
  strutturati dei corsi dichiarano il prezzo del sito), collegare Google Tag Manager/Analytics
  (presenti sul sito attuale) insieme al banner dei cookie, inviare la sitemap a Search Console.
- Un solo H1 per pagina, gerarchia dei titoli coerente, testi alternativi su ogni immagine.

## Accessibilità

Link "salta al contenuto", menu e sottomenu con `aria-expanded`, tab dei contatti e schede
online/in presenza navigabili da tastiera, sfoglio del magazine con pagine annunciate e
raggiungibili con Tab, FAQ con `<details>`, campi dei moduli con etichette ed errori annunciati,
contrasti AA sui colori del brand, rispetto di `prefers-reduced-motion`.

## Moduli

I tre moduli di contatto (formazione, presenza, collaborazioni) scrivono le richieste nel
foglio Google **«Lead - Élite Experience»**, scheda **«Richieste sito»**, tramite un piccolo
script Google Apps Script (`integrations/google-sheets/richieste-sito.gs`). Lo script può
anche inviare un avviso a info@elitexperience.it a ogni richiesta.

Finché `site.forms.endpoint` in `src/config.js` è `null`, i moduli validano i campi ma non
inviano nulla (nota «Prototipo» sotto il pulsante).

**Attivazione** (una volta, con l'account proprietario del foglio):
1. Nel foglio: *Estensioni → Apps Script*, incollare il contenuto di `richieste-sito.gs`, salvare.
2. *Esegui il deployment → Nuovo deployment → App web*; «Esegui come: Me», «Chi ha accesso:
   Chiunque»; autorizzare.
3. Copiare l'URL dell'app web (finisce con `/exec`) in `site.forms.endpoint` e ripubblicare.

Ogni richiesta diventa una riga con data, tipo di richiesta, nome, cognome, salone, città,
email, telefono, i campi propri del modulo, messaggio e pagina di provenienza; le colonne di
lavoro (chiamate, note, esito) restano per il team. Un campo invisibile blocca i bot; un valore
che inizia con `=` non diventa una formula. Nella privacy policy va indicato che i dati sono
conservati su Google Workspace/Drive.

## Versione inglese

Il sito è solo in italiano: il selettore di lingua nel footer è stato tolto. La struttura
resta predisposta (`locales` in `config.js`, `hreflang` nel `<head>`). Per attivarla: aggiungere `'en'` a `locales`, tradurre i contenuti di `src/content/` in file
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
