// ===== Kezelő (admin) mód =====
// A PIN-t itt lehet átírni:
export const ADMIN_PIN = '2010';

// Kliensoldali kapcsoló, nem valódi biztonsági védelem.
// Kezelő módban minden modul és fejezet nyitva van, és a haladás KÜLÖN kulcsra mentődik
// (aikurzus.v1.kezelo.haladas), így a sima felhasználó haladása nem íródik felül.

const FLAG = 'aikurzus.v1.kezelo';

export function isAdmin() {
  try { return localStorage.getItem(FLAG) === '1'; } catch (e) { return false; }
}

export function enterAdmin(pin) {
  if (String(pin || '').trim() !== ADMIN_PIN) return false;
  try { localStorage.setItem(FLAG, '1'); } catch (e) { return false; }
  return true;
}

export function exitAdmin() {
  try { localStorage.removeItem(FLAG); } catch (e) { /* nincs teendő */ }
}
