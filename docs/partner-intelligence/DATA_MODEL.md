# AI DA FARE PARTNER INTELLIGENCE — DATA MODEL

**Versione:** 1.0
**Stato:** DRAFT — in attesa di approvazione
**DBMS:** PostgreSQL 16 (portabile su Supabase)
**Estensioni richieste:** `pgcrypto` (UUID), `pg_trgm` (fuzzy matching), `unaccent`

---

## 1. Principi del modello

1. **L'entità principale è LO STUDIO** (`firms`), non la sede né il professionista.
2. Ogni campo derivato da fonte esterna è tracciabile a una riga di `sources`.
3. I campi prodotti dall'AI vivono in `firm_signals` con `value + confidence + evidence`;
   `firms` ne espone una **proiezione denormalizzata** per query e export.
4. Gli score sono **versionati**: `scores` è append-only, `firms` espone lo score corrente.
5. Nulla viene cancellato: si usano `status`, `merged_into_firm_id`, `superseded_at`.
6. Ogni tabella con dati esterni ha `source_url`, `data_origin`, `retrieval_date`.

---

## 2. Diagramma delle relazioni

```
                              ┌──────────────┐
                    ┌────────▶│    firms     │◀────────┐
                    │         │  (LO STUDIO) │         │
                    │         └───┬───┬───┬──┘         │
                    │             │   │   │            │
        ┌───────────┴──┐   ┌──────▼┐ ┌▼───────┐ ┌──────▼──────┐
        │ firm_domains │   │locations│ │contacts│ │professionals│
        └──────────────┘   └────────┘ └────────┘ └──────┬──────┘
                                                        │
   ┌────────────┐  ┌─────────────┐  ┌────────┐   ┌──────▼──────┐
   │firm_services│ │ firm_signals │  │ scores │   │primary_decision
   └────────────┘  └─────────────┘  └───┬────┘   │    _maker (vista)
                                        │        └─────────────┘
   ┌────────────┐  ┌─────────────┐  ┌───▼──────────┐
   │  sources   │  │ crawl_runs  │  │score_versions│
   └────────────┘  └─────────────┘  └──────────────┘

   ┌────────────┐  ┌─────────────┐  ┌────────┐  ┌────────────┐
   │  reviews   │  │  exports    │  │cost_ev.│  │merge_events│
   └────────────┘  └─────────────┘  └────────┘  └────────────┘
```

---

## 3. Tipi enumerati

```sql
CREATE TYPE firm_status AS ENUM (
  'CANDIDATE',        -- uscito da discovery, non ancora qualificato
  'QUALIFYING',       -- in crawling/arricchimento
  'QUALIFIED',        -- record completo e validato
  'REVIEW_REQUIRED',  -- dati insufficienti o contraddittori
  'EXCLUDED',         -- non coerente con il target
  'MERGED',           -- assorbito da un altro studio
  'BUDGET_STOP'       -- interrotto per cap di budget, ripartibile
);

CREATE TYPE partner_class AS ENUM ('ELITE','HOT','A','B','C','REVIEW','EXCLUDE');

CREATE TYPE studio_type AS ENUM (
  'STUDIO_INDIVIDUALE',
  'STUDIO_ASSOCIATO',
  'STP',                    -- società tra professionisti
  'SOCIETA_DI_CONSULENZA',
  'STUDIO_MULTIDISCIPLINARE',
  'NETWORK',
  'UNKNOWN'
);

CREATE TYPE apparent_target AS ENUM (
  'PMI','GRANDI_IMPRESE','MICRO_IMPRESE','PRIVATI','MISTO','UNKNOWN'
);

CREATE TYPE partner_model AS ENUM (
  'REFERRAL_PARTNER','RESELLER','ADVISORY_PARTNER','INSTITUTIONAL_PARTNER',
  'LEAD_SHARING','CO_MARKETING','LOW_PRIORITY'
);

CREATE TYPE commercial_priority AS ENUM ('P1','P2','P3','P4','NONE');

CREATE TYPE confidence_class AS ENUM ('VERY_HIGH','HIGH','MEDIUM','REVIEW');

CREATE TYPE digital_maturity AS ENUM ('low','medium','high','unknown');

CREATE TYPE capacity_level AS ENUM ('low','medium','high','unknown');

CREATE TYPE data_origin AS ENUM (
  'OFFICIAL_WEBSITE','GOOGLE_MAPS','GOOGLE_SEARCH','LINKEDIN_PUBLIC',
  'PUBLIC_DIRECTORY','ORDINE_TERRITORIALE','PRESS_ARTICLE','AI_INFERENCE',
  'HUMAN_REVIEW'
);

CREATE TYPE outreach_status AS ENUM (
  'not_contacted','contacted','replied','meeting','interested','partner','rejected'
);

CREATE TYPE signal_source AS ENUM ('DETERMINISTIC','AI','HUMAN');
```

