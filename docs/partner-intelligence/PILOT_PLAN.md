# AI DA FARE PARTNER INTELLIGENCE — PILOT PLAN

**Versione:** 1.0
**Stato:** DRAFT — in attesa di approvazione
**Obiettivo del pilot:** 500 studi **qualificati** (non 500 nominativi) su Lombardia, Lazio
e Puglia, con precision ≥ 90% sui campi principali e un TOP 50 pronto per l'outreach.

---

## 1. Definizione di "studio qualificato"

Un record conta nei 500 solo se soddisfa **tutte** queste condizioni:

1. è realmente uno studio di commercialisti / studio associato / STP / studio
   multidisciplinare con attività di consulenza (non CAF, non patronato, non agenzia);
2. ha una fonte primaria verificata (sito ufficiale) **oppure** — in assenza di sito — almeno
   due fonti indipendenti concordanti;
3. ha `partner_score` calcolato con `AI_DA_FARE_PARTNER_SCORE_V1` e `confidence_score ≥ 60`;
4. ha almeno un contatto professionale pubblico (email, telefono o form);
5. ha `partner_class` assegnata e non è `EXCLUDE`;
6. ha `ai_generated_summary` compilato se `partner_score ≥ 60`.

Un record in classe `REVIEW` non risolta **non conta** nei 500. Questo è il punto in cui
"qualità > quantità" diventa una regola di conteggio e non uno slogan.

---

## 2. Fasi (gate sequenziali)

```
FASE 0  DOCUMENTAZIONE  ────────────────────▶ ⏸ APPROVAZIONE  ← siamo qui
FASE 1  SETUP INFRASTRUTTURA (DB, schema, config, cost ledger)
FASE 2  TEST 20 STUDI    ────────────────────▶ ⏸ GATE 1
FASE 3  TEST 100 STUDI   ────────────────────▶ ⏸ GATE 2
FASE 4  PILOT 500 STUDI  ────────────────────▶ ⏸ GATE 3
FASE 5  HUMAN QA (100 record) + KPI
FASE 6  EXPORT + TOP 50 + BUSINESS VALIDATION
```

Ogni gate è un **punto di arresto reale**: se i criteri non sono soddisfatti, non si passa
alla fase successiva, si corregge e si ripete la fase corrente.

---

## 3. FASE 1 — Setup infrastruttura

| Attività | Output |
|---|---|
| Migrazione schema PostgreSQL | `db/migrations/0001_initial.sql` applicata |
| Popolamento `score_versions` | Riga `AI_DA_FARE_PARTNER_SCORE_V1` con pesi e regole in JSONB |
| Config keyword set | `config/keywords/COMMERCIALISTA_B2B_V1.yaml` congelato |
| Config territori | `config/territories/pilot_lom_laz_pug.yaml` |
| Lookup ISTAT comune→provincia→regione | `config/geo/istat_comuni.csv` |
| JSON Schema dei task AI | `src/.../schemas/*.py` + `.json` |
| Prompt versionati | `prompts/*.v1.md` |
| Cost ledger | `cost_events` funzionante, verificato su run di prova |
| Guard rail compliance | robots parser, substring check email, suppression list |
| Regression set | 20 studi annotati a mano in `tests/golden/` |

**Nota sul regression set:** va costruito **prima** del test da 20, a mano, scegliendo studi
noti e diversificati (1 STP grande, 1 studio individuale su privati, 1 studio con finanza
agevolata, 1 senza sito, ecc.). Serve a rispondere alla domanda "il modello sbaglia?" prima
di avere volumi.

**Durata stimata:** 5–8 giorni lavorativi.

---

## 4. FASE 2 — TEST 20 STUDI

**Composizione:** 10 Lombardia · 5 Lazio · 5 Puglia.

**Selezione:** discovery limitata a 3 territori (Milano, Roma, Bari), keyword set completo,
poi selezione dei primi 20 candidati dedupati — **senza cherry-picking**. Il test deve
misurare la pipeline, non le sue condizioni migliori.

**Cosa si analizza (non solo "funziona"):**

| Domanda | Come si risponde |
|---|---|
| La discovery trova studi veri? | % candidati che superano il gate di qualificazione |
| Il crawler prende le pagine giuste? | Distribuzione dei `page_type` raccolti per dominio |
| Quante pagine servono davvero? | Media pagine utili / pagine scaricate |
| I segnali AI hanno evidenza? | % segnali con `evidence IS NOT NULL` |
| Lo schema regge? | % `validation_ok` in `enrichment_runs` |
| I costi reali quanto distano dalle stime? | `cost_events` vs `APIFY_PLAN.md` §5 |
| Lo scoring discrimina? | Distribuzione degli score: se sono tutti fra 60 e 70, il modello non separa |
| I summary sono utilizzabili? | Lettura umana di tutti e 20 |

