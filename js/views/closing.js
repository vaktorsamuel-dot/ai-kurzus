// Modulzáró oldal: összefoglalás, modulkvíz, lezárás, gratuláló kártya.

import { course } from '../data.js';
import { moduleState, saveProgress, getProgress } from '../store.js';
import { moduleQuizPassed, moduleClosed, moduleHash } from '../progress.js';
import { esc, md, icon } from '../util.js';
import { isAdmin } from '../admin.js';
import { renderQuiz } from '../components/quiz.js';

export function viewClosing(mod) {
  const ms = moduleState(mod.id);
  const isFinal = mod.id === 'zp';
  const next = course.modulok[mod.index + 1] || null;
  const quiz = mod.kviz && mod.kviz.length ? renderQuiz(mod.kviz, {
    best: ms.kviz,
    onResult(score, passed) {
      const prev = ms.kviz || {};
      ms.kviz = { score: Math.max(prev.score || 0, score), passed: !!prev.passed || passed, utolso: score };
      saveProgress();
      refresh();
    },
  }) : null;

  function congrats() {
    return '<div class="card congrats" tabindex="-1" id="congrats">' + icon('check', 'congrats-icon') +
      '<h2>' + (isFinal ? 'Elkészültél a kurzussal.' : 'A(z) ' + mod.sorszam + '. modult lezártad.') + '</h2>' +
      '<p>' + (isFinal ? 'Az oklevelet kinyomtathatod vagy elmentheted PDF-ként.' : esc(mod.cim) + ' – kész. ' + (next ? 'Megnyílt a következő modul: ' + esc(next.cim) + '.' : '')) + '</p>' +
      '<div class="row">' +
      (isFinal ? '<a class="btn btn-accent btn-lg" href="#/kesz">Az oklevelem' + icon('arrowRight') + '</a>'
        : next ? '<a class="btn btn-accent btn-lg" href="' + moduleHash(next) + '">Tovább a következő modulra' + icon('arrowRight') + '</a>' : '') +
      '<a class="btn btn-ghost btn-lg" href="#/">' + icon('home') + 'Vissza a főképernyőre</a></div></div>';
  }

  function refresh() {
    const root = document.querySelector('.closing');
    if (!root) return;
    const btn = root.querySelector('#close-mod');
    const out = root.querySelector('#close-state');
    if (moduleClosed(mod)) {
      btn.hidden = true;
      out.innerHTML = congrats();
      return;
    }
    const ok = moduleQuizPassed(mod) || isAdmin(); // kezelő módban a kvíz nem akadály
    btn.disabled = !ok;
    out.innerHTML = ok ? '' : '<p class="small">A lezáráshoz érj el legalább 60%-ot a modulkvízen.</p>';
  }

  return {
    title: isFinal ? 'A kurzus lezárása' : mod.sorszam + '. modul lezárása',
    track: isFinal ? 'A kurzus lezárása' : mod.sorszam + '. modul lezárása',
    html:
      '<div class="wrap-narrow section closing">' +
      '<nav class="row crumbs no-print" aria-label="Morzsamenü"><a class="btn btn-ghost btn-small" href="' + moduleHash(mod) + '">' + icon('arrowLeft') + 'Vissza a modulra</a>' +
      '<a class="btn btn-ghost btn-small" href="#/">' + icon('home') + 'Főképernyő</a></nav>' +
      '<p class="eyebrow">' + (isFinal ? 'Záró projekt' : mod.sorszam + '. modul') + '</p>' +
      '<h1>' + (isFinal ? 'A kurzus lezárása' : 'Modulzáró: ' + esc(mod.cim)) + '</h1>' +
      '<div class="card"><h2 class="h-small">Összefoglalás</h2><ul class="summary">' + (mod.osszefoglalo || []).map((s) => '<li>' + md(s) + '</li>').join('') + '</ul></div>' +
      (quiz ? '<section class="ch-sec"><h2>Modulkvíz</h2><p class="muted">' + mod.kviz.length + ' kérdés a modul egészéből. Legalább 60% kell, korlátlanul próbálkozhatsz.</p>' + quiz.html + '</section>' : '') +
      '<div class="ch-nav card no-print"><div class="ch-nav-row">' +
      '<button type="button" class="btn btn-accent btn-lg" id="close-mod">' + icon('check') + '<span>' + (isFinal ? 'Kurzus lezárása' : 'Modul lezárása') + '</span></button></div>' +
      '<div id="close-state" aria-live="polite"></div></div>' +
      '</div>',
    mount(root) {
      if (quiz) quiz.mount(root);
      root.querySelector('#close-mod').addEventListener('click', () => {
        if (!moduleQuizPassed(mod) && !isAdmin()) { refresh(); return; }
        ms.lezarva = true;
        ms.kihagyva = false;
        ms.lezarasIdo = new Date().toISOString();
        if (isFinal) getProgress().kurzusKesz = new Date().toISOString();
        saveProgress();
        refresh();
        const c = root.querySelector('#congrats');
        if (c) c.focus();
      });
      refresh();
    },
  };
}