---

## 4. Tabella principale — `firms` (PROFESSIONAL_FIRM)

```sql
CREATE TABLE firms (
  -- ── Identity ────────────────────────────────────────────────────────────
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name                 TEXT NOT NULL,
  legal_name                TEXT,                -- quando disponibile
  name_key                  TEXT NOT NULL,       -- nome normalizzato per dedup
  website                   TEXT,
  domain                    TEXT,                -- dominio primario canonicalizzato
  address                   TEXT,
  city                      TEXT,
  province                  CHAR(2),             -- sigla, es. 'MI'
  region                    TEXT,
  postal_code               TEXT,
  country                   CHAR(2) NOT NULL DEFAULT 'IT',
  num_locations             SMALLINT DEFAULT 1,
  geographic_coverage       TEXT,                -- 'locale' | 'provinciale' | 'regionale' | 'nazionale'
  vat_number                TEXT,                -- solo se pubblicato dallo studio

  -- ── Contact ─────────────────────────────────────────────────────────────
  general_email             TEXT,
  commercial_email          TEXT,
  phone                     TEXT,                -- E.164
  contact_page              TEXT,
  contact_form_url          TEXT,
  linkedin_company          TEXT,
  google_business_url       TEXT,

  -- ── Firm Profile ────────────────────────────────────────────────────────
  estimated_team_size       TEXT,                -- '1' | '2-5' | '6-10' | '11-20' | '21-50' | '50+'
  num_professionals_detected  SMALLINT,
  num_commercialisti_detected SMALLINT,
  num_partners_detected       SMALLINT,
  studio_type               studio_type NOT NULL DEFAULT 'UNKNOWN',
  apparent_target           apparent_target NOT NULL DEFAULT 'UNKNOWN',
  primary_services          TEXT[] DEFAULT '{}',
  secondary_services        TEXT[] DEFAULT '{}',
  years_active_estimate     SMALLINT,            -- NULL se non ricavabile
  digital_presence_score    SMALLINT CHECK (digital_presence_score BETWEEN 0 AND 100),
  digital_maturity          digital_maturity DEFAULT 'unknown',
  content_activity          TEXT,                -- 'none' | 'sporadic' | 'regular' | 'intense'
  last_visible_update       DATE,
  has_news_section          BOOLEAN,
  has_blog                  BOOLEAN,
  has_team_page             BOOLEAN,
  has_service_pages         BOOLEAN,

  -- ── AI DA FARE Signals (proiezione denormalizzata di firm_signals) ──────
  works_with_pmi            BOOLEAN,
  offers_business_consulting BOOLEAN,
  offers_finanza_agevolata  BOOLEAN,
  offers_startup_services   BOOLEAN,
  offers_digitalization     BOOLEAN,
  offers_transition_40      BOOLEAN,
  offers_transition_50      BOOLEAN,
  offers_gdpr               BOOLEAN,
  offers_compliance         BOOLEAN,
  offers_cybersecurity      BOOLEAN,
  offers_esg                BOOLEAN,
  offers_control_management BOOLEAN,
  offers_strategy           BOOLEAN,
  talks_about_ai            BOOLEAN,
  publishes_ai_content      BOOLEAN,
  ai_governance_relevance   SMALLINT CHECK (ai_governance_relevance BETWEEN 0 AND 100),
  innovation_relevance      SMALLINT CHECK (innovation_relevance BETWEEN 0 AND 100),

  -- ── Commercial Qualification ────────────────────────────────────────────
  partner_score             SMALLINT CHECK (partner_score BETWEEN 0 AND 100),
  partner_class             partner_class,
  confidence_score          SMALLINT CHECK (confidence_score BETWEEN 0 AND 100),
  confidence_class          confidence_class,
  commercial_priority       commercial_priority DEFAULT 'NONE',
  estimated_distribution_capacity capacity_level DEFAULT 'unknown',
  likely_partner_model      partner_model,
  overlap_risk              TEXT,                -- 'none' | 'low' | 'medium' | 'high' + nota
  notes                     TEXT,
  ai_generated_summary      TEXT CHECK (char_length(ai_generated_summary) <= 500),
  suggested_approach        TEXT CHECK (char_length(suggested_approach) <= 500),
  current_score_id          UUID,                -- FK a scores, score corrente

  -- ── Data Governance ─────────────────────────────────────────────────────
  source_url_primary        TEXT,
  source_urls               TEXT[] DEFAULT '{}',
  discovered_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_verified_at          TIMESTAMPTZ,
  next_review_at            TIMESTAMPTZ,
  status                    firm_status NOT NULL DEFAULT 'CANDIDATE',
  exclusion_reason          TEXT,
  review_required           BOOLEAN NOT NULL DEFAULT false,
  reviewed_by               TEXT,
  reviewed_at               TIMESTAMPTZ,
  data_quality_notes        TEXT,
  low_data_confidence       BOOLEAN NOT NULL DEFAULT false,
  merged_into_firm_id       UUID REFERENCES firms(id),

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX firms_domain_uidx ON firms(domain) WHERE domain IS NOT NULL AND status <> 'MERGED';
CREATE INDEX firms_name_trgm_idx ON firms USING gin (name_key gin_trgm_ops);
CREATE INDEX firms_geo_idx        ON firms(region, province, city);
CREATE INDEX firms_class_idx      ON firms(partner_class, partner_score DESC);
CREATE INDEX firms_status_idx     ON firms(status) WHERE status <> 'MERGED';
CREATE INDEX firms_review_idx     ON firms(next_review_at) WHERE status = 'QUALIFIED';
```

