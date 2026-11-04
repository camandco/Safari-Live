/**
 * Safari Live sync script.
 * Receives ticks from the Safari Live tick app and writes them into the checklist tabs.
 * Install: Extensions > Apps Script, paste this file, then Deploy > New deployment > Web app,
 * Execute as: Me, Who has access: Anyone. Copy the web app URL.
 */

const TRIP_CODE = 'KRUGER26';
const TABS = ['Kruger Mammals', 'Kruger Birds', 'Pilanesberg Mammals', 'Pilanesberg Birds'];
const NAMES = ['Cam', 'Melissa', 'Keegan', 'Mark', 'Tracy'];
// Columns on each checklist tab (1-based)
const COL_SPECIES = 2;  // B
const COL_SEEN = 7;     // G
const COL_WHO = 8;      // H
const COL_AT = 9;       // I
const COL_GPS = 10;     // J

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (String(body.code || '').trim().toUpperCase() !== TRIP_CODE) return json({ ok: false, error: 'bad_code' });
    const items = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const results = items.map((it) => saveOne(ss, it));
    return json({ ok: true, results: results });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: 'Safari Live sync' });
}

function saveOne(ss, it) {
  const id = String(it.id || '');
  if (TABS.indexOf(it.tab) < 0) return { id: id, status: 'bad_tab' };
  if (NAMES.indexOf(it.who) < 0) return { id: id, status: 'bad_name' };
  const sh = ss.getSheetByName(it.tab);
  if (!sh) return { id: id, status: 'bad_tab' };
  const last = sh.getLastRow();
  const names = sh.getRange(1, COL_SPECIES, last, 1).getValues();
  let row = -1;
  for (let i = 0; i < names.length; i++) {
    if (String(names[i][0]).trim() === String(it.species).trim()) { row = i + 1; break; }
  }
  if (row < 0) return { id: id, status: 'not_found' };
  const seen = sh.getRange(row, COL_SEEN).getValue();
  if (seen === true) return { id: id, status: 'already' };
  const when = it.ts ? new Date(Number(it.ts)) : new Date();
  const gps = (typeof it.lat === 'number' && typeof it.lng === 'number') ? it.lat.toFixed(5) + ', ' + it.lng.toFixed(5) : '';
  sh.getRange(row, COL_SEEN, 1, 4).setValues([[true, it.who, when, gps]]);
  return { id: id, status: 'saved' };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
