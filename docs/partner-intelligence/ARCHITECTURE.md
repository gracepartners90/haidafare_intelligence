# AI DA FARE PARTNER INTELLIGENCE — ARCHITECTURE

**Versione:** 1.0 (documentazione pre-implementativa)
**Stato:** DRAFT — in attesa di approvazione
**Score version di riferimento:** `AI_DA_FARE_PARTNER_SCORE_V1`
**Data:** 2026-08

---

## 0. Domanda a cui il sistema deve rispondere

> Quali studi professionali italiani hanno la maggiore probabilità di diventare partner commerciali di AI DA FARE?

Ogni componente descritto in questo documento esiste solo se contribuisce a migliorare la
**qualità della selezione commerciale**. Non si costruisce un elenco di commercialisti: si
costruisce un asset proprietario di *market intelligence* con un criterio di priorità.

Corollario operativo (regola di progetto): **se un dato non aumenta la qualità della
selezione commerciale, non entra nella pipeline.** Ogni campo del data model deve poter
rispondere alla domanda "come cambia la decisione di contatto?". I campi che non superano
questo test sono marcati `informational` e non alimentano lo scoring.

---

## 1. Principi architetturali

| # | Principio | Implicazione tecnica |
|---|---|---|
| P1 | **Qualità > quantità** | Il pilot ottimizza la *precision*, non la *recall*. Gli scarti sono un output atteso, non un fallimento. |
| P2 | **Pipeline a stadi, non monolite** | Ogni fase è un processo separato, idempotente, ri-eseguibile in isolamento, con input/output persistiti su DB. |
| P3 | **Ogni dato ha una provenienza** | Nessun campo entra nel DB senza `source_url`, `data_origin`, `retrieval_date`. |
| P4 | **L'AI struttura, non inventa** | Output LLM solo via JSON Schema validato. Nessun campo AI senza `confidence` + `evidence`. Fallimento validazione ⇒ `REVIEW_REQUIRED`. |
| P5 | **Compliance-by-design** | I limiti legali sono vincoli di codice (allow/deny list, robots.txt, rate limit), non linee guida. |
| P6 | **Determinismo dello scoring** | Lo score è calcolato da codice deterministico su segnali; l'LLM produce i *segnali*, non il punteggio. |
| P7 | **CRM ≠ intelligence DB** | Il CRM riceve una proiezione selettiva e volontaria. La sincronizzazione non è mai automatica sull'intero DB. |
| P8 | **Storico immutabile** | Score, crawl e arricchimenti sono versionati. Nessun overwrite distruttivo. |
| P9 | **Costo misurato per record** | Ogni fase scrive il proprio costo. Il KPI finale è *cost per qualified record*, non costo totale. |
| P10 | **Human-in-the-loop obbligatorio** | Nessun record raggiunge lo stato `QUALIFIED` in classe ELITE/HOT senza possibilità di review umana. |

---

## 2. Vista d'insieme

