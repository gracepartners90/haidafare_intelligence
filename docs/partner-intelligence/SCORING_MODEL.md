# AI DA FARE PARTNER INTELLIGENCE — SCORING MODEL

**Versione:** `AI_DA_FARE_PARTNER_SCORE_V1`
**Stato:** DRAFT — in attesa di approvazione
**Natura:** deterministica. L'LLM produce *segnali*; il punteggio è calcolato da codice.

---

## 0. Cosa misura questo score

Non misura la qualità dello studio. Non misura il fatturato, la reputazione o la bravura
professionale. Misura una sola cosa:

> **la probabilità che questo studio diventi un partner commerciale utile per AI DA FARE.**

Uno studio eccellente ma focalizzato su persone fisiche e successioni prende un punteggio
basso, ed è corretto così. Uno studio medio con 400 PMI in portafoglio e una pagina sulla
Transizione 5.0 prende un punteggio alto, ed è altrettanto corretto.

---

## 1. Struttura del punteggio

| Componente | Peso | Domanda commerciale a cui risponde |
|---|---:|---|
| **A — Portafoglio PMI** | 0–25 | Ha clienti impresa a cui AI DA FARE può arrivare? |
| **B — Struttura dello studio** | 0–15 | È una struttura o una persona sola? |
| **C — Digital Maturity** | 0–15 | È ingaggiabile e capace di veicolare un servizio digitale? |
| **D — Innovazione / AI** | 0–15 | Parla già il nostro linguaggio? |
| **E — Servizi consulenziali evoluti** | 0–15 | Vende già consulenza a valore, non solo adempimenti? |
| **F — Capacità distributiva** | 0–10 | Quanti clienti può realisticamente raggiungere? |
| **G — Facilità di contatto** | 0–5 | Possiamo parlarci domani? |
| **TOTALE** | **100** | |

La componente A pesa un quarto del totale perché è il **discriminante primario**: senza
portafoglio PMI, tutto il resto è irrilevante ai fini della partnership.

---

## 2. Componente A — Portafoglio PMI (0–25)

| Indicatore | Punti | Come si rileva |
|---|---:|---|
| `works_with_pmi = true` con evidenza esplicita | 8 | AI + keyword matrix su linguaggio orientato alle imprese |
| `apparent_target = 'PMI'` o `'MISTO'` con prevalenza imprese | 5 | AI (`classify_firm`) |
| Servizi societari presenti (`CORPORATE`) | 3 | `firm_services` |
| Business advisory presente (`BUSINESS_ADVISORY`) | 4 | `firm_services` |
| Evidenza di consulenza continuativa (non solo adempimenti) | 3 | AI, evidenza testuale ("assistenza continuativa", "affianchiamo l'imprenditore") |
| Riferimenti espliciti a settori industriali / casi impresa | 2 | keyword matrix |
| **Massimo** | **25** | |

