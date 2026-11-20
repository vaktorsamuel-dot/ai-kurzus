// Belépési pont: betöltés, hash-alapú útválasztás, zárolási őr, közös keret.

import { loadCourse, course } from './data.js';
import { getProfile, isLoggedIn, logout, getProgress, saveProgress, isPersistent, applySettings } from './store.js';
import { chapterUnlocked, moduleUnlocked, allChaptersDone, resumeTarget, chapterHash, closingHash, moduleHash } from './progress.js';
import { esc, icon, initGlobalHandlers, toast } from './util.js';
import { isAdmin, enterAdmin, exitAdmin } from './admin.js';
import { viewHome } from './views/home.js';
import { viewIntro, viewProfile } from './views/onboarding.js';
import { viewModule } from './views/module.js';
import { viewChapter } from './views/chapter.js';
import { viewClosing } from './views/closing.js';
import { viewFinish } from './views/finish.js';
import { viewSettings } from './views/settings.js';
import { viewHelp, viewGlossary } from './views/help.js';

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
    (isAdmin() ? '' : '<button type="button" class="admin-link" data-admin="enter">Kezelő</button>') +
    '</div></footer>';
}

export function parse(hash) {
  const parts = (hash.replace(/^#\/?/, '') || '').split('/').map(decodeURIComponent).filter(Boolean);
  return parts;
}

export function resolve(parts) {
  const profil = getProfile();
  const open = ['bevezeto', 'sugo', 'szoszedet', 'beallitasok'];
  if ((!profil || !isLoggedIn()) && !open.includes(parts[0])) return { redirect: '#/bevezeto' };

  if (!parts.length) return { view: viewHome };
  switch (parts[0]) {
    case 'bevezeto': return { view: viewIntro };
    case 'profil': return { view: viewProfile };
    case 'beallitasok': return { view: viewSettings, args: [parts[1]] };
    case 'sugo': return { view: viewHelp };
    case 'szoszedet': return { view: viewGlossary };
    case 'kesz': {
      if (!getProgress().kurzusKesz) {
        setFlash('Az oklevél a záró projekt lezárása után nyílik meg.');
        return { redirect: '#/' };
      }
      return { view: viewFinish };
    }
    case 'm': {
      const mod = course.modulById[parts[1]];
      if (!mod) { setFlash('Ezt az oldalt nem találtam. Visszavittelek a főképernyőre.'); return { redirect: '#/' }; }
      if (!moduleUnlocked(mod)) {
        const prev = course.modulok[mod.index - 1];
        setFlash('„' + mod.cim + '” még zárolt. Előbb fejezd be: ' + prev.sorszam + '. modul – ' + prev.cim + '.');
        return { redirect: lockRedirect() };
      }
      if (parts[2] === 'f') {
        const ch = course.fejezetById[parts[3]];
        if (!ch || ch.modulId !== mod.id) { setFlash('Ezt a fejezetet nem találtam.'); return { redirect: moduleHash(mod) }; }
        if (!chapterUnlocked(ch)) {
          const prev = mod.fejezetek[ch.index - 1];
          setFlash('A(z) ' + ch.id + ' fejezet még zárolt. Előbb zárd le: ' + prev.id + ' ' + prev.cim + '.');
          return { redirect: lockRedirect() };
        }
        return { view: viewChapter, args: [ch] };
      }
      if (parts[2] === 'zaro') {
        if (!allChaptersDone(mod) && !isAdmin()) {
          setFlash('A modulzáró oldal akkor nyílik meg, ha a modul minden fejezetét lezártad.');
          return { redirect: lockRedirect() };
        }
        return { view: viewClosing, args: [mod] };
      }
      return { view: viewModule, args: [mod] };
    }
    default:
      setFlash('Ezt az oldalt nem találtam. Visszavittelek a főképernyőre.');
      return { redirect: '#/' };
  }
}

function lockRedirect() {
  const t = resumeTarget();
  if (t.tipus === 'fejezet') return chapterHash(t.ch);
  if (t.tipus === 'zaro') return closingHash(t.mod);
  return '#/';
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
  const adminHtml = isAdmin()
    ? '<div class="admin-bar no-print" role="status"><div class="wrap row-between"><span><strong>Kezelő mód aktív</strong> – minden modul nyitva, a haladás külön mentődik.</span>' +
      '<button type="button" class="btn btn-small admin-exit" data-admin="exit">Kilépés a kezelő módból</button></div></div>'
    : '';
  const flashHtml = flash ? '<div class="wrap"><div class="banner banner-info" role="alert">' + icon('lock') + '<span>' + esc(flash) + '</span></div></div>' : '';
  flash = null;
  main.innerHTML = adminHtml + (v.bare ? '' : header()) + flashHtml + v.html + (v.bare ? '' : footer());
  if (v.mount) cleanup = v.mount(main) || null;
  window.scrollTo(0, 0);
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
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-logout]')) { logout(); go('#/bevezeto'); return; }
    const b = e.target.closest('[data-admin]');
    if (!b) return;
    if (b.dataset.admin === 'enter') {
      const pin = window.prompt('Kezelő mód – add meg a PIN-kódot:');
      if (pin === null) return;
      if (enterAdmin(pin)) location.reload();
      else toast('Hibás PIN-kód.');
    } else {
      exitAdmin();
      location.reload();
    }
  });
  if (!isPersistent()) showStorageWarning();
  document.addEventListener('storage-fallback', showStorageWarning);
  try {
    await loadCourse();
  } catch (e) {
    document.getElementById('main').innerHTML =
      '<div class="wrap-narrow section"><h1>Nem sikerült betölteni a kurzust</h1>' +
      '<p>A tartalomfájlok nem töltődtek be (' + esc(e.message) + ').</p>' +
      '<p>Ha a gépeden közvetlenül nyitottad meg az <code>index.html</code>-t, indíts egy helyi szervert a mappában: <code>python3 -m http.server</code>, majd nyisd meg a <code>http://localhost:8000</code> címet. Részletek a README-ben.</p></div>';
    return;
  }
  window.addEventListener('hashchange', render);
  render();
}

start();
