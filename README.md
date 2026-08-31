# AI DA FARE PARTNER INTELLIGENCE

Sistema di market intelligence per l'identificazione e la qualificazione di studi
professionali italiani (commercialisti, studi associati, STP, studi multidisciplinari) con
alto potenziale come **partner commerciali di AI DA FARE**.

> Il progetto non costruisce un elenco di commercialisti. Costruisce un asset proprietario
> capace di rispondere alla domanda:
> **quali studi professionali italiani hanno la maggiore probabilità di diventare partner
> commerciali di AI DA FARE?**

## Stato

**FASE 0 — DOCUMENTAZIONE.** In attesa di approvazione prima di qualsiasi esecuzione.
Nessun crawling è stato eseguito.

## Documentazione

| Documento | Contenuto |
|---|---|
| [ARCHITECTURE.md](docs/partner-intelligence/ARCHITECTURE.md) | Principi, pipeline a 10 stage, stack, layer AI, costi, osservabilità |
| [DATA_MODEL.md](docs/partner-intelligence/DATA_MODEL.md) | Schema PostgreSQL completo, entità, viste, deduplica, freshness, proiezione Bitrix |
| [APIFY_PLAN.md](docs/partner-intelligence/APIFY_PLAN.md) | I 3 Actor, matrice query × territorio, budget pagine, stime costi, rate limiting |
| [SCORING_MODEL.md](docs/partner-intelligence/SCORING_MODEL.md) | `AI_DA_FARE_PARTNER_SCORE_V1`: 7 componenti, override, classi, confidence, partner model |
| [DATA_COMPLIANCE.md](docs/partner-intelligence/DATA_COMPLIANCE.md) | Base giuridica, LIA, divieti con guard rail tecnici, retention, checklist |
| [PILOT_PLAN.md](docs/partner-intelligence/PILOT_PLAN.md) | Fasi 20 → 100 → 500, gate, KPI, QA su 100 record, budget, rischi, assunzioni |

## Pilot

Lombardia · Lazio · Puglia — **500 studi qualificati** (non 500 nominativi).
Esecuzione a gate: 20 studi → 100 studi → 500 studi, con criteri di passaggio espliciti.

## Principio operativo

**Qualità > quantità.** Se un dato non aumenta la qualità della selezione commerciale,
non entra nella pipeline.
