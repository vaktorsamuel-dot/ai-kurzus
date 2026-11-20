import { course } from '../data.js';
import { moduleState, saveProgress } from '../store.js';
import {
  modulePct, moduleStatus, chapterStatus, chapterPct, chapterHash, closingHash, allChaptersDone, moduleClosed, moduleHash,
} from '../progress.js';
import { esc, icon, statusBadge, progressBar, fmtMin, toast, moduleIcon } from '../util.js';
import { go } from '../app.js';
import { isAdmin } from '../admin.js';

export function viewModule(mod) {
  const pct = modulePct(mod);
  const st = moduleStatus(mod);
  const allDone = allChaptersDone(mod);

  const list = mod.fejezetek.map((f) => {
    const cs = chapterStatus(f);
    const cp = chapterPct(f);
    const body = '<span class="ch-num">' + esc(f.id) + '</span><span class="ch-main"><span class="ch-title">' + esc(f.cim) + '</span>' +
      '<span class="meta">' + icon('clock') + fmtMin(f.ido) + (f.video ? ' · ' + icon('video') + 'videó' : '') + (isAdmin() ? '' : ' · ' + cp + '%') + '</span></span>' + statusBadge(cs);
    if (cs === 'zarolt') {
      return '<li class="ch-item ch-zarolt" aria-disabled="true">' + body + '</li>';
    }
    return '<li class="ch-item ch-' + cs + '"><a href="' + chapterHash(f) + '">' + body + '</a></li>';
  }).join('');

  const hasQuiz = mod.kviz && mod.kviz.length;
  const closing = '<li class="ch-item ' + (moduleClosed(mod) ? 'ch-kesz' : allDone ? 'ch-folyamatban' : 'ch-zarolt') + '"' + (allDone ? '' : ' aria-disabled="true"') + '>' +
    (allDone ? '<a href="' + closingHash(mod) + '">' : '') +
    '<span class="ch-num">' + icon('star') + '</span><span class="ch-main"><span class="ch-title">' + (mod.id === 'zp' ? 'A kurzus lezárása' : 'Modulzáró' + (hasQuiz ? ' és modulkvíz' : '')) + '</span>' +
    '<span class="meta">' + (allDone ? 'Összefoglalás' + (hasQuiz ? ', ' + mod.kviz.length + ' kérdés' : '') : 'Minden fejezet lezárása után nyílik meg') + '</span></span>' +
    statusBadge(moduleClosed(mod) ? 'kesz' : allDone ? 'folyamatban' : 'zarolt') + (allDone ? '</a>' : '') + '</li>';

  const skip = mod.opcionalis && st === 'folyamatban'
    ? '<div class="callout callout-tip">' + icon('tip') + '<div><strong>Ez a modul haladó és nem kötelező.</strong> Ha most nem érdekel, kihagyhatod: a következő modul megnyílik, és ez a modul nem számít bele a százalékba. Később bármikor visszajöhetsz és elvégezheted.' +
      '<div class="row" style="margin-top:.75rem"><button type="button" class="btn btn-ghost" id="skip-btn">' + icon('skip') + 'Modul kihagyása</button></div></div></div>'
    : st === 'kihagyva'
      ? '<div class="callout callout-tip">' + icon('skip') + '<div>Ezt a modult kihagytad. A fejezetei továbbra is nyitva vannak: ha mégis elvégzed és lezárod, beleszámít a haladásodba.</div></div>'
      : '';

  return {
    title: mod.cim,
    html:
      '<div class="wrap section">' +
      '<nav class="crumbs no-print" aria-label="Morzsamenü"><a class="btn btn-ghost btn-small" href="#/">' + icon('arrowLeft') + 'Vissza a főképernyőre</a></nav>' +
      '<p class="eyebrow">' + (mod.id === 'zp' ? 'Záró projekt' : mod.sorszam + '. modul') + ' · ' + fmtMin(mod.ido) + '</p>' +
      '<h1 class="mod-title">' + moduleIcon(mod, 'micon-lg') + '<span>' + esc(mod.cim) + '</span></h1>' +
      '<p class="lead">' + esc(mod.cel) + '</p>' +
      '<div class="module-grid"><div>' +
      '<div class="card"><h2 class="h-small">Mit tudsz majd utána?</h2><ul class="checklist-static">' + (mod.utana || []).map((u) => '<li>' + icon('check') + '<span>' + esc(u) + '</span></li>').join('') + '</ul></div>' +
      skip +
      '<h2>Fejezetek</h2><ol class="ch-list">' + list + closing + '</ol>' +
      '</div><aside class="card module-side"><h2 class="h-small">Modul haladása</h2>' +
      (isAdmin() ? '<p class="muted small">Kezelő módban nincs százalékszámolás.</p>'
        : '<p class="big-pct"><strong>' + (st === 'kihagyva' ? '–' : pct + '%') + '</strong></p>' + progressBar(st === 'kihagyva' ? 0 : pct, mod.cim + ' modul haladása', 'pbar-lg')) +
      '<p class="muted small">' + statusBadge(st) + '</p></aside></div>' +
      '</div>',
    mount(root) {
      const s = root.querySelector('#skip-btn');
      if (s) s.addEventListener('click', () => {
        moduleState(mod.id).kihagyva = true;
        saveProgress();
        toast('A modult kihagytad. A következő modul megnyílt.');
        const next = course.modulok[mod.index + 1];
        go(next ? moduleHash(next) : '#/');
      });
    },
  };
}
