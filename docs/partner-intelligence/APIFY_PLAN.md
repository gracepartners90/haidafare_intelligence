# AI DA FARE PARTNER INTELLIGENCE — APIFY PLAN

**Versione:** 1.0
**Stato:** DRAFT — in attesa di approvazione
**Ruolo di Apify:** motore di acquisizione (discovery + crawling + estrazione contatti).
**Ruolo che Apify NON ha:** nessuna logica di qualificazione, scoring o decisione commerciale.

---

## 1. Perché Apify e dove si ferma

Apify risolve i problemi *infrastrutturali* dell'acquisizione: proxy, retry, concorrenza,
rotazione, scheduling, log e costi tracciabili per run. Non risolve i problemi *semantici*:
capire se un dominio è davvero uno studio, quali servizi offre, chi è il decision maker.

Confine architetturale, vincolante:

```
APIFY  →  produce RAW DATA (testo, contatti, metadati, URL)
PIPELINE INTERNA  →  normalizza, deduplica, arricchisce, valuta, decide
```

Conseguenza pratica: **gli Actor sono sostituibili**. Ogni Actor è dietro un adapter
Python con un contratto di output stabile (`DiscoveryItem`, `PageItem`, `ContactItem`).
Se un Actor cambia schema, si tocca l'adapter, non la pipeline.

**Preferenza esplicita:** usare Actor già affidabili e mantenuti dell'Apify Store. Creare un
custom Actor solo quando nessuno esistente copre il caso, e comunque **non nel pilot** se
evitabile: il valore del progetto sta nel modello di qualificazione, non nell'infrastruttura
di scraping.

---

## 2. Architettura degli Actor

### ACTOR 1 — DISCOVERY

**Scopo:** trovare candidati. Nessuna visita ai siti degli studi.

**Fonte primaria:** Google Maps / Google Business tramite Actor di Store consentito.
**Fonte secondaria:** SERP Google tramite Actor di Store consentito.
**Fonte terziaria:** directory professionali pubbliche.

**Input (contratto interno):**

```json
{
  "run_label": "PILOT_20_LOMBARDIA",
  "territories": [
    { "city": "Milano", "province": "MI", "region": "Lombardia", "radius_km": 15 }
  ],
  "keyword_set": "COMMERCIALISTA_B2B_V1",
  "max_results_per_query": 40,
  "language": "it",
  "country": "it",
  "max_cost_eur": 25.0
}
```

**Output (contratto `DiscoveryItem`):**

```json
{
  "business_name": "Studio Associato Rossi & Partners",
  "website": "https://www.studiorossi.it",
  "phone": "+39 02 1234567",
  "address": "Via Roma 1, 20121 Milano MI",
  "city": "Milano",
  "province": "MI",
  "region": "Lombardia",
  "latitude": 45.4642,
  "longitude": 9.1900,
  "categories": ["Commercialista", "Consulente aziendale"],
  "google_business_url": "https://maps.google.com/...",
  "rating": 4.8,
  "reviews_count": 37,
  "source": "GOOGLE_MAPS",
  "source_url": "https://maps.google.com/...",
  "query_text": "studio commercialisti PMI Milano",
  "retrieval_date": "2026-09-01T10:22:00Z"
}
```

**Regole di scarto immediato (a costo zero, prima di toccare il DB):**
- nome che matcha pattern di categoria non target (CAF, patronato, agenzia pratiche auto, assicurazioni, agenzia immobiliare);
- assenza contemporanea di website **e** telefono **e** indirizzo;
- risultato fuori dalle regioni pilota;
- duplicato esatto di `google_business_url` già presente nel run.

> `rating` e `reviews_count` sono raccolti come **metadati di plausibilità** (uno studio con
> 40 recensioni esiste ed è attivo), non come criterio di qualità commerciale. Non entrano
> nello score: un buon rating non dice nulla sulla propensione a diventare partner.

---

### ACTOR 2 — SITE CRAWLER

**Scopo:** raccogliere il testo delle pagine rilevanti di un dominio già qualificato come
candidato plausibile.

