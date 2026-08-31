# AI DA FARE PARTNER INTELLIGENCE — DATA & COMPLIANCE

**Versione:** 1.0
**Stato:** DRAFT — in attesa di approvazione **e di validazione legale**
**Approccio:** compliance-by-design. I limiti non sono raccomandazioni: sono vincoli
implementati nel codice.

> ⚠️ **Disclaimer.** Questo documento è un'analisi tecnico-organizzativa redatta da un team
> di progetto, non un parere legale. Prima dell'esecuzione del pilot va sottoposto al
> DPO / consulente privacy di riferimento, in particolare per: valutazione del legittimo
> interesse, modalità di assolvimento dell'informativa ex art. 14 GDPR, e verifica dei
> Termini di Servizio delle piattaforme utilizzate nella versione vigente alla data di
> esecuzione.

---

## 1. Perimetro del trattamento

**Titolare del trattamento:** AI DA FARE (l'organizzazione committente).
**Finalità:** prospezione commerciale B2B — individuazione di studi professionali italiani
potenzialmente interessati a una partnership commerciale.
**Categorie di interessati:** professionisti e titolari/soci di studi professionali,
in quanto **rappresentanti di un'organizzazione**, non in quanto persone fisiche private.
**Categorie di dati:** esclusivamente **dati professionali pubblicamente disponibili**
(ragione sociale, sede, recapiti dello studio, nome/ruolo/recapito professionale pubblicato,
servizi offerti, contenuti pubblicati).

**Fuori perimetro, in modo assoluto:**
- dati particolari ex art. 9 GDPR (salute, convinzioni, orientamenti, appartenenza sindacale, dati biometrici, vita sessuale);
- dati giudiziari ex art. 10 GDPR;
- dati relativi a persone fisiche in quanto consumatori;
- dati non pubblicati (recapiti privati, utenze personali, indirizzi di residenza);
- dati dedotti o inferiti su caratteristiche personali;
- qualsiasi dato relativo a **clienti** degli studi.

---

## 2. Base giuridica

**Legittimo interesse** (art. 6.1.f GDPR): l'interesse del titolare a individuare potenziali
partner commerciali B2B. È la base giuridica ordinaria per la prospezione B2B, ma richiede
una valutazione di bilanciamento documentata (LIA) e non è un lasciapassare.

### 2.1 Legitimate Interest Assessment (LIA) — sintesi

**a) Test di necessità.** L'individuazione di partner richiede di sapere quali studi
lavorano con PMI e su quali temi. Questa informazione è pubblicata dagli studi stessi
proprio per essere trovata da potenziali interlocutori professionali. Non esiste un mezzo
meno invasivo per ottenerla su scala (l'alternativa — contattare a freddo l'intero Albo — è
*più* invasiva, non meno).

**b) Test di bilanciamento.**

| Elemento | Valutazione |
|---|---|
| Natura dei dati | Professionali, pubblicati volontariamente dallo studio a fini commerciali |
| Aspettativa ragionevole dell'interessato | Alta: uno studio che pubblica "consulenza per PMI" si aspetta di essere contattato per proposte professionali |
| Impatto sull'interessato | Minimo: ricezione di una proposta di partnership B2B, con opt-out immediato |
| Categorie speciali | Nessuna |
| Scala | Contenuta e mirata (500 studi qualificati, non estrazione massiva) |
| Automatizzazione | Nessuna decisione produce effetti giuridici sull'interessato (art. 22 non applicabile) |
| **Esito** | Legittimo interesse **prevalente**, a condizione delle mitigazioni al §2.2 |

**c) Mitigazioni obbligatorie (§2.2).**
1. informativa ex art. 14 accessibile e menzionata nel primo contatto;
2. opt-out immediato e senza condizioni, con soppressione dal database di prospezione;
3. minimizzazione: si raccoglie solo quanto serve alla qualificazione commerciale;
4. nessun contatto personale usato fuori dalla finalità professionale;
5. retention limitata e documentata;
6. registro dei trattamenti aggiornato.

