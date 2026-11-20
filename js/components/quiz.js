// Kvíz: azonnali, magyarázatos visszajelzés, korlátlan újrapróbálkozás, legjobb eredmény mentése.

import { QUIZ_PASS } from '../progress.js?v=6dc27975';
import { esc, md, icon } from '../util.js?v=6dc27975';

let quizSeq = 0;

export function renderQuiz(questions, opts) {
  const qid = 'quiz-' + (++quizSeq);
  const best = opts.best;
  const prev = best ? '<p class="quiz-best small">' + (best.passed ? icon('check') + ' Korábbi legjobb eredményed: ' + best.score + '% – teljesítve.' : 'Korábbi legjobb eredményed: ' + best.score + '%. A továbblépéshez 60% kell.') + '</p>' : '';

  const html = '<div class="quiz" id="' + qid + '">' + prev +
    '<ol class="quiz-list">' + questions.map((q, i) =>
      '<li class="quiz-q" data-i="' + i + '"><fieldset><legend><span class="quiz-n">' + (i + 1) + '. kérdés</span> ' + md(q.k) + '</legend>' +
      '<div class="quiz-opts">' + q.v.map((v, j) =>
        '<button type="button" class="quiz-opt" data-j="' + j + '"><span class="quiz-mark" aria-hidden="true"></span><span>' + md(v) + '</span></button>').join('') +
      '</div><div class="quiz-fb" aria-live="polite"></div></fieldset></li>').join('') +
    '</ol><div class="quiz-result" aria-live="polite"></div></div>';

  function mount(root) {
    const box = root.querySelector('#' + qid);
    const answers = new Array(questions.length).fill(null);

    function finish() {
      const correct = answers.filter((a, i) => a === questions[i].h).length;
      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= QUIZ_PASS * 100;
      const res = box.querySelector('.quiz-result');
      res.innerHTML = '<div class="callout ' + (passed ? 'callout-done' : 'callout-warn') + '">' + icon(passed ? 'check' : 'warn') + '<div>' +
        '<strong>' + correct + ' / ' + questions.length + ' helyes (' + score + '%).</strong> ' +
        (passed ? 'Teljesítetted a kvízt.' : 'A továbblépéshez legalább 60% kell. Nézd át a magyarázatokat, és próbáld újra – annyiszor, ahányszor szeretnéd.') +
        '<div class="row" style="margin-top:.6rem"><button type="button" class="btn btn-ghost btn-small quiz-retry">Újrapróbálom</button></div></div></div>';
      res.querySelector('.quiz-retry').addEventListener('click', reset);
      opts.onResult(score, passed);
    }

    function reset() {
      answers.fill(null);
      box.querySelectorAll('.quiz-opt').forEach((b) => { b.disabled = false; b.className = 'quiz-opt'; b.removeAttribute('aria-pressed'); });
      box.querySelectorAll('.quiz-fb').forEach((f) => { f.innerHTML = ''; });
      box.querySelector('.quiz-result').innerHTML = '';
      const first = box.querySelector('.quiz-opt');
      if (first) first.focus();
    }

    box.addEventListener('click', (e) => {
      const b = e.target.closest('.quiz-opt');
      if (!b || b.disabled) return;
      const li = b.closest('.quiz-q');
      const i = Number(li.dataset.i);
      const j = Number(b.dataset.j);
      const q = questions[i];
      answers[i] = j;
      li.querySelectorAll('.quiz-opt').forEach((o) => {
        o.disabled = true;
        const k = Number(o.dataset.j);
        if (k === q.h) o.classList.add('is-correct');
        if (k === j && j !== q.h) o.classList.add('is-wrong');
      });
      b.setAttribute('aria-pressed', 'true');
      const ok = j === q.h;
      li.querySelector('.quiz-fb').innerHTML = '<p class="' + (ok ? 'fb-ok' : 'fb-no') + '">' + icon(ok ? 'check' : 'warn') +
        '<span><strong>' + (ok ? 'Helyes.' : 'Nem egészen.') + '</strong> ' + md(q.m || '') + '</span></p>';
      if (answers.every((a) => a !== null)) finish();
    });
  }

  return { html, mount };
}
