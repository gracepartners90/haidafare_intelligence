# Élite Experience — Concept homepage

Anteprima front-end navigabile della possibile evoluzione del sito Élite Experience,
pensata per la presentazione interna a management e team.

La homepage racconta il passaggio di posizionamento:

> **da** catalogo di rituali e videocorsi
> **a** metodo professionale per costruire e sviluppare servizi Hair Spa nel salone.

---

## Avvio

Progetto statico: HTML + CSS + JavaScript vanilla, nessuna dipendenza, nessuna build.

```bash
cd elite-experience
npx http-server -p 4173 -c-1     # oppure: npx serve .
# → http://localhost:4173
```

Usare un server che supporti le richieste HTTP Range (`http-server`, `serve`, qualsiasi
hosting statico). Con `python -m http.server` il video si riproduce ma non permette di
spostarsi sulla timeline.

Aprire `index.html` direttamente dal file system funziona per una consultazione rapida.

---

## Struttura

```
elite-experience/
├── index.html              Markup semantico delle 10 sezioni
├── css/style.css           Token, componenti, sezioni, motion, responsive
├── js/main.js              Header, menu mobile, reveal, rituali, player video
└── assets/
    ├── images/             Fotografia editoriale (hero, rituali, formazione, ritratto)
    ├── training/           Frame estratti dal video dei videocorsi
    ├── video/              Video "Il metodo, in pratica"
    └── fonts/              Inter Tight + Newsreader (variabili, self-hosted, SIL OFL)
```

### Sezioni

| # | Sezione | Ancora | Layout |
|---|---|---|---|
| 01 | Hero | `#top` | Testata editoriale, headline a tutta larghezza, fotografia al vivo |
| 02 | Manifesto | `#manifesto` | Solo tipografia serif, due righe sfalsate |
| 03 | Cosa cambia nel salone | `#salone` | Composizione a quadranti attorno al salone, microtesti "da → a" |
| 04 | Il metodo Élite | `#metodo` | Tabella editoriale fasi × ambito × esito |
| 05 | Il metodo, in pratica | `#pratica` | Player custom quasi a tutta pagina + foglio dei frame |
| 06 | Rituali + Élite Ritual Collection | `#rituali` | Indice dei moduli con immagine sticky; Collection come percorso |
| 07 | Formazione | `#formazione` | Online / In presenza sfalsate; "Nel tuo salone" a tutta larghezza |
| 08 | Elisabetta Tancini | `#about` | Ritratto + ruoli + principio |
| 09 | CTA finale | `#contatti` | Headline serif, CTA sobria |
| 10 | Footer | — | Essenziale, wordmark grande |

---

## Sostituire immagini e video

Tutti i file in `assets/images` e `assets/training` sono **segnaposto strutturati**: una
superficie tonale con grana, segni di taglio e la nota di art direction dello scatto.
Per inserire il materiale reale basta **sovrascrivere il file con lo stesso nome**: il
layout non va toccato, i ritagli sono gestiti con `object-fit: cover`.

| File | Formato consigliato | Soggetto |
|---|---|---|
| `images/hero.jpg` | 2400 × 1600 (3:2) | Macro: mani sul cuoio capelluto, luce laterale calda, vapore. Nessun volto. |
| `images/video-poster.jpg` | 1920 × 1080 | Frame d'apertura del video dei videocorsi |
| `training/frame-01.jpg` | 1920 × 1080 (16:9) | Close-up tecnico della manualità |
| `training/frame-02.jpg` | 1600 × 1200 (4:3) | Dettaglio mani: pressione e ritmo (riusato anche in "Formazione online") |
| `training/frame-03.jpg` | 1200 × 1600 (3:4) | Inquadratura del rituale: postura e sequenza |
| `training/frame-04.jpg` | 1200 × 1200 (1:1) | Crop molto ravvicinato del punto di contatto |
| `images/ritual-wellness.jpg` | 1600 × 2000 (4:5) | Acqua e mani al lavatesta |
| `images/ritual-pinda.jpg` | 1600 × 2000 (4:5) | Pinda in tessuto, calore e pressione |
| `images/ritual-brushing.jpg` | 1600 × 2000 (4:5) | Spazzola in fibra naturale tra i capelli |
| `images/ritual-hairgym.jpg` | 1600 × 2000 (4:5) | Manualità dinamiche, tendini delle mani |
| `images/ritual-relax-full.jpg` | 1600 × 2000 (4:5) | Mani che sostengono testa e collo |
| `images/training-presenza.jpg` | 1600 × 2000 (4:5) | La formatrice guida le mani del professionista |
| `images/training-salone.jpg` | 1600 × 2000 (4:5) | Il team in sede, durante la pratica |
| `images/elisabetta-tancini.jpg` | 1600 × 2000 (4:5) | Ritratto editoriale di Elisabetta al lavoro (non posa beauty) |

