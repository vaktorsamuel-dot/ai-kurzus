import { course } from '../data.js';
import { getProfile, getProgress } from '../store.js';
import {
  coursePct, modulesDone, modulePct, moduleStatus, resumeTarget, chapterHash, closingHash, moduleHash, chapterPct,
} from '../progress.js';
import { isAdmin } from '../admin.js';
import { esc, icon, statusBadge, progressBar, fmtDateTime, fmtMin, moduleIcon } from '../util.js';

export function viewHome() {
  const profil = getProfile();
  const p = getProgress();
  const pct = coursePct();
  const md = modulesDone();
  const t = resumeTarget();

  let resume;
  if (t.tipus === 'fejezet') {
    const started = chapterPct(t.ch) > 0 || p.aktualis;
    resume = '<a class="btn btn-accent btn-xl resume" href="' + chapterHash(t.ch) + '">' +
      '<span class="resume-label">' + (started ? 'Folytatás' : 'Kezdés') + icon('arrowRight') + '</span>' +
      '<span class="resume-meta">' + esc(t.ch.id + ' ' + t.ch.cim) + ' · ' + fmtMin(t.ch.ido) + '</span></a>';
  } else if (t.tipus === 'zaro') {
    resume = '<a class="btn btn-accent btn-xl resume" href="' + closingHash(t.mod) + '">' +
      '<span class="resume-label">Folytatás' + icon('arrowRight') + '</span>' +
      '<span class="resume-meta">' + esc(t.mod.sorszam + '. modul lezárása') + (t.mod.kviz && t.mod.kviz.length ? ' · modulkvíz' : '') + '</span></a>';
  } else {
    resume = '<a class="btn btn-accent btn-xl resume" href="#/kesz"><span class="resume-label">Az oklevelem' + icon('arrowRight') + '</span>' +
      '<span class="resume-meta">A kurzust befejezted</span></a>';
  }

  const last = p.utoljara ? '<p class="muted small last-visit">Utoljára itt jártál: <a href="' + esc(p.utoljara.hash) + '">' + esc(p.utoljara.cim) + '</a> · ' + fmtDateTime(p.utoljara.ido) + '</p>' : '';

  const cards = course.modulok.map((m) => {
    const st = moduleStatus(m);
    const mp = st === 'kihagyva' ? 0 : modulePct(m);
    const prev = course.modulok[m.index - 1];
    const lockNote = st === 'zarolt' ? '<p class="lock-note">' + icon('lock') + 'Előbb fejezd be: ' + esc(prev.sorszam + '. ' + prev.cim) + '</p>' : '';
    const tag = m.opcionalis ? '<span class="tag">Haladó · nem kötelező</span>' : (m.id === 'zp' ? '<span class="tag">Záró projekt</span>' : '');
    const inner = '<div class="mcard-top"><span class="mcard-ids"><span class="mnum" aria-hidden="true">' + (m.id === 'zp' ? 'Z' : m.sorszam) + '</span>' + moduleIcon(m) + '</span>' +
      statusBadge(st) + '</div>' +
      '<h3 class="mcard-title">' + (m.id === 'zp' ? '' : '<span class="visually-hidden">' + m.sorszam + '. modul: </span>') + esc(m.cim) + '</h3>' + tag +
      '<p class="mcard-desc">' + esc(m.rovid) + '</p>' + lockNote +
      '<div class="mcard-foot"><span class="meta">' + icon('clock') + fmtMin(m.ido) + '</span>' + (isAdmin() ? '' : '<span class="meta"><strong>' + mp + '%</strong></span>') + '</div>' +
      (isAdmin() ? '' : progressBar(mp, m.cim + ' modul haladása'));
    if (st === 'zarolt') return '<li class="mcard mcard-zarolt" aria-disabled="true">' + inner + '</li>';
    return '<li class="mcard mcard-' + st + '"><a class="mcard-link" href="' + moduleHash(m) + '">' + inner + '</a></li>';
  }).join('');

  return {
    title: 'Főképernyő',
    html:
      '<section class="hero-home"><div class="wrap">' +
      '<h1>Szia, ' + esc(profil.nev) + '!</h1>' +
      '<p class="lead">Itt folytathatod, ahol abbahagytad. Saját tempóban haladsz, minden lépés automatikusan mentődik.</p>' +
      '<div class="home-grid"><div>' + resume + last + '</div>' +
      '<div class="card overall"><h2 class="h-small">Összesített haladás</h2>' +
      (isAdmin() ? '<p class="muted">Kezelő módban a százalékos haladás nincs számolva.</p>'
        : '<p class="big-pct"><strong>' + pct + '%</strong> kész</p>' + progressBar(pct, 'A teljes kurzus haladása', 'pbar-lg') +
          '<p class="muted">' + md.kesz + ' / ' + md.osszes + ' modul kész</p>') + '</div></div>' +
      '</div></section>' +
      '<section class="section"><div class="wrap"><h2>Modul-térkép</h2>' +
      '<p class="muted">A modulok sorban nyílnak. Kész modulhoz bármikor visszatérhetsz.</p>' +
      '<ol class="module-map">' + cards + '</ol></div></section>',
  };
}
