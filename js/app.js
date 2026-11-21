// Belépési pont: betöltés, hash-alapú útválasztás, közös keret. Nincs zárolás: minden oldal közvetlen linkről is megnyílik.

import { loadCourse, course, getCourseStats } from './data.js?v=991a70c2';
import { getProfile, isLoggedIn, logout, getProgress, saveProgress, isPersistent, applySettings, setReturnTo } from './store.js?v=991a70c2';
import { moduleHash } from './progress.js?v=991a70c2';
import { esc, icon, initGlobalHandlers, toast } from './util.js?v=991a70c2';
import { viewHome } from './views/home.js?v=991a70c2';
import { viewIntro, viewProfile } from './views/onboarding.js?v=991a70c2';
import { viewModule } from './views/module.js?v=991a70c2';
import { viewChapter } from './views/chapter.js?v=991a70c2';
import { viewClosing } from './views/closing.js?v=991a70c2';
import { viewFinish } from './views/finish.js?v=991a70c2';
import { viewAssess, viewAssessResult } from './views/szintfelmeres.js?v=991a70c2';
import { viewKezelo, viewKezeloCert } from './views/kezelo.js?v=991a70c2';
import { initFeedbackSync } from './feedback.js?v=991a70c2';
import { viewSettings } from './views/settings.js?v=991a70c2';
import { viewHelp, viewGlossary } from './views/help.js?v=991a70c2';
import { fxPage, initFx } from './fx.js?v=991a70c2';
import { initMediaZoom } from './components/media.js?v=991a70c2';
import { initStepFigures } from './components/stepfigure.js?v=991a70c2';

let flash = null;
export function setFlash(msg) { flash = msg; }

export function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}

function showStorageWarning() {
  const b = document.getElementById('storage-warning');
  b.textContent = 'A böngésző nem engedi a helyi mentést (például privát ablakban). A kurzus most is működik, de a haladásod csak ennek a lapnak a bezárásáig marad meg. Tipp: a Beállításokban exportálhatod a haladást.';
  b.hidden = false;
}

function header() {
  return '<header class="site-header no-print"><div class="wrap row-between">' +
    '<a class="brand" href="#/">' + icon('home') + '<span>AI a hétköznapokban</span></a>' +
    '<nav class="row header-nav" aria-label="Fő navigáció">' +
    '<a href="#/szoszedet" class="hdr-link">' + icon('book') + '<span>Szószedet</span></a>' +
    '<a href="#/sugo" class="hdr-link">' + icon('help') + '<span>Súgó</span></a>' +
    '<a href="#/beallitasok" class="hdr-link">' + icon('settings') + '<span>Beállítások</span></a>' +
    '<button type="button" class="hdr-link hdr-logout" data-logout>' + icon('lock') + '<span>Kilépés</span></button>' +
    '</nav></div></header>';
}

function footer() {
  return '<footer class="site-footer no-print"><div class="wrap row-between">' +
    '<nav class="row" aria-label="Lábléc">' +
    '<a href="#/beallitasok">Beállítások</a><a href="#/sugo">Súgó</a><a href="#/szoszedet">Szószedet</a>' +
    '<a href="#/beallitasok/haladas">Haladás exportálása / importálása</a>' +
    '</nav>' +
    '</div></footer>';
}

