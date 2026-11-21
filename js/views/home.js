import { course } from '../data.js?v=6bcb5a28';
import { getProfile, getProgress } from '../store.js?v=6bcb5a28';
import {
  coursePct, modulesDone, modulePct, moduleStatus, resumeTarget, recommendedModule, chapterHash, closingHash, moduleHash, chapterPct,
} from '../progress.js?v=6bcb5a28';
import { certificateAvailable } from './finish.js?v=6bcb5a28';
import { getRecs, recommendedOrder } from '../assess.js?v=6bcb5a28';
import { esc, icon, statusBadge, progressBar, fmtDateTime, fmtMin, moduleIcon } from '../util.js?v=6bcb5a28';

function certCard() {
  if (certificateAvailable()) {
    return '<div class="card cert-card cert-ready"><div>' + icon('star') + '<h2 class="h-small">Oklevél</h2><p>Mindent teljesítettél. Az oklevél megnyitható és nyomtatható.</p></div>' +
      '<a class="btn btn-accent btn-lg" href="#/oklevel">Az oklevelem' + icon('arrowRight') + '</a></div>';
  }
  return ''; // Az oklevél csak a kurzus 100%-os teljesítése után jelenik meg.
}

export function viewHome() {
  const profil = getProfile();
  const p = getProgress();
  const pct = coursePct();
  const md = modulesDone();
  const t = resumeTarget();
  const rec = recommendedModule();
  const recs = getRecs();

  let resume;
  if (t.tipus === 'fejezet') {
    const started = chapterPct(t.ch) > 0 || p.aktualis;
    resume = '<a class="btn btn-accent btn-xl resume" href="' + chapterHash(t.ch) + '">' +
      '<span class="resume-label">' + (started ? 'Folytatás' : 'Kezdés') + icon('arrowRight') + '</span>' +
      '<span class="resume-meta">' + esc(t.ch.label + ' ' + t.ch.cim) + ' · ' + fmtMin(t.ch.ido) + '</span></a>';
  } else if (t.tipus === 'zaro') {
    resume = '<a class="btn btn-accent btn-xl resume" href="' + closingHash(t.mod) + '">' +
      '<span class="resume-label">Folytatás' + icon('arrowRight') + '</span>' +
      '<span class="resume-meta">' + esc(t.mod.sorszam + '. modul lezárása') + (t.mod.kviz && t.mod.kviz.length ? ' · modulkvíz' : '') + '</span></a>';
  } else {
    resume = '<a class="btn btn-accent btn-xl resume" href="#/oklevel"><span class="resume-label">Az oklevelem' + icon('arrowRight') + '</span>' +
      '<span class="resume-meta">A kurzust befejezted</span></a>';
  }

  const last = p.utoljara ? '<p class="muted small last-visit">Utoljára itt jártál: <a href="' + esc(p.utoljara.hash) + '">' + esc(p.utoljara.cim) + '</a> · ' + fmtDateTime(p.utoljara.ido) + '</p>' : '';

  const cards = recommendedOrder().map((m) => {
    const st = moduleStatus(m);
    const mp = modulePct(m);
    const tags = (m.halado ? '<span class="tag">Haladó</span> ' : '') + (m.id === 'zp' ? '<span class="tag">Záró projekt</span> ' : '') +
      (rec && rec.id === m.id && st !== 'kesz' ? '<span class="tag tag-next">Ajánlott következő</span> ' : '') +
      (recs && recs[m.id] && recs[m.id].allapot === 'ismeros' && st !== 'kesz' ? '<span class="tag">Ismerős, átugorhatod</span> ' : '') +
      (recs && recs[m.id] && recs[m.id].allapot === 'erdekelhet' && st !== 'kesz' ? '<span class="tag">Érdekelhet</span>' : '');
    const tag = tags ? '<p class="mcard-tags">' + tags + '</p>' : '';
    const inner = '<div class="mcard-top"><span class="mcard-ids"><span class="mnum" aria-hidden="true">' + (m.id === 'zp' ? 'Z' : m.sorszam) + '</span>' + moduleIcon(m) + '</span>' +
      statusBadge(st) + '</div>' +
      '<h3 class="mcard-title">' + (m.id === 'zp' ? '' : '<span class="visually-hidden">' + m.sorszam + '. modul: </span>') + esc(m.cim) + '</h3>' + tag +
      '<p class="mcard-desc">' + esc(m.rovid) + '</p>' +
      '<div class="mcard-foot"><span class="meta">' + icon('clock') + fmtMin(m.ido) + '</span><span class="meta"><strong>' + mp + '%</strong></span></div>' +
      progressBar(mp, m.cim + ' modul haladása');
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
      '<p class="big-pct"><strong>' + pct + '%</strong> kész</p>' + progressBar(pct, 'A teljes kurzus haladása', 'pbar-lg') +
      '<p class="muted">' + md.kesz + ' / ' + md.osszes + ' modul kész</p></div></div>' +
      '</div></section>' +
      '<section class="section"><div class="wrap">' + certCard() + '<h2>Modul-térkép</h2>' +
      '<p class="muted">Bármelyik modult megnyithatod bármikor. A jelölt sorrend csak ajánlás, hogy az új dolgok egymásra épüljenek.' + (recs ? ' A sorrendet a szintfelmérőd alapján állítottuk össze (<a href="#/szintfelmeres/eredmeny">részletek</a>).' : '') + '</p>' +
      '<ol class="module-map">' + cards + '</ol></div></section>',
  };
}