**Art direction:** poche immagini, molto ravvicinate. Tecnica, materia, ritualità,
professionalità. Toni caldi, ombre profonde, grana leggera. Da evitare: modelle
sorridenti, asciugamano in testa, candele, orchidee, pietre zen, estetica da spa hotel.

### Video

`assets/video/elite-training-preview.mp4` è un video segnaposto di 31 secondi (cartelli
dei capitoli). Va sostituito con il video reale dei videocorsi **con lo stesso nome**:

- formato: MP4, H.264, `yuv420p`, con `faststart` (es. `ffmpeg -i in.mov -c:v libx264 -crf 22 -pix_fmt yuv420p -movflags +faststart -c:a aac elite-training-preview.mp4`);
- la **durata** mostrata nel player viene letta automaticamente dal file;
- il poster è `assets/images/video-poster.jpg`;
- se il file manca, il player mostra lo stato "Video in arrivo" senza rompere il layout.

---

## Contenuti da validare con Élite Experience

Il copy del brief è usato alla lettera. I testi seguenti sono **proposte di concept** e
vanno confermati:

- micro-descrizioni e "focus" dei cinque rituali (sezione 06);
- microtesti "da → a" delle quattro dimensioni (sezione 03);
- riga "Esito per il salone" della tabella del metodo (sezione 04);
- timecode e didascalie dei frame (sezione 05): vanno allineati ai frame reali estratti;
- dettaglio delle fasi in "Formazione nel tuo salone" e i microtesti delle modalità (sezione 07);
- testo di supporto e principio "Prima applicato in salone. Poi insegnato." (sezione 08).

Link non ancora collegati (marcati `data-todo` nel markup): Élite & More, Academy,
Instagram, LinkedIn, CTA finale verso il form contatti.

---

## Sistema visivo

**Palette** (`:root` in `css/style.css`): espresso `#2B211D`, deep brown `#4A352D`,
brown `#725B4D`, taupe `#A58E80`, warm beige `#D8C7B8`, sand `#EAE1D6`, ivory `#F5F0EA`,
off-white `#FBF8F4`, charcoal `#1D1B1A`. Le sezioni usano le classi tema `t-ivory`,
`t-offwhite`, `t-sand`, `t-espresso`, `t-deep`, `t-charcoal`.

**Tipografia:** Inter Tight per struttura, titoli di sezione, testi e micro-label;
Newsreader per le affermazioni del metodo (manifesto, metodo, CTA), i nomi propri e la
numerazione delle fasi.

**Motion:** reveal per riga, fade e leggero assestamento delle immagini, linee che si
disegnano. Nessuno scroll hijacking, nessun parallax. Con `prefers-reduced-motion` le
animazioni sono disattivate.

**Responsive:** riferimento desktop 1440px, tablet 768–1024px, mobile 375–430px. Su
mobile: quadranti → sequenza, tabella del metodo → schede, rituali → rail con
scroll-snap, player in formato 4:5.

---

Font: Inter Tight e Newsreader, SIL Open Font License 1.1 (vedi `assets/fonts/`).