### 2.2 Il fatto che un dato sia pubblico non lo rende liberamente trattabile

Principio operativo del progetto: **"pubblico" ≠ "libero da vincoli"**. Un dato pubblicato
resta un dato personale quando riferito a persona fisica identificata o identificabile. Il
progetto tratta i dati riferiti a professionisti solo in quanto **punto di contatto
organizzativo**, e privilegia sempre il contatto generico dello studio (`info@`, `studio@`)
rispetto a quello nominativo quando entrambi sono disponibili.

---

## 3. Informativa (art. 14 GDPR)

I dati non sono raccolti presso l'interessato ⇒ si applica l'art. 14.

**Modalità di assolvimento proposta:**
1. **Pagina informativa pubblica permanente** sul sito AI DA FARE (es.
   `/privacy/partner-intelligence`), che descrive: titolare, finalità, base giuridica,
   categorie di dati, fonti (siti web pubblici, Google Business, directory pubbliche),
   destinatari, conservazione, diritti, opt-out.
2. **Link all'informativa nel primo contatto** (email/LinkedIn/telefono), come richiesto
   dall'art. 14.3.b — al più tardi al momento della prima comunicazione.
3. **Pagina del bot** raggiungibile dallo User-Agent del crawler, che spiega chi siamo,
   perché stiamo visitando il sito e come chiedere l'esclusione.

**Esenzione art. 14.5.b** (sforzo sproporzionato): non ci si appoggia a questa esenzione. Il
contatto commerciale avviene comunque, quindi l'informativa è dovuta e facile da fornire.

---

## 4. Diritti degli interessati

| Diritto | Implementazione |
|---|---|
| Accesso (art. 15) | Query per `firm_id` / nome: il record è esportabile in forma leggibile, incluse fonti e data di raccolta |
| Rettifica (art. 16) | Correzione via `reviews` + `firm_field_history` (tracciabile) |
| Cancellazione (art. 17) | `status = 'EXCLUDED'`, `exclusion_reason = 'DATA_SUBJECT_REQUEST'`, contatti e dati personali eliminati, **suppression list** che impedisce la riscoperta al run successivo |
| Opposizione (art. 21) | Opt-out immediato, senza motivazione richiesta; stesso meccanismo della cancellazione |
| Limitazione (art. 18) | Flag `processing_restricted` che esclude il record da export e CRM |

**Suppression list.** Tecnicamente indispensabile: una cancellazione senza suppression list
viene annullata dal run successivo, che riscopre lo stesso studio. La lista conserva il
**minimo indispensabile** (hash del dominio e del nome normalizzato) per la sola finalità di
non ricontattare.

```sql
CREATE TABLE suppression_list (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_hash   TEXT,
  name_key_hash TEXT,
  reason        TEXT NOT NULL,   -- 'OPT_OUT','ERASURE_REQUEST','MANUAL_EXCLUSION'
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  note          TEXT
);
```

---

## 5. Regole tecniche di raccolta (vincolanti)

### 5.1 Cosa il sistema fa

| # | Regola | Implementazione |
|---|---|---|
| C1 | Rispetta `robots.txt` e `<meta name="robots">` | Fetch + cache robots per dominio; percorso negato ⇒ non visitato |
| C2 | Rispetta `X-Robots-Tag` | Controllo header prima del parsing |
| C3 | Rate limit cortese | 1 concorrenza/dominio, ≥ 1.500 ms fra richieste, `Crawl-delay` rispettato se maggiore |
| C4 | User-Agent identificativo | `AIDAFARE-PartnerIntelligence/1.0 (+URL di contatto)` |
| C5 | Budget pagine limitato | 10–15 pagine/dominio |
| C6 | Solo contenuti pubblici e indicizzabili | Nessuna area riservata |
| C7 | Provenienza tracciata | `source_url`, `data_origin`, `retrieval_date` su ogni campo rilevante |
| C8 | Minimizzazione | Il testo grezzo delle pagine è conservato solo per la durata dell'arricchimento, poi ridotto a estratti + hash |
| C9 | Preferenza per contatti generici | `info@`/`studio@` preferiti a contatti nominativi |
| C10 | Nessun dato di terzi | I clienti degli studi eventualmente citati (case study, referenze) **non** vengono estratti |