### 4.1 Dizionario dei campi critici

| Campo | Significato commerciale | Origine | Alimenta lo score? |
|---|---|---|---|
| `works_with_pmi` | Il portafoglio clienti è composto da imprese, non da privati. È il **discriminante primario**. | AI + keyword matrix | Sì, componente A (0–25) + override |
| `studio_type` | Struttura organizzativa: proxy di capacità distributiva. | AI + markup | Sì, componente B |
| `num_professionals_detected` | Dimensione osservata sul sito (non dichiarata). | Deterministico (pagina team) | Sì, componente B |
| `offers_finanza_agevolata` | Segnale forte: chi fa bandi/incentivi ha già un canale consulenziale attivo verso le PMI. | AI + keyword | Sì, componente E |
| `offers_transition_50` | Segnale fortissimo: intersezione diretta con digitalizzazione + incentivi. | AI + keyword | Sì, componente D+E |
| `talks_about_ai` | Lo studio è già in conversazione sull'AI ⇒ minore attrito di ingaggio. | AI + keyword | Sì, componente D |
| `ai_governance_relevance` | Rilevanza rispetto all'offerta core AI DA FARE (AI Act, AI literacy, governance). | AI (0–100) | Sì, componente D |
| `estimated_distribution_capacity` | Quanti clienti PMI lo studio può realisticamente raggiungere. | AI, derivato da dimensione+copertura+contenuti | Sì, componente F |
| `overlap_risk` | Lo studio offre già servizi sovrapposti a AI DA FARE ⇒ competitor o partner? | AI + review | Modificatore, non componente |
| `confidence_score` | Quanto ci si può fidare del record. | Deterministico | No (è ortogonale), ma governa il declassamento a REVIEW |

**Campi `informational` (non alimentano lo score):** `vat_number`, `postal_code`,
`years_active_estimate`, `legal_name`. Servono a validazione e deduplica, non alla priorità
commerciale.

---

## 5. Entità collegate

### 5.1 `firm_domains` — studio con più domini

```sql
CREATE TABLE firm_domains (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id       UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  domain        TEXT NOT NULL,
  is_primary    BOOLEAN NOT NULL DEFAULT false,
  brand_label   TEXT,          -- es. nome commerciale alternativo
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (domain)
);
```

