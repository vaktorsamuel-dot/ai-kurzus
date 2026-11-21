import {
  modulePct, moduleStatus, chapterStatus, chapterPct, chapterHash, closingHash, allChaptersDone, moduleClosed, recommendedModule,
} from '../progress.js?v=9852283a';
import { esc, icon, statusBadge, progressBar, fmtMin, moduleIcon } from '../util.js?v=9852283a';

export function viewModule(mod) {
  const pct = modulePct(mod);
  const st = moduleStatus(mod);
  const allDone = allChaptersDone(mod);

  const rec = recommendedModule();
  const list = mod.fejezetek.map((f) => {
    const cs = chapterStatus(f);
    const cp = chapterPct(f);
    const body = '<span class="ch-num">' + esc(f.label) + '</span><span class="ch-main"><span class="ch-title">' + esc(f.cim) + '</span>' +
      '<span class="meta">' + icon('clock') + fmtMin(f.ido) + (f.video ? ' · ' + icon('video') + 'videó' : '') + ' · ' + cp + '%</span></span>' + statusBadge(cs);
    return '<li class="ch-item ch-' + cs + '"><a href="' + chapterHash(f) + '">' + body + '</a></li>';
  }).join('');

  const hasQuiz = mod.kviz && mod.kviz.length;
  const closeSt = moduleClosed(mod) ? 'kesz' : (allDone ? 'folyamatban' : 'nincs');
  const closing = '<li class="ch-item ch-' + closeSt + '"><a href="' + closingHash(mod) + '">' +
    '<span class="ch-num">' + icon('star') + '</span><span class="ch-main"><span class="ch-title">' + (mod.id === 'zp' ? 'A kurzus lezárása' : 'Modulzáró' + (hasQuiz ? ' és modulkvíz' : '')) + '</span>' +
    '<span class="meta">Összefoglalás' + (hasQuiz ? ', ' + mod.kviz.length + ' kérdés' : '') + (allDone ? '' : ' · a lezáráshoz előbb a fejezeteket kell lezárnod') + '</span></span>' +
    statusBadge(closeSt) + '</a></li>';

  const note = mod.halado
    ? '<div class="callout callout-tip">' + icon('tip') + '<div><strong>Haladó modul.</strong> Kicsit több önállóságot kér, mint az eddigiek. Az oklevélhez ez is kell, de a sorrendet te döntöd el.</div></div>'
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
      note +
      '<h2>Fejezetek</h2><ol class="ch-list">' + list + closing + '</ol>' +
      '</div><aside class="card module-side"><h2 class="h-small">Modul haladása</h2>' +
      '<p class="big-pct"><strong>' + pct + '%</strong></p>' + progressBar(pct, mod.cim + ' modul haladása', 'pbar-lg') +
      '<p class="muted small">' + statusBadge(st) + (rec && rec.id === mod.id && st !== 'kesz' ? ' <span class="tag tag-next">Ajánlott következő</span>' : '') + '</p></aside></div>' +
      '</div>',
  };
}