### 5.2 Cosa il sistema NON fa mai

- ❌ **bypassare CAPTCHA** — rilevamento CAPTCHA ⇒ stop e `block_reason='captcha'`
- ❌ **aggirare login o paywall** — nessuna credenziale, nessuna sessione autenticata
- ❌ **aggirare anti-bot** — nessuna fingerprint evasion, nessuna rotazione mirata all'elusione di blocchi
- ❌ **scraping di aree riservate**
- ❌ **crawling di siti che lo vietano espressamente** nei ToS o in `robots.txt`
- ❌ **email guessing** — nessuna generazione di `nome.cognome@dominio`
- ❌ **scraping massivo dell'Albo nazionale**
- ❌ **raccolta di dati sensibili o giudiziari**
- ❌ **deduzione di informazioni private** (età, situazione familiare, patrimonio, orientamenti)
- ❌ **uso di contatti personali fuori da finalità professionale**
- ❌ **scraping di LinkedIn dietro login** — si conserva solo l'URL pubblico eventualmente linkato dallo studio

### 5.3 Enforcement nel codice, non nella policy

| Divieto | Guard rail tecnico |
|---|---|
| Email guessing | `contacts` CHECK `data_origin <> 'AI_INFERENCE'`; l'estrattore accetta solo stringhe **presenti** nel testo sorgente (verifica di substring obbligatoria prima dell'insert) |
| Aree riservate | `exclude_url_patterns` con `/area-riservata`, `/login`, `/area-clienti`, ecc. |
| CAPTCHA / anti-bot | Nessuna libreria di solving nel progetto; rilevamento ⇒ abort del dominio |
| robots.txt | Client HTTP che rifiuta l'URL se il parser robots nega — non è opzionale a runtime |
| Dati sensibili | Filtro lessicale in quality check: presenza di pattern riconducibili a dati particolari ⇒ campo scartato e `data_quality_notes` valorizzato |
| Albo massivo | Nessun Actor configurato su domini di Albo; l'accesso è manuale e puntuale |

---

## 6. Fonti: valutazione caso per caso

| Fonte | Uso previsto | Cautele |
|---|---|---|
| **Sito ufficiale dello studio** | Fonte primaria | robots.txt, rate limit, budget pagine |
| **Google Business / Maps** | Discovery | Solo tramite strumenti/Actor consentiti e nel rispetto dei ToS della piattaforma |
| **Google Search** | Discovery | Idem |
| **LinkedIn (pagine aziendali pubbliche)** | Solo URL, raccolto se linkato dal sito dello studio | **Mai** accesso autenticato, mai scraping di profili personali |
| **Directory professionali pubbliche** | Discovery secondaria | Verifica ToS della singola directory prima dell'uso; se vietano il crawling ⇒ non usate |
| **Ordini territoriali** | **Solo verifica puntuale** su record già selezionati | Nessuna estrazione massiva; consultazione compatibile con le condizioni del sito |
| **Articoli / stampa** | Contesto e segnali | Solo contenuti liberamente accessibili; nessuna riproduzione integrale |

**Nota sull'Albo.** L'Albo dei Dottori Commercialisti ed Esperti Contabili ha finalità di
pubblicità legale, non di marketing. Il suo utilizzo per estrazione massiva a fini
commerciali è problematico sia per la finalità originaria del trattamento sia per le
condizioni d'uso dei portali. Il progetto lo usa esclusivamente come **strumento di
verifica** su singoli record già individuati per altra via — che è anche la scelta
qualitativamente migliore (§3 del brief).

---

## 7. Conservazione (retention)