### 5.2 `firm_aliases` — stesso studio, brand diversi

```sql
CREATE TABLE firm_aliases (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id   UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  alias     TEXT NOT NULL,
  alias_key TEXT NOT NULL,
  origin    data_origin NOT NULL,
  UNIQUE (firm_id, alias_key)
);
CREATE INDEX firm_aliases_trgm_idx ON firm_aliases USING gin (alias_key gin_trgm_ops);
```

### 5.3 `locations` — sedi (una `firms` può averne N)

```sql
CREATE TABLE locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id       UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  label         TEXT,                    -- 'sede principale', 'sede operativa'
  address       TEXT,
  address_key   TEXT,                    -- normalizzato per dedup
  city          TEXT,
  province      CHAR(2),
  region        TEXT,
  postal_code   TEXT,
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  phone         TEXT,
  is_headquarters BOOLEAN NOT NULL DEFAULT false,
  source_url    TEXT,
  data_origin   data_origin NOT NULL,
  retrieval_date TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX locations_firm_idx ON locations(firm_id);
CREATE INDEX locations_addr_trgm_idx ON locations USING gin (address_key gin_trgm_ops);
```

### 5.4 `contacts` — recapiti pubblici dello studio

```sql
CREATE TABLE contacts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  contact_type   TEXT NOT NULL CHECK (contact_type IN
                   ('email','phone','form','linkedin','pec','other')),
  value          TEXT NOT NULL,
  is_generic     BOOLEAN NOT NULL DEFAULT true,   -- info@ / studio@ vs nominativo pubblico
  is_professional BOOLEAN NOT NULL DEFAULT true,  -- guard rail compliance
  label          TEXT,                            -- 'amministrazione', 'commerciale'
  confidence     NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
  source_url     TEXT NOT NULL,
  data_origin    data_origin NOT NULL,
  retrieval_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (firm_id, contact_type, value)
);
```

> **Vincolo di compliance:** un contatto entra in tabella **solo** se pubblicato dallo studio
> per finalità professionali. Nessun indirizzo ricostruito, dedotto o inferito
> (`data_origin = 'AI_INFERENCE'` è **vietato** su `contacts`; enforced da CHECK).

```sql
ALTER TABLE contacts ADD CONSTRAINT contacts_no_inference
  CHECK (data_origin <> 'AI_INFERENCE');
```

### 5.5 `professionals` — PROFESSIONAL

```sql
CREATE TABLE professionals (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id                   UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  first_name                TEXT,
  last_name                 TEXT,
  full_name_key             TEXT NOT NULL,     -- normalizzato per dedup
  role                      TEXT,              -- come appare sul sito
  role_normalized           TEXT,              -- 'founder','managing_partner','partner',...
  title                     TEXT,              -- 'Dott.', 'Rag.', 'Avv.'
  specialization            TEXT,
  public_professional_email TEXT,              -- SOLO se pubblicata
  linkedin_public_url       TEXT,
  public_profile_url        TEXT,
  is_partner                BOOLEAN,
  is_founder                BOOLEAN,
  is_decision_maker         BOOLEAN,
  decision_maker_rank       SMALLINT,          -- 1 = più probabile interlocutore
  confidence_score          SMALLINT CHECK (confidence_score BETWEEN 0 AND 100),
  source_url                TEXT NOT NULL,
  data_origin               data_origin NOT NULL,
  retrieval_date            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (firm_id, full_name_key)
);
CREATE INDEX professionals_dm_idx ON professionals(firm_id, decision_maker_rank)
  WHERE is_decision_maker = true;
```

> **Vietato:** email guessing, pattern `nome.cognome@dominio` inferiti, scraping di profili
> dietro login. Se l'email non è pubblicata: `NULL`.

### 5.6 `PRIMARY_DECISION_MAKER` — vista, non tabella

Il decision maker primario è **derivato**, così resta sempre coerente con `professionals`.

