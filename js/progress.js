// Haladás, zárolás és százalékszámítás – egyetlen forrás minden nézet számára.

import { course, media } from './data.js?v=991a70c2';
import { getProgress, saveProgress, chapterState, moduleState } from './store.js?v=991a70c2';
import { recommendedOrder, getRecs } from './assess.js?v=991a70c2';

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
export function moduleFinished(mod) { return moduleClosed(mod); }

// Semmi nincs zárolva: a sorrend csak ajánlás, a haladás számítását befolyásolja, a navigációt nem.
export function chapterStarted(ch) {
  const s = chapterState(ch.id);
  return !!(s.kesz || s.olvasas || s.gyakorlat || (s.video && (s.video.done || (s.video.pos || 0) > 0)) || (s.kviz && (s.kviz.utolso != null || s.kviz.score != null)));
}
export function moduleStarted(mod) {
  const ms = moduleState(mod.id);
  return !!(ms.lezarva || (ms.kviz && (ms.kviz.utolso != null || ms.kviz.score != null)) || mod.fejezetek.some(chapterStarted));
}

// A modul lezárásához minden fejezet kész és a modulkvíz megvan; a navigációt ez nem érinti.
export function canCloseModule(mod) { return allChaptersDone(mod) && moduleQuizPassed(mod); }

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
  // 100% csak akkor, ha a modul valóban kész (lezárva); kerekítés miatt nem lehet 99,5 → 100.
  return Math.min(99, Math.round(items.reduce((a, b) => a + b, 0) / items.length));
}

export function moduleStatus(mod) {
  if (moduleClosed(mod)) return 'kesz';
  return moduleStarted(mod) ? 'folyamatban' : 'nincs';
}

export function chapterStatus(ch) {
  if (chapterState(ch.id).kesz) return 'kesz';
  return chapterStarted(ch) ? 'folyamatban' : 'nincs';
}

// ---- Kurzus ----
// 100%: minden modul lezárva és minden fejezet kész.
export function isCourseComplete() {
  return course.modulok.length > 0 && course.modulok.every((m) => moduleClosed(m) && allChaptersDone(m));
}
// A teljesítés dátumát az első 100%-nál mentjük; bővülő kurzusnál a már kiadott oklevél érvényes marad.
export function markCompletionIfDone() {
  const p = getProgress();
  if (!p.completedAt && isCourseComplete()) { p.completedAt = new Date().toISOString(); saveProgress(); }
}

function countedModules() { return course.modulok; }

export function coursePct() {
  const mods = countedModules();
  if (!mods.length) return 0;
  // A kurzus haladása pontosan akkor 100%, ha minden kész (isCourseComplete); egyébként legfeljebb 99%.
  if (isCourseComplete()) return 100;
  return Math.min(99, Math.round(mods.reduce((a, m) => a + modulePct(m), 0) / mods.length));
}
export function modulesDone() {
  const mods = countedModules();
  return { kesz: mods.filter(moduleClosed).length, osszes: mods.length };
}

// Puha ajánlás (nem tilt semmit): a legutóbb megnyitott, még nem kész fejezet; különben az első nem kész fejezet.
export function resumeTarget() {
  const p = getProgress();
  if (p.aktualis && course.fejezetById[p.aktualis] && !chapterState(p.aktualis).kesz) {
    return { tipus: 'fejezet', ch: course.fejezetById[p.aktualis] };
  }
  // A szintfelmérő szerinti ajánlott sorrendben haladunk; az „Ismerős” modulokat előbb átugorjuk (de nem zárjuk le).
  const recs = getRecs() || {};
  const order = recommendedOrder();
  const next = (skipFamiliar) => {
    for (const mod of order) {
      if (moduleFinished(mod)) continue;
      if (skipFamiliar && recs[mod.id] && recs[mod.id].allapot === 'ismeros') continue;
      const ch = mod.fejezetek.find((f) => !chapterState(f.id).kesz);
      if (ch) return { tipus: 'fejezet', ch };
      return { tipus: 'zaro', mod };
    }
    return null;
  };
  return next(true) || next(false) || { tipus: 'kesz' };
}

// Az „Ajánlott következő” jelzés modulja.
export function recommendedModule() {
  const t = resumeTarget();
  if (t.tipus === 'fejezet') return course.modulById[t.ch.modulId];
  if (t.tipus === 'zaro') return t.mod;
  return null;
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
