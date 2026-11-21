// Fejezetoldal – a fő sablon (leírás 6. pontja).

import { course } from '../data.js?v=991a70c2';
import { chapterState, getProgress, saveProgress, getProfile } from '../store.js?v=991a70c2';
import {
  chapterPct, modulePct, missingForClose, canCloseChapter, chapterHash, moduleHash, closingHash, nextChapterOf, prevChapterOf, videoRequired,
} from '../progress.js?v=991a70c2';
import { esc, md, icon, progressBar, fmtMin, promptBox, toast } from '../util.js?v=991a70c2';
import { image, bindImageFallbacks } from '../components/media.js?v=991a70c2';
import { renderPlayer } from '../components/player.js?v=991a70c2';
import { renderQuiz } from '../components/quiz.js?v=991a70c2';
import { diagram } from '../components/diagrams.js?v=991a70c2';
import { stepFigure } from '../components/stepfigure.js?v=991a70c2';
import { renderCompare } from '../components/compare.js?v=991a70c2';
import { toolName } from './onboarding.js?v=991a70c2';
import { feedbackBlock, mountFeedback } from '../components/feedback.js?v=991a70c2';

// Újrahasznosítható „Ellenőrizd!” figyelmeztető doboz (ikon + 1-2 mondat).
export function ellenorizd(text) {
  return '<aside class="check-box" role="note">' + icon('check', 'check-box-icon') + '<div><strong>Ellenőrizd!</strong> ' + md(text) + '</div></aside>';
}

// Nyomtatható, egyoldalas kártya (A4, csak a kártya nyomtatódik).
function checkCard(c) {
  return '<figure class="print-card-wrap"><article class="print-card" aria-label="' + esc(c.cim) + '">' +
    '<header><p class="print-card-kicker">AI a hétköznapokban</p><h3>' + esc(c.cim) + '</h3>' + (c.alcim ? '<p class="print-card-sub">' + esc(c.alcim) + '</p>' : '') + '</header>' +
    '<ol class="print-card-list">' + c.kerdesek.map((q) => '<li><span class="print-card-box" aria-hidden="true"></span><div><strong>' + esc(q.k) + '</strong><p>' + md(q.r) + '</p></div></li>').join('') + '</ol>' +
    '<div class="print-card-notes"><p>Téma: ______________________________</p><p>Hol ellenőriztem: ______________________________</p></div>' +
    (c.lab ? '<footer>' + esc(c.lab) + '</footer>' : '') +
    '</article><div class="no-print"><button type="button" class="btn btn-primary" data-print-card>' + icon('print') + 'Kártya nyomtatása</button></div></figure>';
}