```sql
CREATE VIEW primary_decision_maker AS
SELECT DISTINCT ON (p.firm_id)
  p.firm_id,
  NULLIF(trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')), '')
                                              AS name,
  p.role_normalized                           AS role,
  coalesce(p.public_professional_email,
           (SELECT c.value FROM contacts c
             WHERE c.firm_id = p.firm_id AND c.contact_type='email'
               AND c.is_generic = true ORDER BY c.confidence DESC NULLS LAST LIMIT 1))
                                              AS public_contact,
  p.linkedin_public_url                       AS linkedin,
  p.confidence_score                          AS confidence,
  p.source_url
FROM professionals p
WHERE p.is_decision_maker = true
ORDER BY p.firm_id, p.decision_maker_rank ASC NULLS LAST, p.confidence_score DESC NULLS LAST;
```

**Priorità dei ruoli** (`decision_maker_rank`, 1 = massima):

| Rank | Ruolo rilevato |
|---|---|
| 1 | founder, fondatore, titolare, managing partner, socio fondatore |
| 2 | partner, socio, managing director, amministratore |
| 3 | responsabile sviluppo / business development |
| 4 | responsabile consulenza, responsabile innovazione |
| 5 | responsabile finanza agevolata |
| 6 | altri ruoli senior |

Se nessun professionista pubblico è rilevabile: la vista non restituisce righe e gli export
espongono **`N/D`**. Non si inventa mai un nome.

### 5.7 `firm_services`

```sql
CREATE TABLE firm_services (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  service_code   TEXT NOT NULL,        -- tassonomia controllata, vedi §6
  service_label  TEXT,                 -- testo così come appare sul sito
  is_primary     BOOLEAN NOT NULL DEFAULT false,
  confidence     NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
  evidence       TEXT,                 -- citazione breve
  source_url     TEXT,
  extracted_by   signal_source NOT NULL,
  retrieval_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (firm_id, service_code)
);
```

### 5.8 `firm_signals` — cuore dell'arricchimento AI

```sql
CREATE TABLE firm_signals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id        UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  signal_key     TEXT NOT NULL,        -- es. 'offers_finanza_agevolata'
  value_bool     BOOLEAN,
  value_num      NUMERIC,
  value_text     TEXT,
  confidence     NUMERIC(3,2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  evidence       TEXT,                 -- citazione testuale dalla fonte
  source_url     TEXT,
  extracted_by   signal_source NOT NULL,
  model_id       TEXT,                 -- se extracted_by = 'AI'
  prompt_version TEXT,
  enrichment_run_id UUID,
  superseded_at  TIMESTAMPTZ,          -- append-only: NULL = valore corrente
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX firm_signals_current_uidx
  ON firm_signals(firm_id, signal_key) WHERE superseded_at IS NULL;
CREATE INDEX firm_signals_key_idx ON firm_signals(signal_key, value_bool);
```

> **Regola P4 applicata a livello di dato:** un segnale AI con `value_bool = true`,
> `confidence < 0.6` e `evidence IS NULL` viene scartato dal quality check e **non** propagato
> alla proiezione su `firms`.

### 5.9 `sources`

```sql
CREATE TABLE sources (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id        UUID REFERENCES firms(id) ON DELETE CASCADE,
  url            TEXT NOT NULL,
  data_origin    data_origin NOT NULL,
  page_type      TEXT,               -- 'homepage','team','servizi','contatti','blog',...
  http_status    SMALLINT,
  title          TEXT,
  content_hash   TEXT,               -- per rilevare variazioni fra run
  content_chars  INTEGER,
  robots_allowed BOOLEAN,
  retrieval_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  crawl_run_id   UUID,
  UNIQUE (firm_id, url, crawl_run_id)
);
```

### 5.10 `crawl_runs`

```sql
CREATE TABLE crawl_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id           UUID REFERENCES firms(id) ON DELETE CASCADE,
  domain            TEXT,
  pipeline_run_id   UUID,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at       TIMESTAMPTZ,
  pages_requested   SMALLINT,
  pages_fetched     SMALLINT,
  pages_useful      SMALLINT,
  robots_denied     SMALLINT DEFAULT 0,
  http_errors       SMALLINT DEFAULT 0,
  blocked           BOOLEAN DEFAULT false,
  block_reason      TEXT,             -- 'captcha','login_wall','403','429','robots'
  apify_run_id      TEXT,
  cost_eur          NUMERIC(10,4),
  status            TEXT              -- 'OK','PARTIAL','FAILED','SKIPPED'
);
```

