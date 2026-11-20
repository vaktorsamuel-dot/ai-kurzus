// „Kurzus kész” oldal: nyomtatható oklevél és javasolt következő lépések.

import { course } from '../data.js';
import { getProfile, getProgress } from '../store.js';
import { moduleClosed } from '../progress.js';
import { esc, icon, fmtDate } from '../util.js';

export function viewFinish() {
  const p = getProfile();
  const done = getProgress().kurzusKesz;
  const mods = course.modulok.filter((m) => m.id !== 'zp' && moduleClosed(m));
  const hours = Math.round(mods.reduce((a, m) => a + m.ido, 0) / 60 + 1.25);
  const steps = (course.meta.kovetkezoLepesek || []);
  return {
    title: 'Kurzus kész',
    track: 'Kurzus kész – oklevél',
    html:
      '<div class="wrap section">' +
      '<div class="no-print"><p class="eyebrow">Kurzus kész</p><h1>Gratulálunk, ' + esc(p.nev) + '!</h1>' +
      '<p class="lead">Végigmentél a kurzuson. Az oklevelet kinyomtathatod, vagy a nyomtatási ablakban „Mentés PDF-ként” lehetőséggel elmentheted.</p>' +
      '<div class="row"><button type="button" class="btn btn-accent btn-lg" id="print">' + icon('print') + 'Oklevél nyomtatása</button>' +
      '<a class="btn btn-ghost btn-lg" href="#/">' + icon('home') + 'Főképernyő</a></div></div>' +
      '<article class="certificate" aria-label="Oklevél">' +
      '<div class="cert-inner"><p class="cert-kicker">Oklevél</p>' +
      '<p class="cert-line">Ezúton igazoljuk, hogy</p>' +
      '<p class="cert-name">' + esc(p.nev) + '</p>' +
      '<p class="cert-line">sikeresen elvégezte az</p>' +
      '<p class="cert-title">AI a hétköznapokban</p>' +
      '<p class="cert-line">című önálló tanulásra épülő kurzust (' + mods.length + ' modul és záró projekt, kb. ' + hours + ' óra).</p>' +
      '<ul class="cert-mods">' + mods.map((m) => '<li>' + esc(m.cim) + '</li>').join('') + '</ul>' +
      '<p class="cert-date">Kelt: ' + fmtDate(done) + '</p>' +
      '<p class="cert-note">Önellenőrzésen alapuló, saját tempójú kurzus igazolása. Nem hivatalos képesítés.</p></div></article>' +
      '<section class="no-print section"><h2>Javasolt következő lépések</h2><ol class="next-steps">' +
      steps.map((s) => '<li><strong>' + esc(s.cim) + '</strong> ' + esc(s.szoveg) + '</li>').join('') + '</ol></section>' +
      '</div>',
    mount(root) {
      root.querySelector('#print').addEventListener('click', () => window.print());
    },
  };
}
