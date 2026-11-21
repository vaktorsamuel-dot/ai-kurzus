// Oklevél: csak a kurzus teljes teljesítése után (minden modul és fejezet kész). A teljesítés dátuma a
// haladásban tárolt completedAt; a név külön szerkeszthető (oklevelNev). Nyomtatás: A4 fekvő, böngészőből.

import { course, getCourseStats } from '../data.js?v=9852283a';
import { getProfile, getProgress, saveProgress } from '../store.js?v=9852283a';
import { isCourseComplete, markCompletionIfDone, moduleHash, moduleClosed, allChaptersDone, coursePct } from '../progress.js?v=9852283a';
import { esc, icon, fmtDate, toast } from '../util.js?v=9852283a';

// Mely modulok hiányoznak még (nincs lezárva, vagy van nem kész fejezet).
export function missingModules() {
  return course.modulok.filter((m) => !(moduleClosed(m) && allChaptersDone(m)));
}

// Tanúsítvány csak akkor állítható ki, ha a kurzus haladása valóban 100%.
export function certificateAvailable() {
  markCompletionIfDone();
  return coursePct() === 100;
}

// Közös sablon az éles oklevélhez és a kezelői előnézethez. A „100%-ban teljesítve” sor nem beégetett:
// csak akkor jelenik meg, ha a kapott haladás tényleg 100. Az előnézet jelzése (ELŐNÉZET) nyomtatásban nem látszik.
export function certificateHtml({ nev, datum, pct, preview }) {
  const stats = getCourseStats();
  const keszito = course.meta && course.meta.keszito ? String(course.meta.keszito) : '';
  return '<article class="certificate' + (preview ? ' is-preview' : '') + '" aria-label="Oklevél' + (preview ? ' (előnézet)' : '') + '">' +
    (preview ? '<div class="cert-watermark no-print" aria-hidden="true">ELŐNÉZET</div>' : '') +
    '<div class="cert-inner"><img class="cert-logo" src="assets/img/logo.png" alt="" width="96" height="96">' +
    '<p class="cert-kicker">Oklevél</p>' +
    '<p class="cert-line">Ezúton igazoljuk, hogy</p>' +
    '<p class="cert-name" id="cert-name-out">' + esc(nev) + '</p>' +
    '<p class="cert-line">sikeresen teljesítette az „<strong>AI a hétköznapokban</strong>” kurzus mind a <strong>' + stats.modules + '</strong> modulját.</p>' +
    (pct === 100 ? '<p class="cert-done">' + pct + '%-ban teljesítve</p>' : '') +
    '<p class="cert-date">Kelt: ' + esc(fmtDate(datum)) + '</p>' +
    (keszito ? '<p class="cert-maker">A kurzus készítője: ' + esc(keszito) + '</p>' : '') +
    '<p class="cert-note">Önellenőrzésen alapuló, saját tempójú kurzus igazolása. Nem hivatalos képesítés.</p></div></article>';
}

// Nyomtatás: A4 fekvő, csak a tanúsítvány. Az @page méretet csak a nyomtatás idejére adjuk hozzá.
export function printCertificate() {
  const st = document.createElement('style');
  st.media = 'print';
  st.textContent = '@page { size: A4 landscape; margin: 0; }';
  document.head.appendChild(st);
  document.body.classList.add('printing-cert');
  const done = () => { st.remove(); document.body.classList.remove('printing-cert'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

export function missingList() {
  return '<ul class="missing-mods">' + missingModules().map((m) =>
    '<li><a href="' + moduleHash(m) + '">' + esc(m.id === 'zp' ? m.cim : m.sorszam + '. ' + m.cim) + '</a></li>').join('') + '</ul>';
}

export function viewFinish() {
  const prof = getProfile() || {};
  const p = getProgress();
  if (!certificateAvailable()) {
    const n = missingModules().length;
    return {
      title: 'Oklevél',
      html: '<div class="wrap-narrow section"><nav class="crumbs no-print"><a class="btn btn-ghost btn-small" href="#/">' + icon('arrowLeft') + 'Főképernyő</a></nav>' +
        '<h1>Oklevél</h1><div class="card cert-locked"><p>Az oklevél a kurzus teljes teljesítése után nyílik. Még <strong>' + n + ' modul</strong> van hátra:</p>' + missingList() + '</div></div>',
    };
  }
  const steps = course.meta.kovetkezoLepesek || [];
  const nev = () => (p.oklevelNev != null && p.oklevelNev !== '' ? p.oklevelNev : prof.nev || '');
  return {
    title: 'Oklevél',
    track: 'Oklevél',
    html:
      '<div class="wrap section cert-page">' +
      '<div class="no-print"><p class="eyebrow">Kurzus kész</p><h1>Gratulálunk, ' + esc(prof.nev || '') + '!</h1>' +
      '<p class="lead">Mindent teljesítettél. Az oklevelet kinyomtathatod, vagy a nyomtatási ablakban „Mentés PDF-ként” lehetőséggel elmentheted.</p>' +
      '<div class="field cert-name-field"><label for="cert-nev">Név az oklevélen</label><input type="text" id="cert-nev" maxlength="60" value="' + esc(nev()) + '" autocomplete="name">' +
      '<p class="hint">Alapból a belépésnél megadott név. Ha az oklevélre a teljes neved szeretnéd, írd át; ez külön mentődik.</p></div>' +
      '<div class="row"><button type="button" class="btn btn-accent btn-lg" id="print">' + icon('print') + 'Nyomtatás / Mentés PDF-ként</button>' +
      '<a class="btn btn-ghost btn-lg" href="#/">' + icon('home') + 'Főképernyő</a></div></div>' +
      certificateHtml({ nev: nev(), datum: p.completedAt, pct: coursePct(), preview: false }) +
      '<section class="no-print section"><h2>Javasolt következő lépések</h2><ol class="next-steps">' +
      steps.map((s) => '<li><strong>' + esc(s.cim) + '</strong> ' + esc(s.szoveg) + '</li>').join('') + '</ol></section>' +
      '</div>',
    mount(root) {
      const inp = root.querySelector('#cert-nev');
      const out = root.querySelector('#cert-name-out');
      inp.addEventListener('input', () => {
        p.oklevelNev = inp.value.trim() === '' ? null : inp.value;
        out.textContent = inp.value.trim() || prof.nev || '';
        saveProgress();
      });
      root.querySelector('#print').addEventListener('click', () => {
        if (!inp.value.trim() && !prof.nev) { toast('Írd be a neved az oklevélhez.'); inp.focus(); return; }
        printCertificate();
      });
    },
  };
}