**Verifica manuale: 20 record su 20** (100%). A questo volume la revisione integrale costa
poco e insegna moltissimo.

### GATE 1 — criteri di passaggio

| Criterio | Soglia |
|---|---|
| Discovery precision (sono davvero studi) | ≥ 80% |
| Website match rate (dominio corretto) | ≥ 90% |
| Validazione JSON Schema al primo tentativo | ≥ 90% |
| Segnali AI con evidenza | ≥ 85% |
| Nessun contatto inventato / email inferita | **0 casi** (bloccante assoluto) |
| Nessuna violazione robots/ToS registrata | **0 casi** (bloccante assoluto) |
| Costo per record entro | 2× la stima |
| Score distribution con deviazione standard | ≥ 10 punti |

**Se GATE 1 fallisce:** si corregge (keyword set, priority list, prompt, soglie) e si
ripete il test da 20 su territori diversi. Non si "passa comunque".

---

## 5. FASE 3 — TEST 100 STUDI

**Composizione:** 45 Lombardia · 35 Lazio · 20 Puglia (proporzioni del pilot).

**Novità rispetto al test da 20:**
- si attiva la deduplica su volume reale (i duplicati emergono solo con volumi);
- si misura il **funnel completo** discovery → candidati → crawlati → qualificati;
- si misura la distribuzione delle classi (quanti ELITE/HOT emergono davvero);
- si testa il re-run: rilanciare la pipeline sugli stessi 100 non deve duplicare nulla né
  produrre nuove chiamate AI (idempotenza).

**Verifica manuale: 30 record** stratificati (10 ELITE/HOT, 10 A/B, 5 REVIEW, 5 EXCLUDE).
La verifica sugli EXCLUDE è tanto importante quanto quella sugli ELITE: serve a scoprire i
**falsi negativi**, cioè gli studi buoni scartati per errore, che sono il danno più costoso
e il più invisibile.

### GATE 2 — criteri di passaggio

| Criterio | Soglia |
|---|---|
| Discovery precision | ≥ 85% |
| Website match rate | ≥ 92% |
| Contact accuracy | ≥ 90% |
| Service extraction accuracy | ≥ 85% |
| Accordo umano su `partner_class` (± 1 classe) | ≥ 80% |
| Falsi negativi negli EXCLUDE | ≤ 10% |
| Hot Partner Yield (score ≥ 80) | 10–30% (fuori range ⇒ ricalibrare, non procedere) |
| Duplicati residui dopo dedup | ≤ 3% |
| Idempotenza del re-run | 0 duplicati, 0 nuove chiamate AI su contenuto invariato |
| Costo per record ELITE/HOT | ≤ 1,50 € |

**Nota su Hot Partner Yield:** se il 60% dei record è HOT, il modello non discrimina (soglie
troppo basse). Se lo è il 2%, il targeting è troppo stretto o le soglie troppo alte. In
entrambi i casi si ricalibra **prima** di spendere sul pilot da 500.

---

## 6. FASE 4 — PILOT 500 STUDI

### 6.1 Funnel target

```
query eseguite                        ~450
risultati grezzi                      ~9.000-14.000
dopo pre-filtro lessicale (-45%)      ~5.000-7.700
dopo deduplica (-73%)                 ~1.300-2.000   ← "1.000-1.500 candidati"
dopo gate di qualificazione (-45%)    ~750-1.100     ← studi crawlati e arricchiti
dopo exclusion + REVIEW non risolte   ~500-650
────────────────────────────────────────────────
MASTER DATABASE QUALIFICATO           500 ✔
```

### 6.2 Distribuzione geografica indicativa

| Regione | Target | Tolleranza |
|---|---:|---|
| Lombardia | 225 | ± 15% |
| Lazio | 175 | ± 15% |
| Puglia | 100 | ± 15% |

**Regola esplicita: le quote non si forzano.** Se la Puglia produce 78 studi qualificati di
qualità e portarla a 100 richiede di includere record `REVIEW` o classe C, si consegnano 78.
Il conteggio finale può quindi essere 478 o 520: il numero 500 è un obiettivo di
dimensionamento, non un vincolo contrattuale sulla qualità. La deviazione va documentata.