### 5.11 `enrichment_runs`

```sql
CREATE TABLE enrichment_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id             UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  task                TEXT NOT NULL,   -- classify_firm | extract_services | ...
  provider            TEXT NOT NULL,
  model_id            TEXT NOT NULL,
  prompt_version      TEXT NOT NULL,
  schema_version      TEXT NOT NULL,
  input_tokens        INTEGER,
  output_tokens       INTEGER,
  cost_eur            NUMERIC(10,5),
  validation_attempts SMALLINT NOT NULL DEFAULT 1,
  validation_ok       BOOLEAN NOT NULL,
  raw_output          JSONB,           -- output validato (o ultimo tentativo fallito)
  error               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.12 `scores` e `score_versions`

```sql
CREATE TABLE score_versions (
  id            TEXT PRIMARY KEY,      -- 'AI_DA_FARE_PARTNER_SCORE_V1'
  description   TEXT NOT NULL,
  weights       JSONB NOT NULL,        -- pesi e soglie, versionati
  rules         JSONB NOT NULL,        -- overriding rules
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  active        BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE scores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id           UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  score_version     TEXT NOT NULL REFERENCES score_versions(id),
  partner_score     SMALLINT NOT NULL CHECK (partner_score BETWEEN 0 AND 100),
  partner_class     partner_class NOT NULL,
  confidence_score  SMALLINT NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  confidence_class  confidence_class NOT NULL,
  components        JSONB NOT NULL,    -- {"A":21,"B":12,"C":9,"D":11,"E":13,"F":7,"G":4}
  raw_score         SMALLINT NOT NULL, -- prima degli override
  applied_overrides TEXT[] DEFAULT '{}',
  explanation       TEXT,              -- spiegazione leggibile del punteggio
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_at     TIMESTAMPTZ
);
CREATE UNIQUE INDEX scores_current_uidx
  ON scores(firm_id, score_version) WHERE superseded_at IS NULL;

ALTER TABLE firms ADD CONSTRAINT firms_current_score_fk
  FOREIGN KEY (current_score_id) REFERENCES scores(id);
```

### 5.13 `reviews` — human QA

```sql
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id           UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  reviewer          TEXT NOT NULL,
  sample_batch      TEXT,              -- 'PILOT_QA_100'
  field             TEXT NOT NULL,     -- campo verificato
  ai_value          TEXT,
  verdict           TEXT NOT NULL CHECK (verdict IN ('CORRECT','INCORRECT','PARTIAL','UNVERIFIABLE')),
  corrected_value   TEXT,
  note              TEXT,
  reviewed_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_batch_idx ON reviews(sample_batch, field, verdict);
```

La **precision rate** per campo è una query, non un numero scritto a mano:

```sql
SELECT field,
       count(*) FILTER (WHERE verdict = 'CORRECT')::numeric
         / NULLIF(count(*) FILTER (WHERE verdict <> 'UNVERIFIABLE'), 0) AS precision
FROM reviews WHERE sample_batch = 'PILOT_QA_100' GROUP BY field ORDER BY precision;
```

### 5.14 `exports`

```sql
CREATE TABLE exports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_name    TEXT NOT NULL,
  view_name      TEXT NOT NULL,      -- 'v_elite','v_hot','v_a','v_review','v_exclude','master'
  format         TEXT NOT NULL CHECK (format IN ('csv','xlsx','json')),
  score_version  TEXT NOT NULL,
  filter_sql     TEXT,
  row_count      INTEGER NOT NULL,
  firm_ids       UUID[],             -- tracciabilità di cosa è uscito
  destination    TEXT,               -- 'file' | 'bitrix24'
  exported_by    TEXT,
  exported_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.15 Tabelle di supporto