| Categoria di dato | Conservazione | Motivazione |
|---|---|---|
| Record studio qualificato (dati organizzativi) | 24 mesi dall'ultimo contatto o ultima verifica, poi revisione | Ciclo commerciale B2B |
| Contatti nominativi di professionisti | 24 mesi, rivisti a ogni re-run; eliminati se non più pubblicati | Minimizzazione |
| Testo grezzo delle pagine crawlate | **30 giorni** dopo l'arricchimento, poi solo estratti + `content_hash` | Minimizzazione (C8) |
| Record ELITE/HOT sincronizzati su CRM | Secondo la policy di retention del CRM | Il CRM ha finalità autonoma |
| Record EXCLUDED | Solo chiavi minime + motivo, a tempo indeterminato | Evitare la riscoperta e il ricontatto |
| Suppression list | A tempo indeterminato | Necessaria per onorare l'opt-out |
| Log tecnici e cost ledger | 12 mesi | Audit e controllo costi |

Il campo `next_review_at` implementa di fatto la revisione periodica: un record che nessuno
rivede e che nessuno contatta va in scadenza.

---

## 8. Sicurezza e accessi

- credenziali fuori dal repository (env / secret manager); `.gitignore` copre `.env`;
- accesso al DB con utenti a privilegi differenziati: `pipeline` (scrittura), `analyst`
  (lettura + review), `export` (sola lettura sulle viste);
- export contenenti contatti trattati come materiale riservato: nomi file tracciati in
  `exports`, distribuzione limitata alle persone coinvolte nell'outreach;
- nessun dato personale nei log applicativi (i log referenziano `firm_id`, non nomi);
- backup cifrati; accesso al database non esposto pubblicamente;
- se si usa un provider AI: verificare che sia in essere un **accordo sul trattamento dei
  dati (DPA)** e che i contenuti non siano usati per addestramento. Il contenuto inviato è
  comunque materiale pubblicato pubblicamente, ma il vincolo contrattuale va comunque
  formalizzato.

---

## 9. Trattamento tramite fornitori (responsabili ex art. 28)

| Fornitore | Ruolo | Adempimento |
|---|---|---|
| Apify | Responsabile del trattamento | DPA da verificare/sottoscrivere; verifica localizzazione dei dati |
| Provider AI (Anthropic e/o altri) | Responsabile del trattamento | DPA; verifica no-training sui dati inviati; verifica trasferimenti extra-UE e relative garanzie |
| Hosting DB | Responsabile | DPA; preferenza per hosting UE |
| Bitrix24 (fase CRM) | Responsabile | DPA già in essere presumibilmente; verificare |

**Trasferimenti extra-UE:** dove presenti, verificare le garanzie applicabili (clausole
contrattuali standard o meccanismo di adeguatezza vigente). Da confermare con il DPO.

---

## 10. Decisioni automatizzate (art. 22)

Il `partner_score` è un punteggio **su un'organizzazione**, non un profilo su persona
fisica, e non produce effetti giuridici né incide significativamente sull'interessato: il
suo unico effetto è determinare se AI DA FARE invia o meno una proposta commerciale.
L'art. 22 non trova applicazione.

Mitigazioni comunque adottate, per principio:
- lo score è **spiegabile** (`components`, `applied_overrides`, `explanation` deterministica);
- è prevista **review umana** obbligatoria per le classi operative (ELITE/HOT) e per i casi ambigui;
- nessuna classificazione automatica determina un'esclusione definitiva senza possibilità di revisione umana.

---

## 11. Registro dei trattamenti — voce da inserire

