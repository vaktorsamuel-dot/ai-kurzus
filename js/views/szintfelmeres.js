// Szintfelmérő nézetek: bevezető + kérdések egyenként (#/szintfelmeres) és eredmény (#/szintfelmeres/eredmeny).
// Nem vizsga: nem zár le és nem teljesít semmit, csak az ajánlott sorrendet és az „Ajánlott következő” jelzést állítja.

import { QUESTIONS, LABELS, saveAssessment, skipAssessment, getRecs, hasAnswers, recommendedOrder } from '../assess.js?v=991a70c2';
import { chapterHash, moduleHash, moduleClosed, resumeTarget } from '../progress.js?v=991a70c2';
import { esc, icon, progressBar } from '../util.js?v=991a70c2';
import { go } from '../app.js?v=991a70c2';

export function viewAssess() {
  return {
    title: 'Szintfelmérő',
    html: '<div class="wrap-narrow section assess"><div id="assess-box" tabindex="-1"></div></div>',
    mount(root) {
      const box = root.querySelector('#assess-box');
      const total = QUESTIONS.length;
      const answers = {};
      let step = -1; // -1: bevezető

      function intro() {
        box.innerHTML =
          '<p class="eyebrow">Kezdő szintfelmérő</p>' +
          '<h1>Nézzük meg, hol tartasz</h1>' +
          '<p class="lead">Ez nem vizsga. Hét rövid kérdés, nagyjából két perc. Nincs rossz válasz: ha valamit nem tudsz, jelöld a „Nem tudom” lehetőséget, és ne találgass.</p>' +
          '<div class="callout callout-tip">' + icon('tip') + '<div><p>A kérdések alapján javaslok egy sorrendet. <strong>Semmi nem záródik le</strong>, minden modul nyitva marad, és a haladás csak akkor nő, ha valóban elvégzel valamit.</p></div></div>' +
          '<div class="row assess-actions"><button type="button" class="btn btn-accent btn-lg" id="as-start">Kezdjük' + icon('arrowRight') + '</button>' +
          '<button type="button" class="btn btn-ghost btn-lg" id="as-skip">Kihagyom</button></div>';
        box.querySelector('#as-start').addEventListener('click', () => { step = 0; question(); });
        box.querySelector('#as-skip').addEventListener('click', skip);
        box.focus({ preventScroll: true });
      }

      function skip() {
        skipAssessment();
        go('#/');
      }

      function question() {
        const q = QUESTIONS[step];
        const multi = q.tipus === 'tobb';
        const cur = answers[q.id];
        const name = 'as-' + q.id;
        const opts = q.opciok.map(([v, l]) => {
          const checked = multi ? (Array.isArray(cur) && cur.includes(v)) : cur === v;
          return '<label class="choice choice-block"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + v + '"' + (checked ? ' checked' : '') + '><span>' + esc(l) + '</span></label>';
        }).join('');
        box.innerHTML =
          '<p class="eyebrow">' + (step + 1) + '. kérdés a ' + total + '-ből</p>' +
          progressBar(Math.round(((step + 1) / total) * 100), 'Szintfelmérő haladása') +
          '<fieldset class="field assess-q"><legend><h2 class="h-small">' + esc(q.kerdes) + '</h2></legend>' +
          (multi ? '<p class="small muted">Több választ is jelölhetsz.</p>' : '') +
          (q.onertekeles ? '<p class="small muted">Itt nincs rossz válasz.</p>' : '') +
          '<div class="choices">' + opts + '</div></fieldset>' +
          '<div class="row assess-actions">' +
          (step > 0 ? '<button type="button" class="btn btn-ghost" id="as-back">' + icon('arrowLeft') + 'Vissza</button>' : '') +
          '<button type="button" class="btn btn-accent btn-lg" id="as-next"' + (cur && (!multi || cur.length) ? '' : ' disabled') + '>' + (step === total - 1 ? 'Eredmény' : 'Tovább') + icon('arrowRight') + '</button>' +
          '<button type="button" class="btn btn-ghost" id="as-skip">Kihagyom</button></div>';

        const next = box.querySelector('#as-next');
        box.querySelectorAll('input').forEach((inp) => inp.addEventListener('change', () => {
          if (multi) {
            let sel = [...box.querySelectorAll('input:checked')].map((x) => x.value);
            // „Semmi ezek közül” kizárja a többit.
            if (inp.value === 'semmi' && inp.checked) { sel = ['semmi']; box.querySelectorAll('input').forEach((x) => { x.checked = x.value === 'semmi'; }); }
            else if (inp.value !== 'semmi' && inp.checked) { sel = sel.filter((x) => x !== 'semmi'); const s = box.querySelector('input[value="semmi"]'); if (s) s.checked = false; }
            answers[q.id] = sel;
            next.disabled = sel.length === 0;
          } else {
            answers[q.id] = inp.value;
            next.disabled = false;
          }
        }));
        next.addEventListener('click', () => {
          if (next.disabled) return;
          if (step < total - 1) { step += 1; question(); } else finish();
        });
        const back = box.querySelector('#as-back');
        if (back) back.addEventListener('click', () => { step -= 1; question(); });
        box.querySelector('#as-skip').addEventListener('click', skip);
        box.focus({ preventScroll: true });
        const first = box.querySelector('input:checked') || box.querySelector('input');
        if (first) first.focus({ preventScroll: true });
      }

      function finish() {
        // A K7 „semmi ezek közül” egyetlen tételként mentődik; a tudásos kérdések szó szerinti betűjellel.
        saveAssessment(Object.assign({}, answers));
        go('#/szintfelmeres/eredmeny');
      }

      intro();
    },
  };
}

