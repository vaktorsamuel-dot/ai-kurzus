// Tárolás: localStorage verziózott kulcsokkal, memóriás tartalékkal.
// Kulcsok: aikurzus.v1.profil, aikurzus.v1.haladas, aikurzus.v1.beallitasok

const PREFIX = 'aikurzus.v1.';
const storageKey = (name) => PREFIX + name;
const KEYS = ['profil', 'haladas', 'beallitasok'];
const memory = {};
let persistent = true;

function testStorage() {
  try {
    const k = PREFIX + '__teszt';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (e) {
    return false;
  }
}
persistent = testStorage();

export function isPersistent() { return persistent; }

function read(name, fallback) {
  if (persistent) {
    try {
      const raw = localStorage.getItem(storageKey(name));
      if (raw) return JSON.parse(raw);
    } catch (e) { /* sérült adat: alapértelmezés */ }
  } else if (memory[name]) {
    return JSON.parse(memory[name]);
  }
  return fallback;
}

function write(name, value) {
  const raw = JSON.stringify(value);
  if (persistent) {
    try { localStorage.setItem(storageKey(name), raw); return; }
    catch (e) {
      persistent = false;
      document.dispatchEvent(new CustomEvent('storage-fallback'));
    }
  }
  memory[name] = raw;
}

export const DEFAULT_SETTINGS = {
  betumeret: 'normal',      // normal | nagy | xnagy
  tema: 'rendszer',         // rendszer | light | dark
  autoplay: false,
  feliratok: true,
};

// A mentett haladás formátumának verziója. 1: eredeti; 2: nincs „kihagyva”, completedAt, oklevelNev.
export const DATA_VERSION = 2;

// Régi (1-es verziójú) haladás átalakítása; adatot nem töröl, csak átnevez / elhagy elavult jelzőt.
export function migrateProgress(h) {
  const out = Object.assign({}, h);
  if (!out.fejezetek) out.fejezetek = {};
  if (!out.modulok) out.modulok = {};
  if ((out.verzio || 1) < 2) {
    if (out.kurzusKesz && !out.completedAt) out.completedAt = out.kurzusKesz;
    delete out.kurzusKesz;
    Object.keys(out.modulok).forEach((k) => { if (out.modulok[k]) delete out.modulok[k].kihagyva; });
  }
  if (out.completedAt === undefined) out.completedAt = null;
  if (out.oklevelNev === undefined) out.oklevelNev = null;
  out.verzio = DATA_VERSION;
  return out;
}

function emptyProgress() {
  return {
    verzio: DATA_VERSION,
    fejezetek: {},   // "1.1": { olvasas, video:{ranges,pos,duration,done}, gyakorlat, kviz:{best,passed}, kesz, keszIdo, szovegek:{} }
    modulok: {},     // "m01": { kviz:{best,passed}, lezarva, lezarasIdo, kihagyva }
    aktualis: null,  // utoljára megnyitott fejezet azonosítója
    utoljara: null,  // { ido, hash, cim }
    completedAt: null,  // amikor a haladás először érte el a 100%-ot (az oklevél dátuma)
    oklevelNev: null,   // az oklevélen szereplő név (külön szerkeszthető)
    letrehozva: new Date().toISOString(),
  };
}

const state = {
  profil: read('profil', null),
  haladas: migrateProgress(Object.assign(emptyProgress(), read('haladas', {}), { verzio: (read('haladas', {}) || {}).verzio || 1 })),
  beallitasok: Object.assign({}, DEFAULT_SETTINGS, read('beallitasok', {})),
};

export function getProfile() { return state.profil; }
export function setProfile(p) { state.profil = p; write('profil', p); }

// ---- Belépés (munkamenet / "Emlékezz rám") ----
// A profil és a haladás kilépéskor megmarad; csak a belépett állapot törlődik.
const SESSION_KEY = PREFIX + 'belepve';
const REMEMBER_KEY = PREFIX + 'emlekezz';
let loggedMem = false;
export function isLoggedIn() {
  if (!state.profil) return false;
  try { return sessionStorage.getItem(SESSION_KEY) === '1' || localStorage.getItem(REMEMBER_KEY) === '1'; }
  catch (e) { return loggedMem; }
}
export function login(remember) {
  loggedMem = true;
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
    if (remember) localStorage.setItem(REMEMBER_KEY, '1'); else localStorage.removeItem(REMEMBER_KEY);
  } catch (e) { /* memóriás tartalék */ }
}
export function logout() {
  loggedMem = false;
  try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(REMEMBER_KEY); } catch (e) { /* nincs teendő */ }
}