export function parse(hash) {
  const parts = (hash.replace(/^#\/?/, '') || '').split('/').map(decodeURIComponent).filter(Boolean);
  return parts;
}

export function resolve(parts) {
  const profil = getProfile();
  const open = ['bevezeto', 'sugo', 'szoszedet', 'beallitasok', 'kezelo'];
  if ((!profil || !isLoggedIn()) && !open.includes(parts[0])) {
    // Belépés nélkül megnyitott (mély)link: belépés után ide visszük vissza.
    setReturnTo(location.hash);
    return { redirect: '#/bevezeto' };
  }

  // Első megnyitáskor (még nem töltötte ki, és nem is hagyta ki) a szintfelmérő jön; mélylinket nem érint.
  if (!parts.length && getProgress().szintfelmeres === null) return { redirect: '#/szintfelmeres' };
  if (!parts.length) return { view: viewHome };
  switch (parts[0]) {
    case 'bevezeto': return { view: viewIntro };
    case 'profil': return { view: viewProfile };
    case 'beallitasok': return { view: viewSettings, args: [parts[1]] };
    case 'sugo': return { view: viewHelp };
    case 'szoszedet': return { view: viewGlossary };
    case 'kesz': return { redirect: '#/oklevel' }; // régi cím
    case 'oklevel': return { view: viewFinish };
    case 'szintfelmeres': return { view: parts[1] === 'eredmeny' ? viewAssessResult : viewAssess };
    case 'kezelo': return { view: parts[1] === 'oklevel' ? viewKezeloCert : viewKezelo };
    case 'm': {
      const mod = course.modulById[parts[1]];
      if (!mod) { setFlash('Ezt az oldalt nem találtam. Visszavittelek a főképernyőre.'); return { redirect: '#/' }; }
      if (parts[2] === 'f') {
        const ch = course.fejezetById[parts[3]];
        if (!ch || ch.modulId !== mod.id) { setFlash('Ezt a fejezetet nem találtam.'); return { redirect: moduleHash(mod) }; }
        return { view: viewChapter, args: [ch] };
      }
      if (parts[2] === 'zaro') {
        return { view: viewClosing, args: [mod] };
      }
      return { view: viewModule, args: [mod] };
    }
    default:
      setFlash('Ezt az oldalt nem találtam. Visszavittelek a főképernyőre.');
      return { redirect: '#/' };
  }
}

let cleanup = null;
async function render() {
  const parts = parse(location.hash);
  const r = resolve(parts);
  if (r.redirect) { location.replace(r.redirect); return; }

  if (cleanup) { try { cleanup(); } catch (e) { /* nincs teendő */ } cleanup = null; }
  const main = document.getElementById('main');
  const v = r.view(...(r.args || []));
  document.title = (v.title ? v.title + ' – ' : '') + 'AI a hétköznapokban';
  const flashHtml = flash ? '<div class="wrap"><div class="banner banner-info" role="alert">' + icon('lock') + '<span>' + esc(flash) + '</span></div></div>' : '';
  flash = null;
  main.innerHTML = (v.bare ? '' : header()) + flashHtml + v.html + (v.bare ? '' : footer());
  if (v.mount) cleanup = v.mount(main) || null;
  window.scrollTo(0, 0);
  main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
  fxPage(main);
  main.focus({ preventScroll: true });

  if (v.track) {
    const p = getProgress();
    p.utoljara = { ido: new Date().toISOString(), hash: location.hash, cim: v.track };
    saveProgress();
  }
}

async function start() {
  applySettings();
  initGlobalHandlers();
  initMediaZoom();
  initStepFigures();
  initFx();
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) { logout(); go('#/bevezeto'); }
  });
  if (!isPersistent()) showStorageWarning();
  document.addEventListener('storage-fallback', showStorageWarning);
  try {
    await loadCourse();
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Interaktív, magyar nyelvű kurzus az AI magabiztos, okos és biztonságos hétköznapi használatához: ' + getCourseStats().label + '.');
  } catch (e) {
    document.getElementById('main').innerHTML =
      '<div class="wrap-narrow section"><h1>Nem sikerült betölteni a kurzust</h1>' +
      '<p>A tartalomfájlok nem töltődtek be (' + esc(e.message) + ').</p>' +
      '<p>Ha a gépeden közvetlenül nyitottad meg az <code>index.html</code>-t, indíts egy helyi szervert a mappában: <code>python3 -m http.server</code>, majd nyisd meg a <code>http://localhost:8000</code> címet. Részletek a README-ben.</p></div>';
    return;
  }
  window.addEventListener('hashchange', render);
  initFeedbackSync();
  render();
}

start();