```
                         ┌──────────────────────────────────────────┐
                         │           CONTROL PLANE                  │
                         │  run configs · quote geo · budget caps   │
                         │  kill-switch · cost ledger · metriche    │
                         └──────────────┬───────────────────────────┘
                                        │
   ┌───────────┐   ┌───────────┐   ┌────▼──────┐   ┌───────────┐   ┌───────────┐
   │  STAGE 1  │──▶│  STAGE 2  │──▶│  STAGE 3  │──▶│  STAGE 4  │──▶│  STAGE 5  │
   │ DISCOVERY │   │NORMALIZZA-│   │  DEDUP    │   │  CRAWL /  │   │  CONTENT  │
   │           │   │  ZIONE    │   │           │   │QUALIFICAT.│   │EXTRACTION │
   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
                                                                          │
   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌──────▼────┐
   │  STAGE10  │◀──│  STAGE 9  │◀──│  STAGE 8  │◀──│  STAGE 7  │◀──│  STAGE 6  │
   │  EXPORT / │   │  HUMAN    │   │  QUALITY  │   │  SCORING  │   │    AI     │
   │ CRM SYNC  │   │  REVIEW   │   │   CHECK   │   │           │   │ENRICHMENT │
   └───────────┘   └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

Ogni stage:
- legge dallo stato persistito su PostgreSQL (non da file intermedi volatili);
- scrive un record in `pipeline_runs` con `stage`, `status`, `cost`, `stats`;
- è **idempotente**: ri-eseguirlo sullo stesso input non duplica dati (upsert su chiave naturale);
- è **ripartibile**: può essere rilanciato solo sui record in `status = 'FAILED'` o `'PENDING'`.

---

## 3. Gli stage in dettaglio

### STAGE 1 — DISCOVERY
**Obiettivo:** produrre 1.000–1.500 candidati grezzi per le 3 regioni pilota.

**Fonti (in ordine di priorità):**
1. Google Maps / Google Business tramite Actor Apify consentito;
2. Google Search (SERP) tramite Actor Apify consentito;
3. directory professionali pubbliche;
4. ordini territoriali dei Dottori Commercialisti, **solo come verifica puntuale**, mai come sorgente di estrazione massiva.

**Input:** matrice `keyword_set × territorio` (vedi `APIFY_PLAN.md` §3).
**Output:** righe in `discovery_results` (raw, non deduplicate, non normalizzate).

**Non fa:** nessuna visita ai siti degli studi, nessuna chiamata LLM. La discovery è
volutamente "stupida" ed economica: il costo di qualificazione si spende solo dopo il dedup.

**Nota anti-pattern:** il sistema **non** effettua scraping massivo dell'Albo nazionale. La
discovery parte dalla *domanda commerciale* ("chi si presenta al mercato come consulente di
imprese?") e non dall'anagrafica ordinistica ("chi è iscritto?"). Questa è una scelta di
prodotto prima che legale: un iscritto all'Albo senza presenza commerciale non è un partner
candidato.

---

### STAGE 2 — NORMALIZZAZIONE
**Obiettivo:** rendere confrontabili i candidati grezzi.

Operazioni:
- normalizzazione ragione sociale (rimozione di forme legali ridondanti, uppercase folding, rimozione punteggiatura, gestione di `& associati`, `e associati`, `s.t.p.`, `stp`, `s.s.t.p.`, `associazione professionale`);
- estrazione e canonicalizzazione del dominio (`https://www.studio-x.it/servizi` ⇒ `studio-x.it`), rimozione di `www`, gestione domini parcheggiati e redirect;
- normalizzazione telefonica in E.164 (`+39...`), scarto dei numeri non plausibili;
- geocodifica amministrativa: comune ⇒ provincia (sigla) ⇒ regione, tramite tabella di lookup ISTAT interna (nessuna dipendenza da API a pagamento);
- normalizzazione indirizzo (via/piazza/corso, CAP, civico).

**Output:** `firm_candidates` con chiavi di deduplica pre-calcolate
(`domain_key`, `name_key`, `phone_key`, `address_key`).

---

### STAGE 3 — DEDUPLICAZIONE
**Obiettivo:** l'entità principale è **LO STUDIO**, non la sede né il singolo professionista.

Strategia a cascata (dalla più forte alla più debole):

| Livello | Chiave | Azione |
|---|---|---|
| D1 | `domain_key` identico | merge automatico (confidenza 0.98) |
| D2 | `phone_key` identico **e** provincia identica | merge automatico (0.92) |
| D3 | `name_key` fuzzy ≥ 0.90 **e** provincia identica | merge automatico (0.88) |
| D4 | `name_key` fuzzy 0.80–0.90 **e** stesso comune | coda `merge_review` |
| D5 | `address_key` identico **e** `name_key` fuzzy ≥ 0.70 | coda `merge_review` |
| D6 | overlap ≥ 2 professionisti fra due studi | coda `merge_review` |

Similarità: token-set ratio + Jaro-Winkler sul nome normalizzato; trigram index PostgreSQL
(`pg_trgm`) per il blocking, così il confronto è O(n·k) e non O(n²).