| Campo | Contenuto |
|---|---|
| Trattamento | Partner Intelligence — prospezione B2B studi professionali |
| Finalità | Individuazione e qualificazione di potenziali partner commerciali |
| Base giuridica | Legittimo interesse (art. 6.1.f), con LIA documentata |
| Categorie interessati | Professionisti/titolari di studi professionali (in qualità di rappresentanti dell'organizzazione) |
| Categorie dati | Dati professionali pubblici: denominazione, sede, recapiti dello studio, nome/ruolo/recapito professionale pubblicato, servizi, contenuti |
| Fonti | Siti web pubblici degli studi, Google Business, motori di ricerca, directory pubbliche |
| Destinatari | Team commerciale AI DA FARE; CRM (solo record selezionati) |
| Trasferimenti extra-UE | Da verificare per provider AI e cloud |
| Conservazione | Vedi §7 |
| Misure di sicurezza | Vedi §8 |

---

## 12. DPIA — valutazione preliminare

Una DPIA completa **non appare obbligatoria**: non c'è monitoraggio sistematico su larga
scala di persone fisiche, non ci sono categorie particolari, non ci sono decisioni con
effetti giuridici, la scala è contenuta (500 organizzazioni) e i dati sono professionali e
pubblici.

Tuttavia si raccomanda una **DPIA-lite documentata** (questo documento può esserne la base)
perché: c'è un trattamento sistematico e automatizzato, c'è uso di AI, e c'è raccolta da
fonti terze senza contatto diretto con l'interessato. La valutazione va ripetuta se il
progetto scala oltre le 5.000 organizzazioni o se si estende a categorie diverse.

---

## 13. Rischi di compliance e mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| Reclamo di uno studio per contatto non gradito | Media | Basso | Opt-out immediato + suppression list + informativa nel primo contatto |
| Violazione ToS di una piattaforma di discovery | Media | Medio | Uso di Actor consentiti, verifica ToS documentata prima del run, nessun aggiramento tecnico |
| Raccolta involontaria di dati personali non professionali | Media | Medio | Filtro in quality check + preferenza per contatti generici + revisione umana sul campione |
| Contatto verso indirizzo personale | Bassa | Medio | `is_professional` obbligatorio; export esclude contatti non professionali |
| Crawling percepito come aggressivo | Bassa | Basso | Rate limit conservativo, UA identificativo, pagina bot con contatto |
| Dati obsoleti usati per outreach | Media | Basso | `last_verified_at` + `next_review_at`; export blocca record oltre soglia di anzianità |
| Provider AI che addestra sui contenuti inviati | Bassa | Medio | DPA con clausola no-training; invio dei soli contenuti pubblici |

---

## 14. Checklist di conformità pre-lancio

**Documentale**
- [ ] LIA formalizzata e firmata dal titolare
- [ ] Informativa art. 14 pubblicata e raggiungibile
- [ ] Pagina del bot pubblicata con contatto per esclusione
- [ ] Registro dei trattamenti aggiornato con la voce §11
- [ ] DPA verificati/sottoscritti con Apify, provider AI, hosting
- [ ] Documento sottoposto al DPO / consulente privacy

**Tecnico**
- [ ] Parser `robots.txt` attivo e testato (test che dimostri il rifiuto di un percorso negato)
- [ ] Rate limit configurato e verificato
- [ ] User-Agent identificativo configurato
- [ ] CHECK `contacts_no_inference` presente in migrazione
- [ ] Verifica di substring obbligatoria sugli indirizzi estratti (test automatico)
- [ ] `suppression_list` implementata e integrata nella discovery
- [ ] Nessuna libreria di CAPTCHA-solving fra le dipendenze (verifica in CI)
- [ ] Retention del testo grezzo (30 gg) implementata come job schedulato
- [ ] Log privi di dati personali (verifica su campione)

**Processo**
- [ ] Procedura di gestione richieste interessati definita, con owner e SLA
- [ ] Template di primo contatto con link all'informativa e opt-out approvato
- [ ] Formazione minima al team commerciale sull'uso lecito del database

---

## 15. Principio di chiusura

Il progetto ha un vantaggio strutturale sul piano della conformità: **la strategia
qualitativa coincide con quella conforme.** Non serve estrarre massivamente l'Albo, non
serve entrare in aree riservate, non serve indovinare email — perché quei dati non
migliorano la qualità della selezione commerciale. Uno studio che vale la pena contattare
pubblica già tutto ciò che serve per capire se vale la pena contattarlo.

Se una tecnica di raccolta richiede di aggirare qualcosa, quasi sempre sta compensando una
strategia di targeting debole. La risposta corretta è migliorare il targeting.