**Actor di riferimento:** Website Content Crawler dell'Apify Store (o equivalente
mantenuto), configurato in modalità **guidata e limitata**.

**Input:**

```json
{
  "domain": "studiorossi.it",
  "start_urls": ["https://www.studiorossi.it/"],
  "max_pages": 12,
  "max_depth": 2,
  "include_url_patterns": [
    "chi-siamo","about","lo-studio","studio","team","professionisti","persone","soci","partner",
    "servizi","services","consulenza","aziendale","societaria","tributar","fiscal",
    "finanza-agevolata","bandi","incentivi","contributi","agevolazioni",
    "controllo-di-gestione","startup","innovazione","digitalizzazione",
    "industria-4-0","transizione-5-0","5-0","compliance","gdpr","privacy","esg",
    "sostenibilita","cybersecurity","contatti","contact","news","blog","approfondimenti"
  ],
  "exclude_url_patterns": [
    "/wp-admin","/login","/area-riservata","/area-clienti","/reserved","/cliente",
    "/cart","/checkout","/privacy-policy","/cookie-policy","/informativa",
    "\\.pdf$","\\.zip$","\\.jpg$","\\.png$","/tag/","/category/","/author/","/feed"
  ],
  "respect_robots_txt": true,
  "max_concurrency_per_domain": 1,
  "delay_ms": 1500,
  "request_timeout_s": 20,
  "render_js": "auto",
  "user_agent": "AIDAFARE-PartnerIntelligence/1.0 (+https://aidafare.example/bot)"
}
```

**Output (contratto `PageItem`):**

```json
{
  "domain": "studiorossi.it",
  "url": "https://www.studiorossi.it/servizi/finanza-agevolata",
  "page_type": "servizi",
  "title": "Finanza agevolata e bandi per le PMI",
  "text": "…testo pulito, boilerplate rimosso…",
  "text_chars": 3120,
  "http_status": 200,
  "last_modified": "2026-03-14",
  "content_hash": "sha256:…",
  "robots_allowed": true,
  "retrieval_date": "2026-09-01T10:31:00Z"
}
```

**Politica di budget pagine (pilot):**

| Caso | `max_pages` |
|---|---|
| default | **12** |
| candidato con segnali forti in homepage (`transizione 5.0`, `finanza agevolata`, `controllo di gestione`) | **15** |
| sito monopagina / landing | quello che c'è |
| dominio parcheggiato, sito in costruzione, redirect a social | **stop**, `LOW_DATA_CONFIDENCE` |

**Condizioni di stop immediato** (nessun tentativo di aggiramento):
`robots.txt` nega · `X-Robots-Tag: noindex` · CAPTCHA rilevato · login wall ·
HTTP 403 · HTTP 429 dopo un backoff · dichiarazione esplicita nei ToS del sito contro
il crawling. In tutti i casi: `crawl_runs.blocked = true`, `block_reason` valorizzato, e
il record prosegue **senza** i dati del sito.

**Ordinamento della coda:** le pagine si visitano nell'ordine della priority list
(ARCHITECTURE §3, STAGE 4), non in ordine di scoperta. Se il budget si esaurisce, si è
comunque preso il contenuto più utile.

---

### ACTOR 3 — CONTACT EXTRACTOR

**Scopo:** estrarre recapiti **pubblici e professionali** dal contenuto già raccolto.

Nel pilot gira preferibilmente **sul testo già scaricato da Actor 2**, non come nuovo
crawling: evita di pagare due volte lo stesso dominio.

**Output (contratto `ContactItem`):**

```json
{
  "domain": "studiorossi.it",
  "emails": [
    { "value": "info@studiorossi.it", "is_generic": true, "source_url": "https://www.studiorossi.it/contatti" }
  ],
  "phones": [
    { "value": "+390212345678", "source_url": "https://www.studiorossi.it/contatti" }
  ],
  "social_links": {
    "linkedin": "https://www.linkedin.com/company/studio-rossi",
    "facebook": null
  },
  "contact_form_url": "https://www.studiorossi.it/contatti",
  "team_pages": ["https://www.studiorossi.it/team"],
  "decision_maker_candidates": [
    { "name": "Marco Rossi", "role": "Managing Partner",
      "public_email": "m.rossi@studiorossi.it",
      "linkedin": "https://www.linkedin.com/in/marcorossi",
      "source_url": "https://www.studiorossi.it/team" }
  ]
}
```