```sql
CREATE TABLE discovery_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_run_id UUID,
  query_text    TEXT NOT NULL,
  keyword_set   TEXT,
  territory     TEXT,
  raw_name      TEXT,
  raw_website   TEXT,
  raw_phone     TEXT,
  raw_address   TEXT,
  raw_payload   JSONB,
  source        data_origin NOT NULL,
  source_url    TEXT,
  retrieval_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed     BOOLEAN NOT NULL DEFAULT false,
  firm_id       UUID REFERENCES firms(id)
);

CREATE TABLE merge_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survivor_id   UUID NOT NULL REFERENCES firms(id),
  merged_id     UUID NOT NULL REFERENCES firms(id),
  rule          TEXT NOT NULL,       -- 'D1_domain','D3_name_fuzzy',...
  similarity    NUMERIC(4,3),
  automatic     BOOLEAN NOT NULL,
  decided_by    TEXT,
  merged_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE firm_field_history (
  id            BIGSERIAL PRIMARY KEY,
  firm_id       UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  field         TEXT NOT NULL,
  old_value     TEXT,
  new_value     TEXT,
  source_url    TEXT,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by    TEXT NOT NULL DEFAULT 'pipeline'
);

CREATE TABLE pipeline_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage         TEXT NOT NULL,
  config        JSONB NOT NULL,
  max_cost_eur  NUMERIC(10,2),
  status        TEXT NOT NULL,      -- RUNNING|OK|FAILED|BUDGET_STOP
  stats         JSONB,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ
);

CREATE TABLE cost_events (
  id            BIGSERIAL PRIMARY KEY,
  pipeline_run_id UUID REFERENCES pipeline_runs(id),
  firm_id       UUID REFERENCES firms(id),
  stage         TEXT NOT NULL,
  provider      TEXT NOT NULL,      -- 'apify' | 'anthropic' | ...
  unit          TEXT NOT NULL,      -- 'result' | 'page' | 'token_in' | 'token_out'
  quantity      NUMERIC NOT NULL,
  cost_eur      NUMERIC(10,5) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cost_events_run_idx ON cost_events(pipeline_run_id, stage);
```

---

## 6. Tassonomia dei servizi (`service_code`)

Controllata, non libera. Estendibile solo per aggiunta versionata.

| Codice | Etichetta IT | Cluster |
|---|---|---|
| `FISCAL` | consulenza fiscale e tributaria | core |
| `ACCOUNTING` | contabilità e bilancio | core |
| `LABOUR` | consulenza del lavoro / paghe | core |
| `CORPORATE` | consulenza societaria e straordinaria | advisory |
| `BUSINESS_ADVISORY` | consulenza aziendale | advisory |
| `CONTROL_MGMT` | controllo di gestione | advisory |
| `STRATEGY` | consulenza strategica / organizzazione | advisory |
| `FINANCE_AGEVOLATA` | finanza agevolata, bandi, incentivi | growth |
| `CORPORATE_FINANCE` | finanza d'impresa, M&A | growth |
| `STARTUP` | startup e innovazione | growth |
| `DIGITALIZATION` | digitalizzazione dei processi | innovation |
| `INDUSTRY_40` | industria 4.0 / credito d'imposta beni strumentali | innovation |
| `TRANSITION_50` | transizione 5.0 | innovation |
| `AI_ADVISORY` | AI, automazione, AI Act | innovation |
| `COMPLIANCE` | compliance, 231, whistleblowing | compliance |
| `GDPR` | privacy e protezione dati | compliance |
| `CYBERSEC` | cybersecurity | compliance |
| `ESG` | ESG, sostenibilità, rendicontazione | compliance |
| `CRISIS` | crisi d'impresa, composizione negoziata | specialistic |
| `AUDIT` | revisione legale | specialistic |
| `PRIVATE_CLIENT` | persone fisiche, patrimoni, successioni | **contro-segnale** |

`PRIVATE_CLIENT` in assenza di servizi dei cluster *advisory/growth* è un **contro-segnale**:
suggerisce uno studio orientato ai privati ⇒ penalizzazione (vedi `SCORING_MODEL.md` §5).

---

## 7. Viste di output

