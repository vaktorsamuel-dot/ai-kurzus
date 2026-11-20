// Haladás, zárolás és százalékszámítás – egyetlen forrás minden nézet számára.

import { course, media } from './data.js';
import { getProgress, chapterState, moduleState } from './store.js';
import { isAdmin } from './admin.js';

export const QUIZ_PASS = 0.6;
export const VIDEO_PASS = 0.9;

const unavailableVideos = new Set();
export function markVideoUnavailable(id) { unavailableVideos.add(id); }

// A kötelező videó csak akkor feltétel, ha a fájl elkészült és be is tölthető.
export function videoRequired(ch) {
  if (!ch.video || ch.video.kotelezo === false) return false;
  const m = media(ch.video.media);
  if (!m || m.statusz !== 'kesz') return false;
  return !unavailableVideos.has(m.id);
}

export function chapterSteps(ch) {
  const steps = ['olvasas'];
  if (videoRequired(ch)) steps.push('video');
  if (ch.gyakorlat) steps.push('gyakorlat');
  if (ch.kviz && ch.kviz.length) steps.push('kviz');
  steps.push('lezaras');
  return steps;
}

export function stepDone(ch, step) {
  const s = chapterState(ch.id);
  switch (step) {
    case 'olvasas': return !!s.olvasas;
    case 'video': return !!(s.video && s.video.done);
    case 'gyakorlat': return !!s.gyakorlat;
    case 'kviz': return !!(s.kviz && s.kviz.passed);
    case 'lezaras': return !!s.kesz;
    default: return false;
  }
}

export function chapterPct(ch) {
  const s = chapterState(ch.id);
  if (s.kesz) return 100;
  const steps = chapterSteps(ch);
  const done = steps.filter((st) => stepDone(ch, st)).length;
  return Math.round((done / steps.length) * 100);
}

const STEP_LABELS = {
  olvasas: 'Görgess végig a fejezeten (az összefoglalóig).',
  video: 'Nézd meg a videót legalább 90%-ig.',
  gyakorlat: 'Jelöld meg a „Próbáld ki most” gyakorlatot: „Megcsináltam”.',
  kviz: 'Érj el legalább 60%-ot a mini kvízen.',
};
export function missingForClose(ch) {
  return chapterSteps(ch)
    .filter((st) => st !== 'lezaras' && !stepDone(ch, st))
    .map((st) => STEP_LABELS[st]);
}
export function canCloseChapter(ch) { return missingForClose(ch).length === 0; }

// ---- Modulok ----
export function moduleClosed(mod) { return !!moduleState(mod.id).lezarva; }
export function moduleSkipped(mod) { return !!moduleState(mod.id).kihagyva && !moduleState(mod.id).lezarva; }
export function moduleFinished(mod) { return moduleClosed(mod) || moduleSkipped(mod); }

export function moduleUnlocked(mod) {
  if (isAdmin()) return true; // kezelő mód: minden nyitva
  if (mod.index === 0) return true;
  return moduleFinished(course.modulok[mod.index - 1]);
}

export function chapterUnlocked(ch) {
  if (isAdmin()) return true; // kezelő mód: minden nyitva
  const mod = course.modulById[ch.modulId];
  if (!moduleUnlocked(mod)) return false;
  if (ch.index === 0) return true;
  return !!chapterState(mod.fejezetek[ch.index - 1].id).kesz;
}

export function allChaptersDone(mod) { return mod.fejezetek.every((f) => chapterState(f.id).kesz); }

export function moduleQuizPassed(mod) {
  if (!mod.kviz || !mod.kviz.length) return true;
  const q = moduleState(mod.id).kviz;
  return !!(q && q.passed);
}

export function modulePct(mod) {
  if (moduleClosed(mod)) return 100;
  const items = mod.fejezetek.map(chapterPct);
  // A modulkvíz (vagy a lezárás, ha nincs kvíz) egy további tétel; csak lezáráskor lesz 100.
  items.push(0);
  return Math.round(items.reduce((a, b) => a + b, 0) / items.length);
}

export function moduleStatus(mod) {
  if (moduleClosed(mod)) return 'kesz';
  if (moduleSkipped(mod)) return 'kihagyva';
  if (!moduleUnlocked(mod)) return 'zarolt';
  return 'folyamatban';
}

export function chapterStatus(ch) {
  if (chapterState(ch.id).kesz) return 'kesz';
  if (!chapterUnlocked(ch)) return 'zarolt';
  return 'folyamatban';
}

// ---- Kurzus ----
function countedModules() { return course.modulok.filter((m) => !moduleSkipped(m)); }

export function coursePct() {
  const mods = countedModules();
  if (!mods.length) return 0;
  return Math.round(mods.reduce((a, m) => a + modulePct(m), 0) / mods.length);
}
export function modulesDone() {
  const mods = countedModules();
  return { kesz: mods.filter(moduleClosed).length, osszes: mods.length };
}

// Hová vigyen a „Folytatás”: utoljára megnyitott, még nem kész fejezet, különben az első nyitott feladat.
export function resumeTarget() {
  const p = getProgress();
  if (p.aktualis && course.fejezetById[p.aktualis]) {
    const ch = course.fejezetById[p.aktualis];
    if (chapterUnlocked(ch) && !chapterState(ch.id).kesz) return { tipus: 'fejezet', ch };
  }
  for (const mod of course.modulok) {
    if (moduleFinished(mod)) continue;
    if (!moduleUnlocked(mod)) break;
    const ch = mod.fejezetek.find((f) => !chapterState(f.id).kesz);
    if (ch) return { tipus: 'fejezet', ch };
    return { tipus: 'zaro', mod };
  }
  return { tipus: 'kesz' };
}

export function currentModule() {
  return course.modulok.find((m) => !moduleFinished(m) && moduleUnlocked(m)) || null;
}

export function chapterHash(ch) { return '#/m/' + ch.modulId + '/f/' + encodeURIComponent(ch.id); }
export function moduleHash(mod) { return '#/m/' + mod.id; }
export function closingHash(mod) { return '#/m/' + mod.id + '/zaro'; }

export function nextChapterOf(ch) {
  const mod = course.modulById[ch.modulId];
  return mod.fejezetek[ch.index + 1] || null;
}
export function prevChapterOf(ch) {
  const mod = course.modulById[ch.modulId];
  if (ch.index > 0) return mod.fejezetek[ch.index - 1];
  const prevMod = course.modulok[mod.index - 1];
  return prevMod ? prevMod.fejezetek[prevMod.fejezetek.length - 1] : null;
}
