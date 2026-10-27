/**
 * Élite Experience — richieste dei moduli del sito → Google Sheets + email
 *
 * Installazione (una volta, da computer, con un account che può modificare il foglio;
 * meglio il proprietario: lo script scrive e invia le email a nome di chi lo pubblica):
 * 1. Aprire il foglio «Lead - Élite Experience» → Estensioni → Apps Script.
 * 2. Cancellare il contenuto di Codice.gs e incollare questo file. Salvare.
 * 3. Esegui il deployment → Nuovo deployment → tipo «App web».
 *    Esegui come: Me · Chi ha accesso: Chiunque. Autorizzare quando richiesto.
 * 4. Copiare l'URL dell'app web (finisce con /exec) e inserirlo nel sito:
 *    src/config.js → forms.endpoint.
 * Per aggiornare lo script senza cambiare l'URL: Esegui il deployment → Gestisci
 * deployment → Modifica (matita) → Versione: Nuova versione → Esegui il deployment.
 *
 * Ogni richiesta diventa una riga nella scheda del suo modulo (creata alla prima
 * richiesta): «Sito - Info formazione», «Sito - Formazione in presenza»,
 * «Sito - Collaborazioni». Le colonne si possono riordinare: i dati vengono scritti
 * in base al nome della colonna nella prima riga. Per rinominare una scheda basta
 * cambiarne il nome qui sotto (SCHEDE). Le colonne di lavoro (chiamate, note, esito)
 * restano vuote per il team.
 *
 * Email: un avviso in HTML al team (AVVISO_EMAIL) e un riepilogo in HTML a chi ha
 * scritto (CONFERMA_CLIENTE). Rispondendo all'avviso si scrive al cliente; rispondendo
 * al riepilogo il cliente scrive al team. Allo stesso indirizzo parte al massimo un
 * riepilogo ogni 6 ore, così il modulo non può essere usato per tempestare qualcuno.
 */
const AVVISO_EMAIL = 'info@elitexperience.it'; // lasciare '' per non ricevere l'avviso
const CONFERMA_CLIENTE = true; // false per non inviare il riepilogo a chi scrive
const MITTENTE = 'Élite Experience';
const SITO = 'https://elitexperience.it';
const INSTAGRAM = 'https://www.instagram.com/elite_experienceacademy/';

const LAVORO = ['1° CHIAMATA', '2° CHIAMATA', '3° CHIAMATA', 'NOTE', 'ESITO'];

// Modulo del sito (campo «tipo») → scheda, colonne e testi delle email
const SCHEDE = {
  'Informazioni sulla formazione': {
    nome: 'Sito - Info formazione',
    colonne: ['DATA', 'NOME', 'COGNOME', 'SALONE', 'CITTÀ', 'EMAIL', 'TELEFONO', 'RUOLO', 'ESPERIENZA HAIR SPA', 'CORSO DI INTERESSE', 'MESSAGGIO', 'PAGINA'],
    oggetto: 'informazioni sulla formazione',
    conferma: 'abbiamo ricevuto la tua richiesta di informazioni sulla formazione Élite Experience.',
  },
  'Formazione in presenza': {
    nome: 'Sito - Formazione in presenza',
    colonne: ['DATA', 'NOME', 'COGNOME', 'SALONE', 'CITTÀ', 'EMAIL', 'TELEFONO', 'DOVE', 'PARTECIPANTI', 'PERIODO', 'MESSAGGIO', 'PAGINA'],
    oggetto: 'formazione in presenza',
    conferma: 'abbiamo ricevuto la tua richiesta per la formazione in presenza.',
  },
  'Collaborazioni professionali': {
    nome: 'Sito - Collaborazioni',
    colonne: ['DATA', 'NOME', 'COGNOME', 'AZIENDA', 'RUOLO', 'EMAIL', 'TELEFONO', 'TIPO DI COLLABORAZIONE', 'PAESE', 'MESSAGGIO', 'PAGINA'],
    oggetto: 'collaborazione professionale',
    conferma: 'abbiamo ricevuto la tua proposta di collaborazione.',
    etichette: { messaggio: 'Descrizione del progetto' },
  },
};
// Richieste da un modulo non previsto qui sopra: tutte le colonne in una scheda a parte
const ALTRE = {
  nome: 'Sito - Altre richieste',
  colonne: ['DATA', 'TIPO RICHIESTA', 'NOME', 'COGNOME', 'SALONE', 'CITTÀ', 'EMAIL', 'TELEFONO', 'RUOLO', 'ESPERIENZA HAIR SPA', 'CORSO DI INTERESSE', 'DOVE', 'PARTECIPANTI', 'PERIODO', 'AZIENDA', 'TIPO DI COLLABORAZIONE', 'PAESE', 'MESSAGGIO', 'PAGINA'],
  oggetto: 'richiesta dal sito',
  conferma: 'abbiamo ricevuto la tua richiesta.',
};