**Divieti implementati nell'adapter (non solo nel prompt):**
- nessuna generazione di email non presenti nel testo (no `nome.cognome@dominio` inferito);
- email personali non pubblicate ⇒ mai raccolte;
- scarto di pattern non professionali (indirizzi su domini di posta gratuiti associati a
  persone fisiche senza contesto professionale ⇒ `is_professional = false`, non importati);
- nessun accesso a profili LinkedIn dietro login: si raccoglie **solo** l'URL pubblico
  eventualmente linkato dal sito dello studio.

---

## 3. Matrice di discovery: query × territorio

### 3.1 Keyword set `COMMERCIALISTA_B2B_V1`

Il requisito è esplicito: **non eseguire esclusivamente query con la parola
"commercialista"**. Il set è organizzato in cluster, ciascuno con un ruolo diverso nel
funnel.

**Cluster 1 — Base identificativa** (trova lo studio, bassa selettività)
```
commercialista {loc}
studio commercialisti {loc}
studio commercialista {loc}
dottore commercialista {loc}
studio associato commercialisti {loc}
studio tributario {loc}
consulenza fiscale {loc}
```

**Cluster 2 — Struttura** (trova strutture organizzate, media selettività)
```
studio associato {loc}
STP commercialisti {loc}
società tra professionisti {loc}
studio multidisciplinare {loc}
commercialisti e avvocati {loc}
studio professionale integrato {loc}
```

**Cluster 3 — Orientamento B2B** (alta selettività — **cluster più prezioso**)
```
commercialista imprese {loc}
studio commercialista PMI {loc}
consulenza aziendale {loc}
consulenza societaria {loc}
commercialista consulenza aziendale {loc}
business advisory {loc}
consulente aziendale imprese {loc}
```

**Cluster 4 — Servizi evoluti** (altissima selettività, volumi bassi)
```
commercialista finanza agevolata {loc}
commercialista bandi imprese {loc}
controllo di gestione {loc}
commercialista startup {loc}
commercialista innovazione {loc}
commercialista digitalizzazione imprese {loc}
commercialista transizione 5.0 {loc}
commercialista industria 4.0 {loc}
consulenza ESG {loc}
studio commercialista compliance {loc}
```

**Allocazione del budget query nel pilot:** Cluster 3 e 4 pesano **60%** delle query pur
producendo meno risultati, perché producono i risultati *giusti*. Cluster 1 serve come rete
di sicurezza per non perdere studi grandi con SEO debole sui termini consulenziali.

### 3.2 Territori pilota

| Regione | Città/aree principali | Province coperte | Target candidati |
|---|---|---|---|
| **Lombardia** | Milano, Monza, Brescia, Bergamo, Varese, Como, Pavia, Cremona, Mantova, Lecco, Lodi, Sondrio, Busto Arsizio, Legnano, Vigevano | MI, MB, BS, BG, VA, CO, PV, CR, MN, LC, LO, SO | ~600 |
| **Lazio** | Roma (per municipi/quartieri direzionali), Latina, Frosinone, Viterbo, Rieti, Pomezia, Guidonia | RM, LT, FR, VT, RI | ~450 |
| **Puglia** | Bari, Taranto, Lecce, Foggia, Brindisi, BAT (Andria-Barletta-Trani), Monopoli, Molfetta | BA, TA, LE, FG, BR, BT | ~300 |

**Nota su Roma:** una query "commercialista Roma" satura sui grandi aggregatori. Si
segmenta per zone direzionali (EUR, Prati, Parioli, Nomentano, Ostiense, Tiburtina, Aurelio)
per aumentare la copertura reale di studi diversi.

**Nota su Milano:** stesso problema. Segmentazione per zone (Centro, Porta Nuova, Loreto,
Navigli, Bicocca, Lorenteggio) + hinterland come territori distinti.

### 3.3 Dimensionamento