### 6.3 Distribuzione attesa per classe (ipotesi da validare al GATE 2)

| Classe | Attesa | Nota |
|---|---:|---|
| ELITE (90–100) | 10–25 | Se sono più di 50, le soglie sono troppo generose |
| HOT (80–89) | 60–100 | |
| A (70–79) | 100–140 | |
| B (60–69) | 130–170 | |
| C (< 60) | 100–150 | Restano a DB, nessun outreach |
| REVIEW | ≤ 60 | Da risolvere o escludere dal conteggio |

### GATE 3 — criteri di consegna

| Criterio | Soglia |
|---|---|
| Record qualificati | ≥ 450 (500 target) |
| Precision sui campi principali (QA 100) | **≥ 90%** |
| Copertura contatto (almeno un contatto pubblico) | ≥ 95% |
| Decision maker identificato su ELITE/HOT | ≥ 70% |
| Export CSV/XLSX/JSON generati e verificati | ✔ |
| TOP 50 prodotto e rivisto a mano | ✔ |
| Metriche di costo complete | ✔ |

---

## 7. FASE 5 — HUMAN QA

### 7.1 Campionamento

**100 record**, stratificati per non guardare solo dove è facile:

| Strato | Numerosità | Motivo |
|---|---:|---|
| ELITE | tutti (max 20) | Sono quelli che finiscono in outreach: errore = danno diretto |
| HOT | 25 | Idem |
| A | 20 | Verifica della soglia 70/80 |
| B / C | 15 | Verifica dei falsi negativi |
| REVIEW | 10 | Verifica che siano davvero ambigui |
| EXCLUDE | 10 | **Verifica dei falsi negativi**: studi buoni scartati |
| **Totale** | **100** | |

Distribuzione geografica proporzionale (45 LOM / 35 LAZ / 20 PUG). La Puglia, come indicato
nel brief, è il territorio elettivo per il controllo manuale approfondito: volumi gestibili
e mercato meno saturo, quindi errori più visibili.

### 7.2 Campi verificati per ogni record

| # | Campo | Verifica |
|---|---|---|
| 1 | Studio corretto | È davvero uno studio di commercialisti? |
| 2 | Sito corretto | Il dominio appartiene a **questo** studio? |
| 3 | Contatto corretto | Email/telefono funzionanti e pubblici? |
| 4 | Team stimato | Il numero rilevato è plausibile rispetto al sito? |
| 5 | Servizi | I servizi estratti sono presenti sul sito? |
| 6 | Scoring | La classe è ragionevole per un occhio umano? |
| 7 | Commercial summary | È accurato, utile e privo di invenzioni? |

Verdetto per campo: `CORRECT` / `INCORRECT` / `PARTIAL` / `UNVERIFIABLE`, con
`corrected_value` quando applicabile. Tutto scritto in `reviews`.

### 7.3 Precision rate

```
precision(campo) = CORRECT / (CORRECT + INCORRECT + PARTIAL)
```

`UNVERIFIABLE` esclusi dal denominatore, ma tracciati: se superano il 10% su un campo, il
problema è la verificabilità della fonte, non l'accuratezza dell'AI.

**Obiettivo: ≥ 90% sui campi principali** (1, 2, 3, 5). I campi 4, 6 e 7 sono valutativi e
hanno soglia più bassa (≥ 80%), perché l'accordo umano-umano su una stima di team o su una
classe commerciale non è mai del 100%.

**Se la precision è < 90%:** non si consegna il database come "qualificato". Si isolano i
campi problematici, si corregge (prompt, estrattore, soglie), si ricalcola e si ri-campiona
su 50 record nuovi.

---

## 8. KPI di validazione

| KPI | Definizione | Target pilot |
|---|---|---|
| **Discovery Precision** | % record realmente studi di commercialisti | ≥ 85% |
| **Website Match Rate** | % dominio corretto | ≥ 92% |
| **Contact Accuracy** | % contatti corretti e raggiungibili | ≥ 90% |
| **Service Extraction Accuracy** | % servizi estratti effettivamente presenti | ≥ 85% |
| **Partner Score Accuracy** | accordo umano vs AI su `partner_class` (± 1 classe) | ≥ 80% |
| **Hot Partner Yield** | % studi con score ≥ 80 | 12–25% |
| **Cost per Qualified Record** | costo totale / record qualificati | ≤ 0,40 € |
| **Cost per ELITE/HOT** | costo totale / record ELITE+HOT | ≤ 1,50 € |
| **Contact Coverage** | % record con ≥ 1 contatto pubblico | ≥ 95% |
| **DM Identification Rate** | % ELITE/HOT con decision maker identificato | ≥ 70% |
| **Dedup Residual** | % duplicati residui | ≤ 3% |
| **Valid Site Rate** | % candidati con sito raggiungibile e utile | misura, no target |
| **Discard Rate** | % record scartati sul totale grezzo | misura, no target |
| **Avg Pages per Firm** | pagine scaricate / studi crawlati | 8–12 |
| **Avg Tokens per Firm** | token totali / studi arricchiti | ≤ 18.000 in |