```sql
CREATE VIEW v_master AS
SELECT f.*, pdm.name AS dm_name, pdm.role AS dm_role,
       pdm.public_contact AS dm_contact, pdm.linkedin AS dm_linkedin,
       pdm.confidence AS dm_confidence
FROM firms f
LEFT JOIN primary_decision_maker pdm ON pdm.firm_id = f.id
WHERE f.status <> 'MERGED';

CREATE VIEW v_elite  AS SELECT * FROM v_master WHERE partner_class = 'ELITE';
CREATE VIEW v_hot    AS SELECT * FROM v_master WHERE partner_class = 'HOT';
CREATE VIEW v_a      AS SELECT * FROM v_master WHERE partner_class = 'A';
CREATE VIEW v_review AS SELECT * FROM v_master WHERE partner_class = 'REVIEW' OR review_required;
CREATE VIEW v_exclude AS SELECT * FROM v_master WHERE partner_class = 'EXCLUDE' OR status = 'EXCLUDED';
CREATE VIEW v_top50  AS SELECT * FROM v_master
  WHERE partner_class IN ('ELITE','HOT') AND confidence_score >= 75
  ORDER BY partner_score DESC, confidence_score DESC LIMIT 50;
```

---

## 8. Freshness

| Campo | Semantica |
|---|---|
| `discovered_at` | prima volta che lo studio compare in discovery. **Immutabile.** |
| `last_verified_at` | ultimo accesso riuscito alla fonte primaria con contenuto coerente |
| `next_review_at` | prossima verifica programmata, derivata dalla classe (vedi ARCHITECTURE §7) |

Il sistema è progettato per essere rilanciato: al re-run, i campi modificati generano righe
in `firm_field_history` e i vecchi `scores` / `firm_signals` vengono marcati `superseded_at`
anziché sovrascritti.

---

## 9. Bitrix-ready projection

**Non è una tabella sincronizzata**: è una vista di export, popolata solo su azione esplicita
e solo per ELITE / HOT / A selezionati.

```sql
CREATE VIEW v_bitrix_export AS
SELECT
  f.firm_name                     AS "Company Name",
  f.website                       AS "Website",
  f.region                        AS "Region",
  f.city                          AS "City",
  f.phone                         AS "Phone",
  coalesce(f.commercial_email, f.general_email) AS "Email",
  coalesce(pdm.name, 'N/D')       AS "Contact Person",
  coalesce(pdm.role, 'N/D')       AS "Role",
  f.partner_score                 AS "Partner Score",
  f.partner_class::text           AS "Partner Class",
  coalesce(f.likely_partner_model::text,'LOW_PRIORITY') AS "Partner Model",
  f.ai_generated_summary          AS "Summary",
  f.suggested_approach            AS "Suggested Approach",
  f.source_url_primary            AS "Source",
  f.last_verified_at              AS "Last Verified"
FROM firms f
LEFT JOIN primary_decision_maker pdm ON pdm.firm_id = f.id
WHERE f.partner_class IN ('ELITE','HOT','A')
  AND f.status = 'QUALIFIED';
```

`outreach_status` **non** è nella vista di export iniziale: vive nel CRM (vedi
`PILOT_PLAN.md` §9). Il campo è comunque previsto in `firms` come opzionale per un futuro
write-back:

```sql
ALTER TABLE firms ADD COLUMN outreach_status outreach_status;  -- nullable, write-back CRM
```

---

## 10. Integrità e vincoli notevoli

| Vincolo | Regola |
|---|---|
| `firms_domain_uidx` | un dominio ⇒ un solo studio attivo |
| `contacts_no_inference` | nessun contatto da inferenza AI |
| `scores_current_uidx` | un solo score corrente per (studio, versione) |
| `firm_signals_current_uidx` | un solo valore corrente per segnale |
| `ai_generated_summary ≤ 500` | vincolo di prodotto sul commercial summary |
| CHECK su `partner_score` | 0–100, sempre |
| `professionals` UNIQUE (firm_id, full_name_key) | nessun professionista duplicato nello studio |

---

## 11. Regole di popolamento dei campi AI su `firms`

La proiezione da `firm_signals` a `firms` avviene **solo** al termine del quality check e
solo per i segnali che soddisfano:

```
confidence >= 0.60  AND  (evidence IS NOT NULL OR extracted_by = 'DETERMINISTIC')
```

Altrimenti il campo su `firms` resta `NULL` (non `false`): la distinzione fra
"non offre il servizio" e "non lo sappiamo" è commercialmente rilevante e non va persa.
Nel calcolo dello score, `NULL` vale 0 punti ma abbassa il `confidence_score`.