**Contro-indicatori (sottraggono all'interno della componente, minimo 0):**

| Contro-indicatore | Punti |
|---|---:|
| `PRIVATE_CLIENT` presente **e** nessun servizio advisory/growth | −8 |
| `apparent_target = 'PRIVATI'` | −10 |
| Linguaggio prevalente su 730 / dichiarazioni / persone fisiche | −5 |

---

## 3. Componente B — Struttura (0–15)

| Indicatore | Punti |
|---|---:|
| `studio_type ∈ {STUDIO_ASSOCIATO, STP, STUDIO_MULTIDISCIPLINARE, SOCIETA_DI_CONSULENZA}` | 4 |
| `num_professionals_detected ≥ 3` | 3 |
| `num_professionals_detected ≥ 8` | +2 (cumulativo con il precedente) |
| `num_partners_detected ≥ 2` | 3 |
| `num_locations ≥ 2` | 2 |
| Pagina team strutturata con ruoli espliciti | 1 |
| **Massimo** | **15** |

**Nota:** `num_professionals_detected` è *rilevato*, non *dichiarato*. Se lo studio scrive
"oltre 30 professionisti" ma la pagina team ne mostra 4, si usa il rilevato e si registra la
discrepanza in `data_quality_notes`. La dimensione dichiarata non è verificabile.

---

## 4. Componente C — Digital Maturity (0–15)

| Indicatore | Punti |
|---|---:|
| Sito proprio funzionante, non landing generica | 3 |
| `last_visible_update` entro 12 mesi | 3 |
| Blog o sezione news presente | 2 |
| `content_activity ∈ {regular, intense}` | 2 |
| LinkedIn aziendale presente | 2 |
| Form di contatto o strumenti di prenotazione | 1 |
| Pagine servizi dedicate (≥ 4) invece di elenco unico | 2 |
| **Massimo** | **15** |

**Vincolo anti-vetrina (P: "non permettere che uno score elevato derivi esclusivamente da un
bel sito"):** la componente C **non può superare** la somma (A + E) / 2. Un sito bellissimo
senza sostanza consulenziale né portafoglio imprese viene automaticamente compresso.

```python
C = min(C, (A + E) / 2)
```

---

## 5. Componente D — Innovazione / AI (0–15)

| Indicatore | Punti |
|---|---:|
| `publishes_ai_content = true` (articoli su AI) | 4 |
| `talks_about_ai = true` (menzioni senza contenuti dedicati) | 2 |
| `offers_transition_50 = true` | 3 |
| `offers_transition_40 = true` (industria 4.0) | 2 |
| `offers_digitalization = true` | 2 |
| `offers_startup_services = true` | 2 |
| Menzione esplicita di AI Act / AI governance / AI literacy | +3 (bonus) |
| **Massimo** | **15** |

`ai_governance_relevance` (0–100) è calcolato separatamente come indicatore
**qualitativo** per il commerciale e non somma punti due volte: entra in D solo tramite il
bonus AI Act.

---

## 6. Componente E — Servizi consulenziali evoluti (0–15)

| Servizio rilevato | Punti |
|---|---:|
| `FINANCE_AGEVOLATA` | 4 |
| `CONTROL_MGMT` | 3 |
| `STRATEGY` (strategia / organizzazione) | 2 |
| `COMPLIANCE` (231, whistleblowing) | 2 |
| `GDPR` | 2 |
| `ESG` | 2 |
| `CYBERSEC` | 1 |
| `STARTUP` | 1 |
| `CORPORATE_FINANCE` | 1 |
| **Massimo** | **15** (cap) |

`FINANCE_AGEVOLATA` è il servizio con il peso singolo più alto del modello: chi gestisce
bandi e incentivi ha già (a) un rapporto consulenziale attivo con l'impresa, (b) abitudine
a vendere progetti e non ore, (c) un ciclo commerciale compatibile con l'offerta AI DA FARE.

---

## 7. Componente F — Capacità distributiva (0–10)

| Indicatore | Punti |
|---|---:|
| `estimated_team_size ≥ 11-20` | 3 |
| `estimated_team_size ≥ 21-50` | +1 |
| `geographic_coverage ∈ {regionale, nazionale}` | 2 |
| `num_locations ≥ 2` | 1 |
| Appartenenza dichiarata a network professionali | 2 |
| Produzione di contenuti verso clienti (newsletter, webinar, eventi) | 2 |
| **Massimo** | **10** |

Anche `estimated_distribution_capacity` (`low/medium/high`) è prodotto dall'AI come
sintesi qualitativa e serve al commerciale, ma i punti derivano dagli indicatori
osservabili sopra, non dal giudizio dell'LLM.

---

## 8. Componente G — Facilità di contatto (0–5)

| Indicatore | Punti |
|---|---:|
| Email pubblica dello studio | 2 |
| Telefono | 1 |
| Decision maker identificato con nome e ruolo | 1 |
| LinkedIn aziendale o del decision maker | 1 |
| **Massimo** | **5** |

---

## 9. OVERRIDING RULES

Le regole di override si applicano **dopo** la somma delle componenti, in quest'ordine.
Ogni override applicato è registrato in `scores.applied_overrides`.

| # | Condizione | Effetto |
|---|---|---|
| **OR-1** | `works_with_pmi = false` | `partner_score = min(score, 65)` |
| **OR-2** | `works_with_pmi IS NULL` (non determinabile) | `partner_score = min(score, 70)` **e** `review_required = true` |
| **OR-3** | Studio apparentemente focalizzato solo su privati (`apparent_target='PRIVATI'` **oppure** `PRIVATE_CLIENT` senza servizi advisory/growth) | `partner_score = min(score, 45)` — penalizzazione forte |
| **OR-4** | Nessun contatto professionale identificabile (né email, né telefono, né form) | `partner_score −= 15` **e** `partner_class = max(class, 'B')` (non può essere ELITE/HOT) |
| **OR-5** | Nessun sito / presenza digitale minima | **non escludere.** `low_data_confidence = true`, `partner_score = min(score, 60)`, `partner_class = 'REVIEW'` se `confidence_score < 60` |
| **OR-6** | `confidence_score < 60` | `partner_class = 'REVIEW'` indipendentemente dallo score |
| **OR-7** | Score ≥ 80 **e** `confidence_score < 75` | declassamento a `A` + `review_required = true` (nessun HOT/ELITE su dati deboli) |
| **OR-8** | Record non coerente con il target (CAF, patronato, agenzia pratiche, consulente del lavoro puro, società non professionale) | `partner_class = 'EXCLUDE'`, `status = 'EXCLUDED'` |
| **OR-9** | `overlap_risk = 'high'` (lo studio vende già servizi direttamente concorrenti) | `partner_score −= 10`, nota obbligatoria in `notes` |
| **OR-10** | Componente C > (A+E)/2 | C compressa (vincolo anti-vetrina, §4) |
| **OR-11** | Nessuna evidenza (`evidence IS NULL`) su > 40% dei segnali AI usati nello score | `review_required = true` |

**Ordine di applicazione:** OR-10 (dentro il calcolo) → somma → OR-1/2/3 (cap su PMI) →
OR-9 (overlap) → OR-4 (contatti) → OR-5 (no sito) → OR-6/7 (confidence) → OR-8 (esclusione,
prevale su tutto).

**Perché queste regole esistono:** senza di esse il modello premia la comunicazione invece
della sostanza commerciale. Il rischio concreto di un sistema del genere non è sbagliare
qualche punteggio: è consegnare al commerciale 50 studi con siti eleganti e nessun cliente
impresa, bruciando la fiducia nel dato al primo ciclo di outreach.

---

## 10. PARTNER CLASS

| Classe | Range | Significato operativo |
|---|---|---|
| **ELITE** | 90–100 | Studio prioritario. Possibile partnership strategica. Contatto diretto, approccio personalizzato. |
| **HOT** | 80–89 | Fit elevato. Da contattare rapidamente. |
| **A** | 70–79 | Buon potenziale. Seconda ondata. |
| **B** | 60–69 | Interessante, non prioritario. Nurturing. |
| **C** | < 60 | Database generale. Nessun outreach attivo nel pilot. |
| **REVIEW** | — | Dati insufficienti o ambigui. Richiede verifica umana prima di qualsiasi uso. |
| **EXCLUDE** | — | Non coerente con il target. Resta a DB con `exclusion_reason` per non essere riscoperto. |

`REVIEW` ed `EXCLUDE` non sono fasce di punteggio: sono **stati** che prevalgono sulla fascia.

---

## 11. DATA CONFIDENCE SCORE (0–100)

Ortogonale al partner score. Misura *quanto ci si può fidare del record*, non quanto vale.

| Fattore | Punti |
|---|---:|
| Sito ufficiale disponibile e crawlato con successo | 25 |
| ≥ 3 fonti indipendenti concordanti | 15 |
| Pagina team rilevata con professionisti estratti | 12 |
| Contatti verificabili (email dominio proprietario + telefono) | 12 |
| Coerenza fra fonti (nome, indirizzo, telefono concordanti) | 12 |
| Informazioni recenti (`last_visible_update` < 12 mesi) | 10 |
| Evidenze dirette su ≥ 70% dei segnali AI | 14 |
| **Totale** | **100** |

**Penalità:**

| Condizione | Punti |
|---|---:|
| Crawling bloccato (robots/CAPTCHA/403) | −20 |
| Contraddizioni fra fonti non risolte | −15 |
| Solo dati di discovery (nessun sito) | −35 |
| Segnali AI con `confidence < 0.6` su campi che entrano nello score | −10 |

**Classi:**

| Classe | Range |
|---|---|
| VERY_HIGH | 90–100 |
| HIGH | 75–89 |
| MEDIUM | 60–74 |
| REVIEW | < 60 |

---

## 12. COMMERCIAL PRIORITY

Combina score e confidence in una singola indicazione operativa per il commerciale:

| | conf ≥ 75 | conf 60–74 | conf < 60 |
|---|---|---|---|
| **score ≥ 90** | **P1** | P2 | REVIEW |
| **score 80–89** | **P1** | P2 | REVIEW |
| **score 70–79** | P2 | P3 | REVIEW |
| **score 60–69** | P3 | P4 | REVIEW |
| **score < 60** | P4 | NONE | REVIEW |

---

## 13. PARTNER MODEL — suggerimento, non decisione

L'AI propone **uno** dei modelli seguenti. È un suggerimento commerciale: la decisione
resta umana.

| Modello | Profilo tipico |
|---|---|
| `REFERRAL_PARTNER` | Studio con portafoglio PMI, capacità distributiva media/alta, nessuna ambizione di erogare il servizio. **Default per la maggior parte degli ELITE/HOT.** |
| `RESELLER` | Studio strutturato che già vende progetti a pacchetto (finanza agevolata, 4.0/5.0) e può includere l'offerta nel proprio catalogo. |
| `ADVISORY_PARTNER` | Studio con competenze compliance/GDPR/ESG: co-progettazione su AI Governance e AI Act. |
| `INSTITUTIONAL_PARTNER` | Network, STP di grandi dimensioni, studi con ruolo associativo/ordinistico: accordo quadro. |
| `LEAD_SHARING` | Struttura media, contatto identificato, scambio bidirezionale di segnalazioni. |
| `CO_MARKETING` | Studio con forte content activity e audience propria: webinar, contenuti congiunti. |
| `LOW_PRIORITY` | Classe B/C, oppure overlap alto, oppure dati insufficienti. |

Regole indicative (deterministiche, poi rifinite dall'LLM con motivazione):

```
if class in (ELITE,HOT) and offers_compliance and (offers_gdpr or offers_esg): ADVISORY_PARTNER
elif class in (ELITE,HOT) and offers_finanza_agevolata and team>=11:            RESELLER
elif studio_type in (STP,NETWORK) and team>=21:                                 INSTITUTIONAL_PARTNER
elif class in (ELITE,HOT):                                                      REFERRAL_PARTNER
elif class == A and content_activity in (regular,intense):                       CO_MARKETING
elif class in (A,B):                                                             LEAD_SHARING
else:                                                                            LOW_PRIORITY
```

---

## 14. COMMERCIAL SUMMARY

### 14.1 `WHY AI DA FARE SHOULD CONTACT THIS FIRM` (max 500 caratteri)

Vincoli di generazione:
- **solo fatti presenti nei segnali con evidenza**. Nessuna aggettivazione non supportata;
- struttura: struttura dello studio → target clienti → servizi rilevanti → segnale digitale/innovazione → complementarità;
- niente superlativi generici ("eccellente realtà"), niente numeri non rilevati;
- se un dato non c'è, non si nomina (non si scrive "team non identificato").

Esempio conforme:

> "Studio associato con circa 12 professionisti, clientela prevalentemente PMI e servizi di
> consulenza aziendale, finanza agevolata e Transizione 5.0. Forte presenza digitale e
> contenuti su innovazione. Buona capacità distributiva e forte complementarità con AI DA FARE."

### 14.2 `SUGGESTED APPROACH`

Indicazione operativa per il primo contatto, coerente con `likely_partner_model`.

> "Proporre partnership referral con focus AI Act + AI Literacy per il portafoglio PMI."

Il summary viene generato **solo** per record con `partner_score ≥ 60` e
`confidence_score ≥ 60`: sotto quelle soglie sarebbe testo commerciale su dati non
affidabili, cioè un danno.

---

## 15. Pseudocodice di riferimento

```python
def compute_score(firm: FirmSignals, cfg: ScoreConfig) -> ScoreResult:
    A = component_pmi(firm)              # 0-25, con contro-indicatori
    B = component_structure(firm)        # 0-15
    C = component_digital(firm)          # 0-15
    D = component_innovation(firm)       # 0-15
    E = component_advanced_services(firm)# 0-15
    F = component_distribution(firm)     # 0-10
    G = component_contactability(firm)   # 0-5

    C = min(C, (A + E) / 2)              # OR-10 anti-vetrina
    raw = round(A + B + C + D + E + F + G)
    score, overrides = raw, []

    if firm.works_with_pmi is False:
        score = min(score, 65); overrides.append("OR-1")
    elif firm.works_with_pmi is None:
        score = min(score, 70); overrides.append("OR-2")

    if is_private_focused(firm):
        score = min(score, 45); overrides.append("OR-3")

    if firm.overlap_risk == "high":
        score -= 10; overrides.append("OR-9")

    if not has_any_contact(firm):
        score -= 15; overrides.append("OR-4")

    if not firm.has_website:
        score = min(score, 60)
        firm.low_data_confidence = True
        overrides.append("OR-5")

    score = max(0, min(100, score))
    conf  = compute_confidence(firm)
    cls   = classify(score, conf, firm, overrides)   # applica OR-4/6/7/8

    return ScoreResult(
        score_version="AI_DA_FARE_PARTNER_SCORE_V1",
        partner_score=score, raw_score=raw, partner_class=cls,
        confidence_score=conf, confidence_class=conf_class(conf),
        components={"A":A,"B":B,"C":C,"D":D,"E":E,"F":F,"G":G},
        applied_overrides=overrides,
        explanation=render_explanation(...),   # testo deterministico, non LLM
    )
```

`explanation` è **generata da template deterministico** ("A=21/25 per: works_with_pmi
(evidenza: …), business advisory, servizi societari"). L'LLM può riscriverla in prosa per
il commerciale, ma la versione autoritativa resta quella deterministica: uno score deve
essere sempre difendibile davanti a chi lo contesta.

---

## 16. Esempi di calibrazione

### Esempio 1 — ELITE (score 92, conf 94)
STP con 18 professionisti, 2 sedi (Milano + Bergamo), pagine dedicate a finanza agevolata,
controllo di gestione, Transizione 5.0, blog attivo con 3 articoli su AI e digitalizzazione,
LinkedIn aziendale con pubblicazioni recenti, managing partner identificato con email
pubblica.
`A=24 B=14 C=14 D=14 E=13 F=9 G=5 → 93 → 92` (nessun override).
Modello: `RESELLER`.

### Esempio 2 — La soglia degli 80 (perché serve la componente D)
Studio associato, 8 professionisti, forte orientamento PMI, finanza agevolata e controllo di
gestione, sito aggiornato ma **senza blog e senza alcun contenuto su innovazione**, contatti
completi.
`A=23 B=11 C=9 D=4 E=11 F=6 G=5 → 69` ⇒ classe **B**.

Stesso studio, con blog attivo, articoli su digitalizzazione e Transizione 5.0, copertura
regionale: `A=23 B=11 C=12 D=12 F=8 E=11 G=5 → 82` ⇒ classe **HOT**.

Il delta è tutto nella componente D e nella content activity. È voluto: uno studio che non
parla mai di innovazione richiederà un lavoro di evangelizzazione che ne abbassa la
probabilità di conversione a partner, per quanto solido sia il portafoglio.

### Esempio 3 — Override OR-3 (score 45)
Studio individuale con sito curatissimo, servizi 730/IMU/successioni, nessun cliente
impresa evidente.
`A=2 B=3 C=13 D=1 E=1 F=2 G=4 → 26`, poi C compressa a 1.5 → `14`. Classe C.
Il bel sito non ha prodotto alcun vantaggio: esattamente l'effetto desiderato.

### Esempio 4 — LOW DATA CONFIDENCE
Studio trovato su Google Maps, 22 recensioni, telefono e indirizzo, **nessun sito**.
`A=null B=? C=0 …` → score 38, `confidence = 30` → `partner_class = 'REVIEW'`,
`low_data_confidence = true`. **Non escluso**: potrebbe essere uno studio importante che
semplicemente non ha presenza web, verificabile a mano.

---

## 17. Validazione e calibrazione

Lo score V1 è una **ipotesi**, non una verità. Va validato:

1. **Regression set** (`tests/golden/`): 20 studi annotati a mano con la classe attesa. Ogni
   modifica al modello si valuta contro questo set.
2. **QA umana su 100 record** (vedi `PILOT_PLAN.md` §6): il revisore assegna una classe
   "umana" indipendente; si misura l'accordo (matrice di confusione + Cohen's κ).
3. **Feedback commerciale** (TOP 50): il tasso di risposta all'outreach è il vero test.
   Se gli ELITE non rispondono più degli A, il modello è sbagliato e va ricalibrato in V2.

**Trigger di passaggio a V2:** accordo umano < 75%, oppure `Hot Partner Yield` fuori dal
range 12–25%, oppure evidenza dal TOP 50 che la classe non correla con la risposta.

Il passaggio a V2 **non riscrive lo storico**: nuova riga in `score_versions`, ricalcolo
in `scores` con la nuova versione, confronto V1 vs V2 sulle stesse firms.
