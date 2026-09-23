# Roadmap 2026/2027 — Grace & Partners × Luca Picchio Academy

Cruscotto interno (INTERNAL USE ONLY) per il coordinamento della roadmap di sviluppo
Luca Picchio Academy, ottobre 2026 – marzo 2027. Destinato esclusivamente al team Grace & Partners.

## Avvio in locale

Requisiti: Node.js 20+.

```bash
cd grace-lpa-roadmap
npm install
npm run dev        # sviluppo → http://localhost:5173
npm run build      # build di produzione in dist/ (typecheck incluso)
npm run preview    # anteprima della build → http://localhost:4173
```

La build usa `base: './'`: la cartella `dist/` può essere pubblicata su qualunque hosting statico o sottocartella.

## Stack

React 19 · TypeScript · Tailwind CSS 4 · Vite. Font self-hosted (Anton, Inter, JetBrains Mono via `@fontsource`), nessuna dipendenza da CDN.

## Struttura

```
src/
  data/roadmap.ts          Contenuti tipizzati: fasi, 8 progetti, pilastri, milestone, asset di brand
  lib/storage.ts           Stato operativo + persistenza localStorage (con validazione)
  lib/sharedStore.ts       Archivio condiviso (capability `db` dell’Artifact)
  lib/export.ts            Export JSON / CSV
  lib/dates.ts             Formattazione date e giorni alla scadenza
  hooks/useRoadmapState.ts Stato condiviso del cruscotto
  components/
    Header.tsx             Barra sticky, navigazione a sezioni, hero
    ProjectOverview.tsx    Overview + 4 card strategiche collegate ai progetti
    RoadmapTimeline.tsx    Ott 2026 → Nov 2026 → Gen 2027 → Mar 2027
    PhaseSection.tsx       Fase 01 / Fase 02 con schede operative a fisarmonica
    ProjectDashboard.tsx   KPI, scadenze, filtri, export, griglia progetti
    ProjectCard.tsx        Card editabile (stato, referente, scadenza, prossimo step, note)
    StatusSelector.tsx     Radio group dei 4 stati
    ProgressIndicator.tsx  KPI e barra di avanzamento complessiva
    Badges.tsx, Footer.tsx
```

Per modificare contenuti, priorità o scadenze iniziali intervenire solo su `src/data/roadmap.ts`.

## Persistenza

La pagina sceglie da sola dove salvare e lo dichiara sempre nel cruscotto:

- **Artifact claude.ai (archivio condiviso).** Pubblicata come Artifact con la capability `db`,
  stato, referente, note, prossimo step e scadenza sono salvati in un archivio condiviso
  (collezione `progetti`, un documento per progetto) e visibili in tempo reale a chi ha accesso
  alla pagina. In caso di modifiche simultanee sullo stesso progetto prevale l’ultima salvata.
- **In locale / hosting statico.** Senza runtime Artifact i dati restano **solo nel localStorage
  del browser corrente** (chiave `grace-lpa-roadmap:v1`) e **non sono condivisi**. Per allinearsi:
  *Esporta roadmap → JSON* e poi *Importa JSON* sull’altro browser.

## Versione Artifact (HTML unico)

```bash
npm run build:artifact   # → artifact/roadmap-lpa.html (JS e CSS inline, font da Google Fonts)
```

Il file va pubblicato come Artifact claude.ai con le capability `db` (archivio condiviso) e
`downloads` (export JSON/CSV). Aperto fuori da claude.ai, ripiega sul salvataggio locale.

## Brand — da completare

- **Logo:** non incluso. Copiare l’asset originale in `public/brand/` e impostare
  `BRAND.logoSrc` in `src/data/roadmap.ts` (es. `'brand/lpa-logo.svg'`). Fino ad allora l’header mostra uno spazio segnaposto.
- **Colore accent:** lucapicchio.it non era raggiungibile in fase di sviluppo, quindi palette e
  tipografia non sono state verificate sul sito. Il rosso `--color-accent` in `src/index.css` è un
  segnaposto: sostituirlo con il valore ufficiale del brand.
- **Isola:** il perimetro specifico è da integrare a cura del team Grace (segnalato nelle schede 02 e 07).