// Belépés nélkül megnyitott mélylink megjegyzése: belépés után ide térünk vissza.
const RETURN_KEY = PREFIX + 'vissza';
let returnMem = null;
export function setReturnTo(hash) {
  if (!/^#\/(m\/|oklevel|beallitasok|sugo|szoszedet)/.test(hash || '')) return;
  returnMem = hash;
  try { sessionStorage.setItem(RETURN_KEY, hash); } catch (e) { /* memóriás tartalék */ }
}
export function takeReturnTo() {
  let h = returnMem;
  try { h = sessionStorage.getItem(RETURN_KEY) || h; sessionStorage.removeItem(RETURN_KEY); } catch (e) { /* nincs teendő */ }
  returnMem = null;
  return h || null;
}

export function getSettings() { return state.beallitasok; }
export function setSettings(patch) {
  Object.assign(state.beallitasok, patch);
  write('beallitasok', state.beallitasok);
  applySettings();
}
export function applySettings() {
  const d = document.documentElement;
  const s = state.beallitasok;
  if (s.tema === 'rendszer') d.removeAttribute('data-theme'); else d.setAttribute('data-theme', s.tema);
  if (s.betumeret === 'normal') d.removeAttribute('data-font'); else d.setAttribute('data-font', s.betumeret);
}

export function getProgress() { return state.haladas; }
export function saveProgress() { write('haladas', state.haladas); }

export function chapterState(id) {
  const f = state.haladas.fejezetek;
  if (!f[id]) f[id] = { olvasas: false, video: null, gyakorlat: false, kviz: null, kesz: false, szovegek: {} };
  if (!f[id].szovegek) f[id].szovegek = {};
  return f[id];
}
export function moduleState(id) {
  const m = state.haladas.modulok;
  if (!m[id]) m[id] = { kviz: null, lezarva: false };
  return m[id];
}

// ---- Export / import ----
export function exportData() {
  return {
    formatum: 'aikurzus-haladas',
    verzio: DATA_VERSION,
    exportalva: new Date().toISOString(),
    profil: state.profil,
    haladas: state.haladas,
    beallitasok: state.beallitasok,
  };
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(b64.replace(/\s+/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function exportCode() { return 'AIK1:' + b64encode(JSON.stringify(exportData())); }

export function importAny(text) {
  let obj;
  const t = (text || '').trim();
  if (t.startsWith('AIK1:')) obj = JSON.parse(b64decode(t.slice(5)));
  else obj = JSON.parse(t);
  if (!obj || obj.formatum !== 'aikurzus-haladas' || !obj.haladas) {
    throw new Error('Ez nem egy érvényes haladás-mentés.');
  }
  state.profil = obj.profil || null;
  state.haladas = migrateProgress(Object.assign(emptyProgress(), obj.haladas, { verzio: obj.haladas.verzio || obj.verzio || 1 }));
  state.beallitasok = Object.assign({}, DEFAULT_SETTINGS, obj.beallitasok || {});
  KEYS.forEach((k) => write(k, state[k]));
  applySettings();
}

export function resetAll() {
  state.profil = null;
  state.haladas = emptyProgress();
  KEYS.forEach((k) => {
    if (persistent) { try { localStorage.removeItem(storageKey(k)); } catch (e) { /* nincs teendő */ } }
    delete memory[k];
  });
  write('beallitasok', state.beallitasok);
}