**Casi gestiti esplicitamente:**
- **sedi multiple** ⇒ una `firms` + N `locations`, `num_locations` derivato;
- **studio con più domini** ⇒ una `firms` + N righe in `firm_domains`, con `is_primary`;
- **stesso studio con brand diversi** (es. `Studio Rossi` + `Rossi Business Advisory`) ⇒ merge in review umana, `firm_aliases`;
- **STP + nome commerciale** ⇒ `legal_name` (STP) distinto da `firm_name` (commerciale);
- **professionista presente in più directory** ⇒ dedup su `(firm_id, last_name, first_name)` normalizzati.

**Regola d'oro:** un merge automatico è reversibile. Ogni merge scrive in `merge_events`
(`survivor_id`, `merged_id`, `rule`, `score`, `at`), e i record assorbiti restano in tabella
con `merged_into_firm_id` valorizzato. Non si cancella mai.

---

### STAGE 4 — CRAWL / QUALIFICATION
**Obiettivo:** verificare che il candidato sia davvero uno studio di commercialisti e
raccogliere la materia prima testuale.

Regole di crawling (vincolanti, vedi `DATA_COMPLIANCE.md` §5):
- **max 10–15 pagine per dominio** nel pilot (default 12; 15 solo se `priority_hint = high`);
- crawling **guidato**, mai indiscriminato: si segue una *priority list* di URL pattern;
- rispetto di `robots.txt` e `<meta name="robots">`, con fetch e cache del robots per dominio;
- rate limit: max 1 richiesta concorrente per dominio, ≥ 1,5 s di pausa fra richieste;
- User-Agent identificativo e onesto, con URL di contatto;
- timeout 20 s, max 3 redirect, nessun rendering JS se non necessario (fallback headless solo se il testo utile è < 400 caratteri);
- **stop immediato** su: login wall, CAPTCHA, `X-Robots-Tag: noindex`, HTTP 403/429 ripetuti.

**Priority list delle pagine** (ordine di visita):
1. homepage
2. chi siamo / lo studio / about
3. team / professionisti / persone / partner
4. servizi (indice)
5. consulenza aziendale / business advisory
6. finanza agevolata / bandi / incentivi
7. controllo di gestione
8. startup / innovazione / digitalizzazione
9. industria 4.0 / transizione 5.0
10. compliance / GDPR / privacy / ESG / cybersecurity
11. contatti
12. news / blog / approfondimenti (max 3 pagine, ordinate per data)

**Gate di qualificazione (hard filter):** un candidato prosegue solo se il dominio contiene
evidenza lessicale di attività di studio commercialista/tributarista/consulenza societaria.
Altrimenti `status = 'EXCLUDED'`, `exclusion_reason = 'NOT_A_FIRM'`. Questo gate protegge il
budget AI: **nessuna chiamata LLM su un candidato non qualificato.**

**Casi senza sito:** non si esclude automaticamente. Il record prosegue con
`data_confidence` ridotto e flag `LOW_DATA_CONFIDENCE` (vedi `SCORING_MODEL.md` §6).

---

### STAGE 5 — CONTENT EXTRACTION
**Obiettivo:** trasformare HTML in testo pulito e in *segnali deterministici*, prima di
coinvolgere l'LLM.

- boilerplate removal (nav, footer, cookie banner), estrazione del main content;
- estrazione contatti con regex + validazione: email pubbliche, telefoni, URL social, form;
- rilevazione strutturale: presenza di `/team`, `/blog`, `/news`, `/servizi`, numero di pagine servizi, data ultimo articolo;
- conteggio candidati professionisti dal markup della pagina team (heading, card, `schema.org/Person`);
- **keyword signal matrix**: matching deterministico di ~180 termini italiani mappati sui segnali AI DA FARE (es. `transizione 5.0`, `credito d'imposta`, `controllo di gestione`, `AI Act`, `whistleblowing`, `bilancio di sostenibilità`).