// Colonna del foglio → nome del campo nel modulo del sito
const CAMPI = {
  'TIPO RICHIESTA': 'tipo', NOME: 'nome', COGNOME: 'cognome', SALONE: 'salone', 'CITTÀ': 'citta',
  EMAIL: 'email', TELEFONO: 'telefono', RUOLO: 'ruolo', 'ESPERIENZA HAIR SPA': 'esperienza',
  'CORSO DI INTERESSE': 'corso', DOVE: 'modalita', PARTECIPANTI: 'partecipanti', PERIODO: 'periodo',
  AZIENDA: 'azienda', 'TIPO DI COLLABORAZIONE': 'tipologia', PAESE: 'paese', MESSAGGIO: 'messaggio',
  PAGINA: 'pagina',
};

// Campi mostrati nelle email, in quest'ordine (solo quelli compilati)
const ETICHETTE = {
  nome: 'Nome', cognome: 'Cognome', azienda: 'Azienda o ente', ruolo: 'Ruolo', salone: 'Salone',
  citta: 'Città', email: 'Email', telefono: 'Telefono', esperienza: 'Esperienza Hair Spa',
  corso: 'Corso di interesse', modalita: 'Dove', partecipanti: 'Partecipanti', periodo: 'Periodo preferito',
  tipologia: 'Tipo di collaborazione', paese: 'Paese', messaggio: 'Messaggio',
};

// Colori del brand
const C = { ink: '#3D2416', choc: '#704D3F', muted: '#74574A', ivory: '#F5F0EB', sand: '#ECE3DA', beige: '#DED0C4', line: '#E4D9CF' };

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Campo trappola anti-spam: invisibile alle persone, compilato solo dai bot
  if (p.sito_web) return risposta({ ok: true });
  if (!p.privacy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '')) return risposta({ ok: false });

  const def = SCHEDE[p.tipo] || ALTRE;
  let foglio;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    foglio = scheda(def);
    const intestazioni = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0].map(nome);
    foglio.appendRow(intestazioni.map((h) => (h === 'DATA' ? new Date() : pulisci(p[CAMPI[h]]))));
  } finally {
    lock.releaseLock();
  }
  // La richiesta è già salvata: un problema con le email non la fa fallire
  const confermata = CONFERMA_CLIENTE && conferma(p, def);
  if (AVVISO_EMAIL) avvisa(p, def, foglio, confermata);
  return risposta({ ok: true });
}

// Verifica rapida dal browser: aprendo l'URL dell'app web compare «ok»
function doGet() {
  return ContentService.createTextOutput('ok');
}