export function viewAssessResult() {
  if (!hasAnswers()) {
    return { title: 'Szintfelmérő', html: '<div class="wrap-narrow section"><h1>Szintfelmérő</h1><p>Még nincs kitöltött szintfelmérőd.</p><a class="btn btn-accent btn-lg" href="#/szintfelmeres">Kitöltöm</a></div>' };
  }
  const recs = getRecs();
  const order = recommendedOrder();
  const rows = order.map((m) => {
    const r = recs[m.id] || { allapot: 'ajanlott', ok: '' };
    const label = m.id === 'zp' ? m.cim : m.sorszam + '. ' + m.cim;
    return '<li class="as-row as-' + r.allapot + '"><div><a href="' + moduleHash(m) + '"><strong>' + esc(label) + '</strong></a>' +
      '<p class="small muted">' + esc(r.ok) + '</p></div><span class="as-badge as-badge-' + r.allapot + '">' + esc(LABELS[r.allapot]) + '</span></li>';
  }).join('');

  const first = order.find((m) => (recs[m.id] || {}).allapot === 'ajanlott' && !moduleClosed(m)) || order.find((m) => !moduleClosed(m)) || order[0];
  const target = resumeTarget();
  const startHash = target.tipus === 'fejezet' && target.ch.modulId === first.id ? chapterHash(target.ch) : (first.fejezetek && first.fejezetek.length ? chapterHash(first.fejezetek[0]) : moduleHash(first));

  return {
    title: 'Szintfelmérő eredménye',
    html:
      '<div class="wrap-narrow section assess">' +
      '<p class="eyebrow">Kezdő szintfelmérő</p><h1>Ez a javasolt sorrend</h1>' +
      '<p class="lead">Ez csak ajánlás. <strong>Minden modul nyitva marad</strong>, és semmi nem lett „kész” a felmérés miatt: a haladás csak a valódi elvégzéssel nő.</p>' +
      '<ol class="as-list">' + rows + '</ol>' +
      '<div class="row assess-actions"><a class="btn btn-accent btn-lg" href="' + startHash + '">Kezdjük: ' + esc(first.id === 'zp' ? first.cim : first.sorszam + '. modul') + icon('arrowRight') + '</a>' +
      '<a class="btn btn-ghost" href="#/">Főképernyő</a><a class="btn btn-ghost" href="#/szintfelmeres">Szintfelmérő újra</a></div>' +
      '</div>',
  };
}