```
territori pilota            ≈ 45
query per territorio         ≈ 8-12 (mix pesato dei 4 cluster)
risultati per query          ≈ 20-40 (cap 40)
─────────────────────────────────────────────
risultati grezzi attesi      ≈ 9.000-14.000
dopo scarto pre-filtro (~45%) ≈ 5.000-7.700
dopo deduplica (~70-75%)     ≈ 1.300-2.000 candidati unici
target dichiarato            ≈ 1.000-1.500 candidati  ✔ coerente
```

L'overlap fra query è alto **per costruzione** ed è desiderabile: uno studio trovato da 4
query di cluster diversi è un segnale di rilevanza (si registra come `discovery_hit_count`,
usato come tie-breaker, non come punteggio).

---

## 4. Actor già affidabili vs custom

| Funzione | Approccio | Custom Actor? |
|---|---|---|
| Google Maps discovery | Actor di Store maturo, alto volume di utilizzo, manutenzione attiva | **No** |
| Google SERP | Actor di Store maturo | **No** |
| Site crawling | Website Content Crawler di Store, configurato restrittivo | **No** |
| Estrazione contatti | Contact-details Actor di Store **oppure** estrazione interna Python sul testo di Actor 2 | **No** (preferita l'estrazione interna: più controllabile lato compliance) |
| Directory professionali | Valutazione caso per caso dei ToS; se compatibile, crawler generico | Solo se necessario, **fuori dal pilot** |
| Ordini territoriali | **Nessuno scraping massivo.** Consultazione puntuale di verifica | **No** |

**Criteri di selezione di un Actor dello Store:**
1. manutenzione recente e utilizzo diffuso;
2. pricing prevedibile (per risultato o per compute unit, non opaco);
3. output schema documentato e stabile;
4. rispetto configurabile di `robots.txt` e rate limiting;
5. nessuna funzionalità di aggiramento anti-bot come *selling point*. Un Actor che
   pubblicizza il bypass di CAPTCHA è **escluso a priori** dalla shortlist.

---

## 5. Stima costi

> ⚠️ **Le cifre sotto sono stime di pianificazione basate su ordini di grandezza tipici del
> marketplace Apify e del pricing LLM. Vanno verificate contro il listino Apify e il listino
> del provider AI al momento dell'esecuzione, prima di approvare il budget.** Il sistema
> misura comunque i costi reali (`cost_events`) e il primo test da 20 studi serve
> esattamente a sostituire queste stime con numeri veri.

**Ipotesi di lavoro (da validare nel test da 20):**

| Voce | Ipotesi |
|---|---|
| Discovery Google Maps | ~4 € / 1.000 risultati |
| Discovery SERP | ~2,5 € / 1.000 risultati |
| Site crawling | ~1 € / 1.000 pagine |
| Piattaforma Apify | piano a canone mensile, ammortizzato sul pilot |
| LLM input | ~3 $ / M token |
| LLM output | ~15 $ / M token |
| Token medi per studio | ~14.000 in / ~1.800 out (5 task) |

**Stima per fase:**

| Fase | Candidati | Studi crawlati | Pagine | Apify (€) | AI (€) | Totale (€) |
|---|---:|---:|---:|---:|---:|---:|
| TEST 20 | ~60 | 20 | ~240 | ~2 | ~2 | **~4** |
| TEST 100 | ~300 | 100 | ~1.200 | ~8 | ~10 | **~18** |
| PILOT 500 | ~1.500 | ~700 | ~8.400 | ~45 | ~70 | **~115** |
| **Totale pilot** | | | | **~55** | **~82** | **~140** |

Più il canone della piattaforma Apify per il periodo del pilot.

**Metriche di costo da produrre (obbligatorie, §28 del brief):**

```sql
-- costo per record qualificato
SELECT sum(cost_eur) / count(DISTINCT f.id)
FROM cost_events ce JOIN firms f ON f.id = ce.firm_id
WHERE f.status = 'QUALIFIED';

-- costo per record ELITE/HOT generato  ← metrica decisionale
SELECT sum(ce.cost_eur) / NULLIF(count(DISTINCT f.id) FILTER
  (WHERE f.partner_class IN ('ELITE','HOT')), 0)
FROM cost_events ce JOIN firms f ON f.id = ce.firm_id;
```

Le altre metriche richieste (pagine medie per studio, token medi, % siti validi,
% record scartati) sono query dirette su `crawl_runs`, `enrichment_runs`, `firms.status`.

**Soglia di allarme:** se il costo per record ELITE/HOT supera **1,50 €**, il collo di
bottiglia non è il prezzo unitario ma la *precision della discovery*: si interviene sul
keyword set, non sul budget.

---

## 6. Rate limiting, cortesia e resilienza

| Parametro | Valore pilot |
|---|---|
| Concorrenza per dominio | 1 |
| Delay fra richieste stesso dominio | 1.500 ms |
| Concorrenza globale crawler | 5 domini |
| Timeout richiesta | 20 s |
| Retry per pagina | 2, backoff esponenziale |
| Max redirect | 3 |
| Rispetto `robots.txt` | **sempre**, cache per dominio 24 h |
| Rispetto `Crawl-delay` | sì, se dichiarato e > 1.500 ms |
| User-Agent | identificativo, con URL di contatto |
| Finestra oraria | nessuna restrizione, ma concorrenza bassa per non pesare sui siti |

**Gestione fallimenti:** un dominio che fallisce non blocca il run. Va in
`crawl_runs.status = 'FAILED'` e resta ripescabile con un run mirato. La pipeline non
"insiste": due tentativi e si passa oltre.

---

## 7. Idempotenza e ripartenza

- Ogni run Apify è tracciato con `apify_run_id` in `crawl_runs`;
- i dataset Apify sono scaricati e persistiti su Postgres: la fonte di verità è il DB,
  non lo storage Apify (che ha retention limitata);
- ri-eseguire uno stage su record già processati è **no-op** (upsert su chiave naturale
  + `content_hash` invariato ⇒ nessuna nuova chiamata AI);
- un re-run dopo mesi rileva `content_hash` diverso ⇒ ri-arricchisce solo quei domini,
  scrive `firm_field_history` e crea un nuovo `scores` marcando il precedente `superseded_at`.

---

## 8. Rischi specifici di questa architettura

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Actor di Store deprecato o schema modificato | Blocco discovery | Adapter con contratto stabile + test di contratto su ogni run |
| Costi Apify diversi dalle stime | Sforamento budget | Cap di budget con kill-switch; validazione reale nel test da 20 |
| Bassa precision della discovery (troppi non-studi) | Spreco AI | Gate di qualificazione **prima** dell'LLM; pre-filtro lessicale a costo zero |
| Saturazione SERP sui grandi aggregatori | Poca varietà di studi | Segmentazione per zone urbane + cluster 3/4 pesati |
| Molti studi senza sito o con sito povero | Dati insufficienti | `LOW_DATA_CONFIDENCE` + classe REVIEW, non esclusione automatica |
| Siti che vietano il crawling | Copertura ridotta | Rispetto integrale; record marcato `blocked`, valutato sui soli dati di discovery |
| Duplicazione fra Google Maps e SERP | Costi doppi | Dedup prima del crawling: **si crawla solo dopo il dedup** |

---

## 9. Checklist pre-esecuzione (da spuntare prima del test da 20)

- [ ] Actor di discovery selezionati, pricing verificato sul listino corrente
- [ ] `robots.txt` compliance verificata nella configurazione dell'Actor di crawling
- [ ] User-Agent e pagina di contatto del bot definiti e pubblicati
- [ ] Cap di budget impostato per ogni stage (`max_cost_eur`)
- [ ] Keyword set `COMMERCIALISTA_B2B_V1` congelato e versionato in `config/`
- [ ] Matrice territori del test da 20 definita (10 LOM / 5 LAZ / 5 PUG)
- [ ] Schema DB migrato, `score_versions` popolata con `AI_DA_FARE_PARTNER_SCORE_V1`
- [ ] Cost ledger attivo e verificato su un run di prova
- [ ] Registro dei trattamenti e informativa aggiornati (vedi `DATA_COMPLIANCE.md`)