// La scheda del modulo: creata se manca; se è vuota riceve le intestazioni; se ha già le sue
// colonne, quelle dei dati del sito che mancano vengono aggiunte in fondo (nessun dato va perso)
function scheda(def) {
  const file = SpreadsheetApp.getActiveSpreadsheet();
  const foglio = file.getSheetByName(def.nome) || file.insertSheet(def.nome);
  if (foglio.getLastColumn() === 0) {
    const tutte = def.colonne.concat(LAVORO);
    foglio.getRange(1, 1, 1, tutte.length).setValues([tutte]).setFontWeight('bold');
    foglio.setFrozenRows(1);
    return foglio;
  }
  const presenti = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0].map(nome);
  const mancanti = def.colonne.filter((c) => presenti.indexOf(c) < 0);
  if (mancanti.length) {
    foglio.getRange(1, foglio.getLastColumn() + 1, 1, mancanti.length).setValues([mancanti]).setFontWeight('bold');
  }
  return foglio;
}

// Nome di colonna confrontabile: senza spazi in più, maiuscolo
function nome(h) {
  return String(h).trim().toUpperCase();
}

// Testo semplice, lunghezza limitata; un valore che inizia con = + - @ non diventa una formula
function pulisci(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 3000);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

/* ---------- Email ---------- */

// Avviso al team: tutti i dati, pulsanti per rispondere, chiamare e aprire la scheda
function avvisa(p, def, foglio, confermata) {
  try {
    const chi = [testo(p.nome), testo(p.cognome)].join(' ').trim();
    const quando = Utilities.formatDate(new Date(), 'Europe/Rome', "dd/MM/yyyy 'alle' HH:mm");
    const link = SpreadsheetApp.getActiveSpreadsheet().getUrl() + '#gid=' + foglio.getSheetId();
    const tel = testo(p.telefono).replace(/[^\d+]/g, '');
    const pulsanti = [
      pulsante(`Rispondi a ${testo(p.nome) || 'chi ha scritto'}`, `mailto:${testo(p.email)}?subject=${encodeURIComponent('La tua richiesta a Élite Experience')}`, true),
      tel ? pulsante('Chiama', `tel:${tel}`) : '',
      pulsante('Apri la scheda nel foglio', link),
    ].join('');
    const html = pagina({
      anteprima: `${p.tipo || 'Richiesta'} da ${chi}`,
      etichetta: 'Nuova richiesta dal sito',
      titolo: esc(p.tipo || 'Richiesta dal sito'),
      corpo: `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${C.muted};">Ricevuta il ${esc(quando)} · salvata nella scheda «${esc(def.nome)}»</p>
        ${riepilogo(p, def)}
        <div style="margin:28px 0 4px;">${pulsanti}</div>`,
      piede: `Pagina di provenienza: ${esc(testo(p.pagina) || '—')}<br>Riepilogo inviato a chi ha scritto: ${confermata ? 'sì' : 'no'}`,
    });
    MailApp.sendEmail({
      to: AVVISO_EMAIL,
      replyTo: testo(p.email),
      name: 'Sito Élite Experience',
      subject: `Nuova richiesta dal sito — ${p.tipo || 'Contatti'}: ${chi}`,
      body: `${p.tipo || 'Richiesta dal sito'} — ${quando}\n\n${righeTesto(p, def)}\n\nScheda: ${def.nome}\n${link}`,
      htmlBody: html,
    });
  } catch (err) {
    console.error(err);
  }
}