Tutti i KPI sono query SQL versionate in `db/views/kpi_*.sql`: si ricalcolano, non si
riscrivono a mano.

---

## 9. FASE 6 — Export e business validation

### 9.1 Export

| Output | Contenuto | Formati |
|---|---|---|
| MASTER DATABASE | tutti i qualificati | CSV, XLSX, JSON |
| Vista ELITE | `partner_class = 'ELITE'` | CSV, XLSX |
| Vista HOT | `partner_class = 'HOT'` | CSV, XLSX |
| Vista A | `partner_class = 'A'` | CSV, XLSX |
| Vista REVIEW | ambigui, da risolvere | XLSX (per lavorazione manuale) |
| Vista EXCLUDE | esclusi + motivo | CSV |
| **TOP 50** | export commerciale | XLSX + PDF one-pager per studio (opzionale) |
| Bitrix-ready | proiezione §21 del brief | CSV/XLSX |

Ogni export scrive una riga in `exports` con `firm_ids`, filtro e `score_version`: si sa
sempre cosa è uscito e quando.

### 9.2 TOP 50 e outreach

Selezione: `v_top50` (ELITE/HOT con `confidence_score ≥ 75`), **rivista a mano** prima della
consegna. Il TOP 50 è il vero test del progetto: se il database è buono, si vede qui.

Ciclo da misurare:

```
50 studi → outreach → response → meeting → partner → opportunità
```

`outreach_status` (`not_contacted`, `contacted`, `replied`, `meeting`, `interested`,
`partner`, `rejected`) **vive inizialmente solo nel CRM**, come indicato nel brief. Il campo
è predisposto in `firms` per un futuro write-back, ma non è alimentato dalla pipeline.

**Metriche di business da raccogliere** (fuori dalla pipeline, ma pianificate):
tasso di risposta, tasso di meeting, tempo medio al primo meeting, correlazione fra
`partner_class` e tasso di risposta. Quest'ultima è ciò che dirà se lo scoring V1 vale.

### 9.3 CRM

**Regola invariante: nessuna sincronizzazione automatica dell'intero database.**
Solo ELITE, HOT ed eventuali A selezionati, su azione esplicita di un operatore. Il database
di intelligence resta separato dal CRM, perché hanno funzioni diverse: il CRM gestisce
relazioni attive, il database gestisce conoscenza di mercato. Mescolarli degrada entrambi.

---

## 10. Timeline indicativa

| Settimana | Attività |
|---|---|
| S0 | Revisione e approvazione documentazione (questa fase) |
| S1 | FASE 1 — setup infrastruttura, schema, config, guard rail |
| S1–S2 | Regression set + implementazione stage 1–5 |
| S2 | Implementazione stage 6–8 (AI, scoring, quality) |
| S2 | **TEST 20** + GATE 1 |
| S3 | Correzioni + **TEST 100** + GATE 2 |
| S4 | **PILOT 500** (esecuzione + monitoraggio) |
| S5 | HUMAN QA 100 record + calcolo KPI + GATE 3 |
| S5–S6 | Export, TOP 50, consegna, retrospettiva |

Totale indicativo: **5–6 settimane**, con i gate come principale fonte di variabilità.
Un GATE 1 fallito costa ~3 giorni; un GATE 2 fallito costa ~1 settimana. È denaro ben speso:
un pilot da 500 record costruito su un modello non calibrato va rifatto integralmente.

---

## 11. Budget indicativo

| Voce | Stima |
|---|---:|
| Apify (piattaforma + consumo, periodo pilot) | ~100–150 € |
| Consumo Apify (discovery + crawl) | ~55 € |
| AI enrichment | ~82 € |
| Hosting DB (periodo pilot) | ~30 € |
| **Totale infrastrutturale** | **~270–320 €** |
| Effort umano (sviluppo + QA) | da stimare internamente |

> Le voci Apify e AI sono stime da confermare con il test da 20 (vedi `APIFY_PLAN.md` §5).
> Il costo infrastrutturale non è il vincolo del progetto: l'effort di sviluppo e di QA lo è.