**Perché prima dell'LLM:** i segnali deterministici sono gratuiti, riproducibili e servono
da *evidence* per validare l'output AI. Se l'LLM afferma `offers_finanza_agevolata = true`
ma la keyword matrix non trova nulla e non c'è `evidence`, il campo viene declassato a
bassa confidenza. L'LLM aggiunge interpretazione, non sostituisce l'osservazione.

---

### STAGE 6 — AI ENRICHMENT
**Obiettivo:** dati strutturati e tipizzati da contenuto non strutturato.

- input: testo pulito delle pagine prioritarie (budget token per studio, vedi §8);
- output: **JSON validato da schema** (nessun testo libero che aggiorni il DB);
- ogni campo AI porta `{ value, confidence, evidence }` dove `evidence` è una citazione
  testuale breve + `source_url` della pagina che la contiene;
- retry limitato (max 2) su fallimento di validazione; poi `REVIEW_REQUIRED`;
- provider astratto (§6 di questo documento), modello e prompt versionati in
  `enrichment_runs.model_id` / `prompt_version`.

Task distinti (prompt separati, non un unico megaprompt):
1. `classify_firm` — è uno studio? che tipo? target?
2. `extract_services` — servizi primari/secondari, segnali AI DA FARE
3. `extract_team` — professionisti pubblici, ruoli, decision maker
4. `assess_maturity` — maturità digitale, capacità distributiva
5. `write_summary` — commercial summary + suggested approach (solo su record ≥ soglia)

Il task 5 gira **solo** sui record che superano una soglia di score, per non spendere
token su record di classe C.

---

### STAGE 7 — SCORING
Codice deterministico, nessun LLM. Input: segnali (deterministici + AI). Output:
`partner_score` 0–100, `partner_class`, `confidence_score`, `commercial_priority`,
più il **breakdown per componente** salvato in `scores.components` (JSONB) per la
spiegabilità. Versionato: `AI_DA_FARE_PARTNER_SCORE_V1`. Dettagli in `SCORING_MODEL.md`.

---

### STAGE 8 — QUALITY CHECK
Regole automatiche prima della review umana:
- coerenza geografica (provincia ∈ regione, CAP ∈ provincia);
- coerenza dimensionale (`num_professionals_detected` vs `estimated_team_size`);
- plausibilità contatti (dominio email == dominio sito, o giustificato);
- assenza di dati personali non professionali (pattern PEC personali, dati particolari);
- score outlier (score alto con `data_confidence` basso ⇒ forzato a `REVIEW`);
- **contraddizioni AI**: campo `true` senza `evidence` ⇒ declassamento.

Esito: `PASSED` / `REVIEW_REQUIRED` / `EXCLUDED`.

---

### STAGE 9 — HUMAN REVIEW
Campione di **100 record** nel pilot, stratificato per classe e regione (vedi
`PILOT_PLAN.md` §6). Interfaccia minima: vista tabellare + scheda record + form di
verifica campo-per-campo. Ogni verifica scrive in `reviews` con `reviewer`, `verdict`
per campo, `corrected_value`. Da qui si calcola la **precision rate**.

Le correzioni umane sono *ground truth*: alimentano la calibrazione di V2 dello scoring.

---

### STAGE 10 — EXPORT / CRM
- export `CSV`, `XLSX`, `JSON` del master DB e delle viste (ELITE / HOT / A / REVIEW / EXCLUDE);
- proiezione **Bitrix-ready** (campi in `DATA_MODEL.md` §9);
- sincronizzazione CRM **solo** per ELITE, HOT ed eventuali A selezionati, **su azione
  esplicita**, mai automatica sull'intero DB;
- ogni export registra in `exports` cosa è uscito, quando, con che filtro e che score version.

---

## 4. Stack tecnologico proposto