// Riepilogo a chi ha scritto: ringraziamento e dati inviati
function conferma(p, def) {
  try {
    const email = testo(p.email).toLowerCase().slice(0, 200);
    const cache = CacheService.getScriptCache();
    if (cache.get('conferma:' + email) || MailApp.getRemainingDailyQuota() < 20) return false;
    const nomeCliente = testo(p.nome).slice(0, 60);
    const html = pagina({
      anteprima: 'Grazie, abbiamo ricevuto la tua richiesta.',
      etichetta: 'Richiesta ricevuta',
      titolo: 'Grazie per averci scritto.',
      corpo: `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${C.ink};">Ciao ${esc(nomeCliente)},<br>${esc(def.conferma)} Ti risponderemo al più presto.</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:${C.ink};">Qui sotto trovi il riepilogo di quello che ci hai inviato. Se vuoi aggiungere qualcosa, rispondi pure a questa email.</p>
        ${riepilogo(p, def)}
        <p style="margin:28px 0 0;font-size:16px;line-height:1.65;color:${C.ink};">A presto,<br><span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;">il team Élite Experience</span></p>`,
      piede: `<a href="${SITO}" style="color:${C.choc};text-decoration:underline;">elitexperience.it</a> · <a href="${INSTAGRAM}" style="color:${C.choc};text-decoration:underline;">Instagram</a><br>Hai ricevuto questa email perché hai inviato una richiesta dal sito di Élite Experience.`,
    });
    MailApp.sendEmail({
      to: email,
      replyTo: AVVISO_EMAIL || undefined,
      name: MITTENTE,
      subject: `Abbiamo ricevuto la tua richiesta · ${MITTENTE}`,
      body: `Ciao ${nomeCliente},\n${def.conferma} Ti risponderemo al più presto.\n\nIl riepilogo di quello che ci hai inviato:\n\n${righeTesto(p, def)}\n\nSe vuoi aggiungere qualcosa, rispondi pure a questa email.\n\nA presto,\nil team Élite Experience\n${SITO}`,
      htmlBody: html,
    });
    cache.put('conferma:' + email, '1', 6 * 3600);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// Valore di un campo come testo semplice, lunghezza limitata
function testo(v) {
  return String(v == null ? '' : v).trim().slice(0, 3000);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function campiCompilati(p, def) {
  return Object.keys(ETICHETTE)
    .filter((k) => testo(p[k]))
    .map((k) => [(def.etichette && def.etichette[k]) || ETICHETTE[k], testo(p[k])]);
}

function righeTesto(p, def) {
  return campiCompilati(p, def).map(([k, v]) => `${k}: ${v}`).join('\n');
}

// Tabella dei dati: etichetta sopra, valore sotto (si legge bene anche sul telefono)
function riepilogo(p, def) {
  const righe = campiCompilati(p, def).map(([k, v]) => `<tr><td style="padding:14px 0;border-top:1px solid ${C.line};">
      <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${C.muted};">${esc(k)}</div>
      <div style="margin-top:4px;font-size:16px;line-height:1.5;color:${C.ink};">${esc(v).replace(/\r?\n/g, '<br>')}</div>
    </td></tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-bottom:1px solid ${C.line};">${righe}</table>`;
}

function pulsante(etichetta, href, principale) {
  const stile = principale
    ? `background:${C.ink};color:#FFFFFF;border:1px solid ${C.ink};`
    : `background:#FFFFFF;color:${C.ink};border:1px solid ${C.beige};`;
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 10px 0;padding:12px 20px;border-radius:999px;${stile}font-size:14px;font-weight:600;text-decoration:none;">${esc(etichetta)}</a>`;
}

// Impaginazione comune: intestazione scura con il nome del brand, scheda chiara, piè di pagina
function pagina({ anteprima, etichetta, titolo, corpo, piede }) {
  return `<!doctype html>
<html lang="it">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(MITTENTE)}</title></head>
<body style="margin:0;padding:0;background:${C.sand};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(anteprima)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.ivory};border-radius:6px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">
        <tr><td style="background:${C.ink};padding:26px 28px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1;color:#FFFFFF;"><span style="font-style:italic;">Élite</span> <span style="font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:.32em;vertical-align:middle;">EXPERIENCE</span></div>
          <div style="margin-top:6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${C.beige};">Metodo e Formazione Hair Spa</div>
        </td></tr>
        <tr><td style="padding:32px 28px 28px;">
          <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${C.choc};font-weight:600;">${esc(etichetta)}</div>
          <h1 style="margin:10px 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;font-weight:normal;color:${C.ink};">${titolo}</h1>
          ${corpo}
        </td></tr>
        <tr><td style="padding:20px 28px 26px;border-top:1px solid ${C.line};font-size:12px;line-height:1.6;color:${C.muted};">${piede}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function risposta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