---

## 12. Rischi del pilot

| Rischio | P | I | Mitigazione |
|---|---|---|---|
| Discovery restituisce troppi non-studi | Media | Alto | Pre-filtro lessicale gratuito + gate prima dell'AI; GATE 1 lo intercetta su 20 record |
| Modello di scoring non discrimina | Media | Alto | Regression set + GATE 2 su Hot Partner Yield; ricalibrazione prima dei 500 |
| Precision < 90% alla QA | Media | Alto | QA anticipata (20 → 30 → 100 record): il problema emerge presto e costa poco |
| Molti studi senza sito | Alta | Medio | `LOW_DATA_CONFIDENCE` previsto; non si escludono, si segnalano |
| Quote geografiche non raggiunte | Media | Basso | Regola esplicita: non forzare le quote, documentare la deviazione |
| Costi AI sopra stima | Bassa | Medio | Budget cap con kill-switch; troncamento per priorità di pagina |
| Actor Apify instabile | Media | Medio | Adapter con contratto stabile + Actor alternativo identificato |
| Siti che bloccano il crawling | Media | Basso | Rispetto integrale, record valutato sui dati disponibili |
| Allucinazioni AI nei summary | Media | **Alto** | `evidence` obbligatoria, JSON Schema, QA sul campo 7, summary solo sopra soglia |
| Aspettativa "500 nominativi" vs "500 qualificati" | Media | Alto | Definizione al §1 concordata **prima** dell'esecuzione |

Il rischio più insidioso è l'ultimo: se il pilot viene giudicato sul numero anziché sulla
qualità, tutte le scelte architetturali di questo progetto perdono senso.

---

## 13. Assunzioni

1. Esiste un numero sufficiente di studi con presenza digitale nelle 3 regioni per produrre
   500 record qualificati. **Da verificare al GATE 2** — è l'assunzione più forte del piano.
2. I contenuti dei siti degli studi sono sufficientemente informativi da consentire
   l'estrazione dei segnali (in particolare `works_with_pmi`).
3. Il pricing di Apify e del provider AI resta nell'ordine di grandezza stimato.
4. È disponibile una persona per la QA di 100 record (stima: 3–5 minuti/record ⇒ 5–8 ore).
5. Il legittimo interesse è la base giuridica adeguata — **da confermare con il DPO**.
6. Bitrix24 è il CRM di destinazione, ma l'integrazione è fuori dallo scope del pilot.
7. Le keyword italiane della `SCORING_MODEL` keyword matrix coprono il lessico
   effettivamente usato dagli studi (da validare sul test da 20).

---

## 14. Domande aperte per l'approvazione

1. **Provider AI:** si conferma Anthropic come provider iniziale (con abstraction layer per
   un futuro secondo provider)?
2. **Hosting DB:** PostgreSQL gestito o Supabase? (raccomandazione: Postgres gestito con
   schema portabile, vedi `ARCHITECTURE.md` §4)
3. **UI di review:** nel pilot è sufficiente un foglio XLSX per la QA dei 100 record, o
   serve un'interfaccia web minimale? (raccomandazione: XLSX nel pilot, UI in fase 2)
4. **Soglia dei 500:** si conferma che un risultato di 470–480 record realmente qualificati
   è preferibile a 500 con dentro 30 record deboli?
5. **DPO / consulente privacy:** chi valida `DATA_COMPLIANCE.md` e con che tempi?
6. **Informativa e pagina bot:** chi le pubblica sul sito AI DA FARE, e entro quando?
7. **TOP 50:** l'outreach è gestito da Grace? Con quale strumento si tracciano le risposte
   per poter poi correlare `partner_class` e tasso di risposta?

---

## 15. Cosa consegna il pilot

1. **Database proprietario** di ~500 studi qualificati, con provenienza tracciata e
   score spiegabile.
2. **Un modello di qualificazione calibrato** (`SCORE_V1`, con dati per costruire V2).
3. **Una pipeline riutilizzabile ed estendibile** a tutte le regioni italiane, per
   configurazione e non per riscrittura.
4. **Metriche di costo reali** per decidere se e come scalare.
5. **Un TOP 50 pronto per l'outreach**, cioè la prova che l'asset produce valore commerciale
   e non solo righe in una tabella.

Il pilot ha successo se, alla fine, si può rispondere con dati alla domanda:
**"quanto costa generare uno studio partner-ready, e quanti ce ne sono in Italia?"**