| Livello | Scelta | Motivazione |
|---|---|---|
| Database | **PostgreSQL 16** (Supabase o istanza gestita) | JSONB per payload AI, `pg_trgm` per fuzzy dedup, viste materializzate per le classi, row-level history. |
| Linguaggio pipeline | **Python 3.12** | Ecosistema dati maturo; `pydantic` per typed output; `httpx`, `selectolax`/`trafilatura` per estrazione. |
| Validazione | **Pydantic v2 + JSON Schema** | Lo schema è la fonte di verità condivisa fra prompt LLM e DB. |
| Discovery/Crawl | **Apify** (Actor gestiti) | Infrastruttura proxy/rotazione/retry già risolta, costi tracciabili per run. |
| Orchestrazione | CLI a stage + tabella `pipeline_runs`; scheduler cron | Nel pilot non serve Airflow/Prefect: la complessità va nella qualità dei dati, non nell'orchestratore. |
| Migrazioni | **Alembic** (o SQL versionato in `db/migrations/`) | Schema riproducibile. |
| Export | `pandas` + `openpyxl` | CSV/XLSX/JSON. |
| Segreti | variabili d'ambiente / secret manager | Nessuna chiave nel repository. |

**Nota su Supabase vs Postgres puro:** entrambi validi. Supabase aggiunge auth + API REST
già pronte per la futura UI di review, al costo di un vendor. Raccomandazione: **Postgres
gestito con schema portabile** (nessuna feature proprietaria nel core), così la migrazione
verso Supabase resta possibile senza riscrivere.

---

## 5. Layout del repository (proposto)

```
haidafare_intelligence/
├── docs/partner-intelligence/
│   ├── ARCHITECTURE.md          ← questo documento
│   ├── DATA_MODEL.md
│   ├── APIFY_PLAN.md
│   ├── SCORING_MODEL.md
│   ├── DATA_COMPLIANCE.md
│   └── PILOT_PLAN.md
├── db/
│   ├── migrations/              ← DDL versionato
│   └── views/                   ← viste ELITE/HOT/A/REVIEW/EXCLUDE + bitrix_export
├── src/partner_intelligence/
│   ├── config/                  ← keyword set, matrice territori, budget caps
│   ├── stage01_discovery/
│   ├── stage02_normalize/
│   ├── stage03_dedupe/
│   ├── stage04_crawl/
│   ├── stage05_extract/
│   ├── stage06_enrich/          ← client LLM astratto + prompt versionati
│   ├── stage07_score/           ← implementazione SCORE_V1
│   ├── stage08_quality/
│   ├── stage09_review/
│   ├── stage10_export/
│   ├── llm/                     ← abstraction layer provider
│   ├── schemas/                 ← JSON Schema + modelli Pydantic
│   └── common/                  ← db, logging, cost ledger, geo lookup
├── tests/
│   ├── fixtures/                ← HTML reali anonimizzati per test estrazione
│   └── golden/                  ← 20 record annotati a mano = regression set scoring
└── exports/                     ← output generati (git-ignored)
```

---

## 6. AI abstraction layer

Nessun accoppiamento a un singolo provider. Interfaccia unica:

```python
class LLMProvider(Protocol):
    def complete_structured(
        self,
        task: TaskName,            # classify | extract | summarize | explain_score
        prompt_version: str,
        payload: dict,
        schema: type[BaseModel],
        max_retries: int = 2,
    ) -> StructuredResult: ...
```

`StructuredResult` contiene: `data` (istanza tipizzata), `usage` (token in/out),
`cost_eur`, `model_id`, `latency_ms`, `validation_attempts`.

- Implementazione iniziale: **un solo provider attivo** (Anthropic), selezionato via config.
- Predisposizione: secondo provider (OpenAI) implementabile senza toccare gli stage.
- I prompt sono file versionati (`prompts/classify_firm.v1.md`), mai stringhe inline: un
  cambio di prompt cambia `prompt_version` e quindi la tracciabilità dei record prodotti.
- **Regola:** il provider non decide mai lo score. Produce segnali; lo score è codice.

---

## 7. Gestione dello stato e freshness

Ogni `firms` porta:
- `discovered_at` — prima comparsa in discovery;
- `last_verified_at` — ultima verifica riuscita della fonte primaria;
- `next_review_at` — calcolato in base alla classe:

| Classe | Cadenza di re-verifica |
|---|---|
| ELITE / HOT | 90 giorni |
| A | 180 giorni |
| B / C | 365 giorni |
| REVIEW | 30 giorni (o fino a risoluzione) |
| EXCLUDE | nessuna re-verifica automatica |

Al re-run: i valori cambiati generano una riga in `firm_field_history`
(`field`, `old_value`, `new_value`, `changed_at`, `source_url`). Lo storico rilevante non
viene mai sovrascritto senza tracciabilità (P8).

---

## 8. Controllo dei costi

Ogni stage scrive nel **cost ledger** (`cost_events`): `run_id`, `firm_id`, `stage`,
`provider`, `unit`, `quantity`, `cost_eur`.

Metriche obbligatorie (vedi `PILOT_PLAN.md` §8 per i valori target):
- costo Apify per record candidato e per record qualificato;
- costo AI per record (token in/out medi);
- pagine medie per studio;
- % siti validi / % record scartati;
- **costo per record ELITE/HOT generato** ← metrica decisionale principale.

**Budget cap con kill-switch:** ogni run dichiara `max_cost_eur`. Al 80% del cap parte un
warning; al 100% la pipeline si ferma in modo pulito (`status = 'BUDGET_STOP'`) senza
perdere lo stato: ripartibile.

Budget token per studio (STAGE 6): default **max 18.000 token di input** per studio
(≈ 12 pagine troncate a ~1.500 token utili). Oltre soglia, si tronca per priorità di pagina,
non a caso.

---

## 9. Osservabilità e qualità operativa

- log strutturati JSON, correlati da `run_id` + `firm_id`;
- tabella `crawl_runs` con esito per dominio (`pages_fetched`, `blocked`, `robots_denied`, `http_errors`);
- dashboard minima (query SQL versionate) su: funnel discovery→qualificati, distribuzione classi, distribuzione confidence, costi;
- **regression set**: 20 record annotati a mano in `tests/golden/`. Ogni modifica a prompt
  o scoring deve essere valutata contro questo set prima del rilascio. Uno score che cambia
  senza motivo è un bug.

---

## 10. Sicurezza

- credenziali solo da environment/secret manager; `.env` in `.gitignore`;
- accesso DB con utente applicativo a privilegi minimi; utente read-only per export/QA;
- nessun dato personale non professionale in log o in messaggi di errore;
- export contenenti dati di contatto trattati come materiale riservato (§ `DATA_COMPLIANCE.md` §8).

---

## 11. Cosa il sistema NON fa (vincoli architetturali espliciti)

- non effettua scraping massivo dell'Albo nazionale;
- non aggira CAPTCHA, login, anti-bot o limitazioni tecniche;
- non accede ad aree riservate;
- non effettua *email guessing* né ricostruzione di indirizzi personali;
- non raccoglie dati particolari (art. 9 GDPR) né dati non professionali;
- non sincronizza automaticamente l'intero database verso il CRM;
- non accetta output AI non validato come sorgente di aggiornamento del database;
- non assegna una classe ELITE/HOT senza contatto professionale identificabile e
  `data_confidence` sufficiente.

---

## 12. Estendibilità post-pilot

- **Copertura geografica:** la matrice territori è un file di configurazione. Estendere a
  tutte le regioni = aggiungere righe, non toccare codice.
- **Nuove verticali:** l'entità è `PROFESSIONAL_FIRM`, non `COMMERCIALISTA`. Studi legali,
  consulenti del lavoro e società di consulenza sono rappresentabili con lo stesso schema
  cambiando `firm_category` e keyword set.
- **Scoring V2:** i pesi vivono in configurazione versionata; `score_versions` permette di
  ricalcolare e confrontare senza perdere lo storico.
- **CRM:** l'adapter Bitrix24 è un modulo di STAGE 10, isolato dietro un'interfaccia
  `CrmAdapter`, sostituibile.
