// Fejezetenkénti visszajelzés: helyi sor (a haladásban, így exportálható) + küldés Firestore-ba REST-tel
// (nincs külső könyvtár). Apa oldala csak LÉTREHOZ bejegyzést; olvasni csak a kezelő tud (Firebase Auth).
// Hálózati hiba esetén a bejegyzés helyben vár, és később automatikusan újrapróbálódik.

import { FIREBASE } from './firebase-config.js?v=6bcb5a28';
import { getProgress, saveProgress } from './store.js?v=6bcb5a28';

export const MAX_TEXT = 500;
export const ERTEKEK = { igen: 'Igen', reszben: 'Részben', nem_ertem: 'Nem értem' };
export const COLLECTION = 'visszajelzesek';

export function isConfigured() { return !!(FIREBASE.projectId && FIREBASE.apiKey); }
export function docsUrl() {
  return 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(FIREBASE.projectId) + '/databases/(default)/documents';
}

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'fb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function list() {
  const p = getProgress();
  if (!Array.isArray(p.visszajelzesek)) p.visszajelzesek = [];
  return p.visszajelzesek;
}

// Egy fejezet visszajelzései, legújabb elöl.
export function feedbackFor(chapterId) {
  return list().filter((x) => x.fejezet === chapterId).sort((a, b) => (a.ido < b.ido ? 1 : -1));
}
export function pendingCount() { return list().filter((x) => !x.elkuldve).length; }

function toFields(x) {
  return {
    modul: { stringValue: x.modul },
    fejezet: { stringValue: x.fejezet },
    ertek: { stringValue: x.ertek },
    szoveg: { stringValue: x.szoveg || '' },
    ido: { timestampValue: x.ido },
    olvasva: { booleanValue: false },
    kezelve: { booleanValue: false },
  };
}

async function send(x) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 12000);
  try {
    const url = docsUrl() + '/' + COLLECTION + '?documentId=' + encodeURIComponent(x.id) + '&key=' + encodeURIComponent(FIREBASE.apiKey);
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFields(x) }), signal: ctl.signal,
    });
    // 409: ugyanez az azonosító már megérkezett (korábbi, megszakadt küldés) → rendben van.
    return res.ok || res.status === 409;
  } catch (e) {
    return false;
  } finally { clearTimeout(t); }
}

let flushing = null;
// Az összes még el nem küldött bejegyzés küldése. Egyszerre csak egy futás van.
export function flush() {
  if (!isConfigured()) return Promise.resolve(false);
  if (flushing) return flushing;
  flushing = (async () => {
    let all = true;
    for (const x of list().filter((i) => !i.elkuldve)) {
      const ok = await send(x);
      if (ok) { x.elkuldve = true; saveProgress(); } else { all = false; }
    }
    return all;
  })().finally(() => { flushing = null; });
  return flushing;
}

// Új visszajelzés. Visszaadja a bejegyzést; a küldés eredménye az `elkuldve` mezőben látszik.
export async function addFeedback({ modul, fejezet, ertek, szoveg }) {
  if (!ERTEKEK[ertek]) throw new Error('Válassz egy lehetőséget.');
  const x = {
    id: newId(), modul: String(modul), fejezet: String(fejezet), ertek,
    szoveg: String(szoveg || '').trim().slice(0, MAX_TEXT),
    ido: new Date().toISOString(), elkuldve: false,
  };
  list().push(x);
  saveProgress();
  await flush();
  return x;
}

export function initFeedbackSync() {
  window.addEventListener('online', () => { flush(); });
  setInterval(() => { if (pendingCount()) flush(); }, 60000);
  flush();
}
