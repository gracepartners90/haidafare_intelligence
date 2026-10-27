/**
 * Élite Experience — richieste dei moduli del sito → Google Sheets
 *
 * Installazione (una volta, da computer, con un account che può modificare il foglio;
 * meglio il proprietario: lo script scrive e invia l'avviso a nome di chi lo pubblica):
 * 1. Aprire il foglio «Lead - Élite Experience» → Estensioni → Apps Script.
 * 2. Cancellare il contenuto di Codice.gs e incollare questo file. Salvare.
 * 3. Esegui il deployment → Nuovo deployment → tipo «App web».
 *    Esegui come: Me · Chi ha accesso: Chiunque. Autorizzare quando richiesto.
 * 4. Copiare l'URL dell'app web (finisce con /exec) e inserirlo nel sito:
 *    src/config.js → forms.endpoint.
 *
 * Ogni richiesta diventa una riga nella scheda «Richieste sito» (creata alla prima
 * richiesta; per usare un'altra scheda basta cambiare SCHEDA qui sotto). Le colonne si
 * possono riordinare: i dati vengono scritti in base al nome della colonna nella prima
 * riga. Le colonne di lavoro (chiamate, note, esito) restano vuote per il team.
 */
const SCHEDA = 'Richieste sito';
const AVVISO_EMAIL = 'info@elitexperience.it'; // lasciare '' per non ricevere l'avviso

const COLONNE = [
  'DATA', 'TIPO RICHIESTA', 'NOME', 'COGNOME', 'SALONE', 'CITTÀ', 'EMAIL', 'TELEFONO',
  'RUOLO', 'ESPERIENZA HAIR SPA', 'CORSO DI INTERESSE', 'DOVE', 'PARTECIPANTI', 'PERIODO',
  'AZIENDA', 'TIPO DI COLLABORAZIONE', 'PAESE', 'MESSAGGIO', 'PAGINA',
  '1° CHIAMATA', '2° CHIAMATA', '3° CHIAMATA', 'NOTE', 'ESITO',
];

// Colonna del foglio → nome del campo nel modulo del sito
const CAMPI = {
  'TIPO RICHIESTA': 'tipo', NOME: 'nome', COGNOME: 'cognome', SALONE: 'salone', 'CITTÀ': 'citta',
  EMAIL: 'email', TELEFONO: 'telefono', RUOLO: 'ruolo', 'ESPERIENZA HAIR SPA': 'esperienza',
  'CORSO DI INTERESSE': 'corso', DOVE: 'modalita', PARTECIPANTI: 'partecipanti', PERIODO: 'periodo',
  AZIENDA: 'azienda', 'TIPO DI COLLABORAZIONE': 'tipologia', PAESE: 'paese', MESSAGGIO: 'messaggio',
  PAGINA: 'pagina',
};

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Campo trappola anti-spam: invisibile alle persone, compilato solo dai bot
  if (p.sito_web) return risposta({ ok: true });
  if (!p.privacy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email || '')) return risposta({ ok: false });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const foglio = scheda();
    const intestazioni = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0].map(nome);
    foglio.appendRow(intestazioni.map((h) => (h === 'DATA' ? new Date() : pulisci(p[CAMPI[h]]))));
  } finally {
    lock.releaseLock();
  }
  if (AVVISO_EMAIL) avvisa(p);
  return risposta({ ok: true });
}

// Verifica rapida dal browser: aprendo l'URL dell'app web compare «ok»
function doGet() {
  return ContentService.createTextOutput('ok');
}

// La scheda delle richieste: creata se manca; se è vuota riceve le intestazioni; se ha già le sue
// colonne, quelle dei dati del sito che mancano vengono aggiunte in fondo (nessun dato va perso)
function scheda() {
  const file = SpreadsheetApp.getActiveSpreadsheet();
  const foglio = file.getSheetByName(SCHEDA) || file.insertSheet(SCHEDA);
  if (foglio.getLastColumn() === 0) {
    foglio.getRange(1, 1, 1, COLONNE.length).setValues([COLONNE]).setFontWeight('bold');
    foglio.setFrozenRows(1);
    return foglio;
  }
  const presenti = foglio.getRange(1, 1, 1, foglio.getLastColumn()).getValues()[0].map(nome);
  const mancanti = ['DATA'].concat(Object.keys(CAMPI)).filter((c) => presenti.indexOf(c) < 0);
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

function avvisa(p) {
  try {
    const righe = Object.keys(CAMPI)
      .filter((h) => p[CAMPI[h]])
      .map((h) => `${h}: ${String(p[CAMPI[h]]).slice(0, 3000)}`);
    MailApp.sendEmail({
      to: AVVISO_EMAIL,
      replyTo: p.email,
      subject: `Nuova richiesta dal sito — ${p.tipo || 'Contatti'}: ${p.nome || ''} ${p.cognome || ''}`.trim(),
      body: `${righe.join('\n')}\n\nLa richiesta è stata salvata nella scheda «${SCHEDA}».`,
    });
  } catch (err) {
    console.error(err);
  }
}

function risposta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