function block(b) {
  if (typeof b === 'string') return '<p>' + md(b) + '</p>';
  if (b.lista) return '<ul>' + b.lista.map((x) => '<li>' + md(x) + '</li>').join('') + '</ul>';
  if (b.szamozott) return '<ol>' + b.szamozott.map((x) => '<li>' + md(x) + '</li>').join('') + '</ol>';
  if (b.tipp) return '<div class="callout callout-tip">' + icon('tip') + '<div><strong>Tipp</strong> ' + md(b.tipp) + '</div></div>';
  if (b.vigyazat) return '<div class="callout callout-warn">' + icon('warn') + '<div><strong>Vigyázat</strong> ' + md(b.vigyazat) + '</div></div>';
  if (b.abra) return '<figure class="figure">' + diagram(b.abra) + (b.felirat ? '<figcaption class="muted small">' + md(b.felirat) + '</figcaption>' : '') + '</figure>';
  if (b.osszehasonlitas) return renderCompare();
  if (b.lepesabra) return stepFigure(b.lepesabra);
  if (b.ellenorizd) return ellenorizd(b.ellenorizd);
  if (b.kartya) return checkCard(b.kartya);
  if (b.prompt) return promptBox(b.prompt, b.cim || 'Másolható kérés');
  if (b.pelda) return '<div class="example"><p class="example-label">' + esc(b.cim || 'Példa') + '</p>' + b.pelda.map((p) => '<p>' + md(p) + '</p>').join('') + '</div>';
  if (b.tabla) return '<div class="table-scroll"><table class="table"><thead><tr>' + b.tabla[0].map((h) => '<th scope="col">' + md(h) + '</th>').join('') + '</tr></thead><tbody>' +
    b.tabla.slice(1).map((r) => '<tr>' + r.map((c, i) => (i === 0 ? '<th scope="row">' : '<td>') + md(c) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</tbody></table></div>' +
    (b.forras ? '<p class="small muted">' + md(b.forras) + '</p>' : '');
  return '';
}

export function renderBlocks(list) { return (list || []).map(block).join(''); }

function suggestion(ch, mod) {
  const p = getProfile() || {};
  const map = (ch.gyakorlat && ch.gyakorlat.javaslat) || mod.javaslat || {};
  const goal = (p.celok || []).find((g) => map[g]);
  if (!goal) return '';
  return '<div class="callout callout-personal">' + icon('star') + '<div><strong>Neked javasolt gyakorlat</strong> ' + md(map[goal]) + '</div></div>';
}

export function viewChapter(ch) {
  const mod = course.modulById[ch.modulId];
  const st = chapterState(ch.id);
  const p = getProgress();
  p.aktualis = ch.id;
  saveProgress();

  const g = ch.gyakorlat;
  const tool = toolName((getProfile() || {}).eszkoz);
  const player0 = ch.video ? renderPlayer(ch.video.media, ch.id) : null;
  const player = player0 && !player0.empty ? player0 : null;
  const quiz = ch.kviz && ch.kviz.length ? renderQuiz(ch.kviz, {
    best: st.kviz,
    onResult(score, passed) {
      const prev = st.kviz || { best: 0, passed: false };
      st.kviz = { score: Math.max(prev.score || 0, score), passed: prev.passed || passed, utolso: score };
      saveProgress();
      refresh();
    },
  }) : null;

  const prev = prevChapterOf(ch);
  const next = nextChapterOf(ch);
  const sec = (id, title, body, cls = '') => {
    return '<section class="ch-sec ' + cls + '" id="' + id + '" aria-labelledby="' + id + '-h"><h2 id="' + id + '-h">' + title + '</h2>' + body + '</section>'; };

  const sections = (ch.szakaszok || []).map((s, i) => '<section class="ch-sec ch-sec-card" id="sz-' + i + '"><h2>' + esc(s.cim) + '</h2>' + renderBlocks(s.blokkok) + '</section>').join('');

  // Tartalomjegyzék (laptopon a bal oldalon, görgetéskor követi az olvasót)
  const toc = [['celok', 'Ezt fogod tudni']]
    .concat((ch.szakaszok || []).map((s, i) => ['sz-' + i, s.cim]));
  if (player) toc.push(['video', 'Videó']);
  if (g) toc.push(['gyakorlat', 'Próbáld ki most']);
  if (quiz) toc.push(['kviz', 'Mini kvíz']);
  toc.push(['osszefoglalo', 'Összefoglalva']);
  const tocHtml = '<aside class="ch-toc no-print" aria-label="A fejezet részei"><p class="ch-toc-title">Ebben a fejezetben</p><ol>' +
    toc.map((t, i) => '<li><a href="#" data-toc="' + t[0] + '"><span class="toc-n">' + (i + 1) + '</span><span>' + esc(t[1]) + '</span></a></li>').join('') + '</ol></aside>';

  const exercise = g ? sec('gyakorlat', 'Próbáld ki most',
    '<div class="exercise card">' +
    '<p class="meta">' + icon('clock') + fmtMin(g.ido || 10) + ' · ' + (tool ? 'a te eszközödben: ' + esc(tool) : 'bármelyik ingyenes AI-eszközben (például ChatGPT, Claude vagy Gemini)') + '</p>' +
    '<h3 class="ex-title">' + esc(g.cim) + '</h3>' + (g.bevezeto ? '<p>' + md(g.bevezeto) + '</p>' : '') +
    '<ol class="ex-steps">' + g.lepesek.map((l) => '<li>' + md(l) + '</li>').join('') + '</ol>' +
    (g.promptok || []).map((pr) => promptBox(pr.szoveg, pr.cim)).join('') +
    suggestion(ch, mod) +
    '<div class="field"><label for="ex-note">Saját jegyzetem <span class="muted">(nem kötelező, csak itt mentődik)</span></label>' +
    '<textarea id="ex-note" rows="3" placeholder="' + esc(g.jegyzetMinta || 'Mit tapasztaltál? Mi működött, mi nem?') + '">' + esc(st.szovegek.jegyzet || '') + '</textarea></div>' +
    '<label class="check-big"><input type="checkbox" id="ex-done"' + (st.gyakorlat ? ' checked' : '') + '><span>Megcsináltam</span></label>' +
    '</div>') : '';

  const html =
    '<div class="chapter">' +
    '<div class="ch-header no-print"><div class="wrap">' +
    '<nav class="row crumbs" aria-label="Morzsamenü"><a class="btn btn-ghost btn-small" href="' + moduleHash(mod) + '">' + icon('arrowLeft') + 'Vissza a modulra</a>' +
    '<a class="btn btn-ghost btn-small" href="#/">' + icon('home') + 'Főképernyő</a></nav>' +
    '<p class="eyebrow">' + (mod.id === 'zp' ? 'Záró projekt' : mod.sorszam + '. modul – ' + esc(mod.cim)) + '</p>' +
    '<h1><span class="ch-id">' + esc(ch.label) + '</span> ' + esc(ch.cim) + '</h1>' +
    '<div class="ch-bars"><div><span class="small">Fejezet: <strong class="js-ch-pct">0%</strong></span><div class="js-ch-bar"></div></div>' +
    '<div><span class="small">Modul: <strong class="js-mod-pct">0%</strong></span><div class="js-mod-bar"></div></div>' +
    '<span class="meta">' + icon('clock') + fmtMin(ch.ido) + '</span></div>' +
    '</div></div>' +
    '<div class="wrap ch-layout">' + tocHtml + '<div class="ch-body">' +
    '<div class="card goals" id="celok"><h2 class="h-small">Ezt fogod tudni a végén</h2><ul class="checklist-static">' + ch.celok.map((c) => '<li>' + icon('check') + '<span>' + md(c) + '</span></li>').join('') + '</ul></div>' +
    (ch.hero ? image(ch.hero, 'hero') : '') +
    sections +
    (player ? sec('video', 'Videó', (ch.video.bevezeto ? '<p>' + md(ch.video.bevezeto) + '</p>' : '') + player.html) : '') +
    exercise +
    (quiz ? sec('kviz', 'Mini kvíz', '<details class="quiz-fold"><summary><span>Mini kvíz megnyitása</span><span class="muted small">' + ch.kviz.length + ' kérdés · legalább 60% kell · korlátlanul próbálkozhatsz</span></summary>' +
      '<div class="quiz-fold-body">' + quiz.html + '</div></details>') : '') +
    sec('osszefoglalo', 'Összefoglalva', '<ul class="summary">' + ch.osszefoglalo.map((s) => '<li>' + md(s) + '</li>').join('') + '</ul>', 'summary-sec') +
    '<div id="read-sentinel" aria-hidden="true"></div>' +
    feedbackBlock() +
    '<nav class="ch-nav card no-print" aria-label="Fejezet navigáció">' +
    '<div class="ch-nav-row">' +
    (prev ? '<a class="btn btn-ghost" href="' + chapterHash(prev) + '">' + icon('arrowLeft') + 'Előző fejezet</a>' : '<a class="btn btn-ghost" href="' + moduleHash(mod) + '">' + icon('arrowLeft') + 'Modul áttekintő</a>') +
    '<button type="button" class="btn btn-accent btn-lg" id="close-ch">' + icon('check') + '<span>Fejezet lezárása</span></button>' +
    '<a class="btn btn-primary btn-lg" id="next-ch" hidden href="' + (next ? chapterHash(next) : closingHash(mod)) + '">' + (next ? 'Következő fejezet' : (mod.id === 'zp' ? 'A kurzus lezárása' : 'Tovább a modulzáróra')) + icon('arrowRight') + '</a>' +
    '</div><div class="ch-missing" aria-live="polite"></div></nav>' +
    '</div></div></div>';

  function refresh() {
    const cp = chapterPct(ch);
    const mp = modulePct(mod);
    const root = document.querySelector('.chapter');
    if (!root) return;
    root.querySelector('.js-ch-pct').textContent = cp + '%';
    root.querySelector('.js-mod-pct').textContent = mp + '%';
    root.querySelector('.js-ch-bar').innerHTML = progressBar(cp, 'Fejezet haladása');
    root.querySelector('.js-mod-bar').innerHTML = progressBar(mp, 'Modul haladása');
    const btn = root.querySelector('#close-ch');
    const nx = root.querySelector('#next-ch');
    const miss = root.querySelector('.ch-missing');
    if (st.kesz) {
      btn.hidden = true;
      nx.hidden = false;
      miss.innerHTML = '<p class="fb-ok">' + icon('check') + '<span>Ezt a fejezetet lezártad. Bármikor visszanézheted.</span></p>';
      return;
    }
    const m = missingForClose(ch);
    btn.disabled = m.length > 0;
    btn.setAttribute('aria-describedby', 'ch-missing-list');
    miss.innerHTML = m.length
      ? '<p class="small"><strong>A lezáráshoz még hátravan:</strong></p><ul class="small" id="ch-missing-list">' + m.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>'
      : '<p class="small fb-ok" id="ch-missing-list">' + icon('check') + '<span>Minden megvan – lezárhatod a fejezetet.</span></p>';
  }

  return {
    title: ch.label + ' ' + ch.cim,
    track: ch.label + ' ' + ch.cim,
    html,
    mount(root) {
      bindImageFallbacks(root);
      const cleanups = [];
      if (player) cleanups.push(player.mount(root, refresh));
      if (quiz) quiz.mount(root);
      mountFeedback(root, ch);

      const note = root.querySelector('#ex-note');
      if (note) note.addEventListener('input', () => { st.szovegek.jegyzet = note.value; saveProgress(); });
      const done = root.querySelector('#ex-done');
      if (done) done.addEventListener('change', () => { st.gyakorlat = done.checked; saveProgress(); refresh(); });

      // Olvasás: a lap alja (összefoglaló vége) láthatóvá vált → kb. 90%+ görgetés.
      const sentinel = root.querySelector('#read-sentinel');
      let io = null;
      if (!st.olvasas) {
        const markRead = () => { if (!st.olvasas) { st.olvasas = true; saveProgress(); refresh(); } };
        if ('IntersectionObserver' in window) {
          io = new IntersectionObserver((ents) => { if (ents.some((e) => e.isIntersecting)) { markRead(); io.disconnect(); } });
          io.observe(sentinel);
        } else {
          const onScroll = () => {
            const h = document.documentElement;
            if ((h.scrollTop + window.innerHeight) / h.scrollHeight >= 0.9) { markRead(); window.removeEventListener('scroll', onScroll); }
          };
          window.addEventListener('scroll', onScroll, { passive: true });
          cleanups.push(() => window.removeEventListener('scroll', onScroll));
        }
      }

      root.querySelector('#close-ch').addEventListener('click', () => {
        if (!canCloseChapter(ch)) { refresh(); return; }
        st.kesz = true;
        st.keszIdo = new Date().toISOString();
        if (videoRequired(ch) === false && ch.video && !st.video) st.video = { ranges: [], pos: 0, duration: 0, done: true, hianyzott: true };
        saveProgress();
        toast('Fejezet lezárva: ' + ch.label + ' ' + ch.cim);
        refresh();
        const nx = root.querySelector('#next-ch');
        nx.focus();
      });

      // Tartalomjegyzék: ugrás + aktuális rész kiemelése
      const tocLinks = [...root.querySelectorAll('[data-toc]')];
      tocLinks.forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        const t = root.querySelector('#' + a.dataset.toc);
        if (!t) return;
        if (a.dataset.toc === 'kviz') { const d = t.querySelector('details'); if (d) d.open = true; }
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
      let spy = null;
      if ('IntersectionObserver' in window && tocLinks.length) {
        spy = new IntersectionObserver((ents) => {
          ents.forEach((en) => {
            if (!en.isIntersecting) return;
            tocLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.toc === en.target.id));
          });
        }, { rootMargin: '-15% 0px -70% 0px' });
        tocLinks.forEach((a) => { const t = root.querySelector('#' + a.dataset.toc); if (t) spy.observe(t); });
        cleanups.push(() => spy.disconnect());
      }

      refresh();
      return () => { if (io) io.disconnect(); cleanups.forEach((c) => c && c()); };
    },
  };
}

