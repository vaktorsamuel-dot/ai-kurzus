// <StepFigure>: sematikus, kódból rajzolt lépés-ábra (nincs képfájl). NEM pontos felületmásolat:
// a lépés logikáját mutatja (hol keresd, mit nyomj meg). A szöveges lépéslista a mérvadó.

import { course } from '../data.js?v=991a70c2';
import { esc, md } from '../util.js?v=991a70c2';

let seq = 0;

function el(x) {
  const hl = x.ki ? ' sf-hl' : '';
  switch (x.t) {
    case 'cim': return '<div class="sf-title">' + esc(x.szoveg) + '</div>';
    case 'szoveg': return '<div class="sf-text">' + esc(x.szoveg) + '</div>';
    case 'mezo': return '<div class="sf-field' + hl + '">' + esc(x.szoveg) + '</div>';
    case 'gomb': return '<div class="sf-btn' + hl + '">' + esc(x.szoveg) + '</div>';
    case 'fajl': return '<div class="sf-file' + hl + '"><span class="sf-file-ico"></span>' + esc(x.szoveg) + '</div>';
    case 'panel': return '<div class="sf-panel' + hl + '">' + esc(x.szoveg) + '</div>';
    case 'terminal': return '<div class="sf-term' + hl + '">' + esc(x.szoveg) + '</div>';
    default: return '';
  }
}

function scene(j) {
  const side = (j.oldalsav || []).length
    ? '<div class="sf-side">' + j.oldalsav.map((t) => '<div class="sf-side-item' + (t === j.ki ? ' sf-hl' : '') + '">' + esc(t) + '</div>').join('') + '</div>' : '';
  return '<div class="sf-window' + (j.telefon ? ' sf-phone' : '') + '"><div class="sf-bar"><i></i><i></i><i></i></div><div class="sf-body">' + side +
    '<div class="sf-main">' + (j.fo || []).map(el).join('') + '</div></div></div>';
}

export function stepFigure(id) {
  const d = (course.lepesabrak || {})[id];
  if (!d) return '';
  const uid = 'sf-' + (++seq);
  const n = d.lepesek.length;
  return '<figure class="stepfig" id="' + uid + '" data-i="0" data-n="' + n + '">' +
    '<p class="stepfig-title"><strong>' + esc(d.cim) + '</strong> – lépésről lépésre</p>' +
    '<div class="stepfig-grid"><div class="stepfig-stage" aria-hidden="true">' +
    d.lepesek.map((l, i) => '<div class="stepfig-scene" data-s="' + i + '"' + (i ? ' hidden' : '') + '>' + scene(l.jelenet || {}) + '</div>').join('') + '</div>' +
    '<ol class="stepfig-steps">' + d.lepesek.map((l, i) => '<li data-s="' + i + '"' + (i === 0 ? ' aria-current="step"' : '') + '>' + md(l.szoveg) + '</li>').join('') + '</ol></div>' +
    '<div class="stepfig-nav no-print"><button type="button" class="btn btn-ghost btn-small" data-sf="-1" aria-controls="' + uid + '">Előző lépés</button>' +
    '<span class="small muted" aria-live="polite" data-sf-count>1. lépés / ' + n + '</span>' +
    '<button type="button" class="btn btn-ghost btn-small" data-sf="1" aria-controls="' + uid + '">Következő lépés</button></div>' +
    (d.sugo ? '<p class="small">Hivatalos leírás: <a href="' + esc(d.sugo.url) + '" target="_blank" rel="noopener">' + esc(d.sugo.szoveg) + '<span class="visually-hidden"> (új lapon nyílik)</span></a></p>' : '') +
    '<figcaption class="small muted">Szemléltető ábra. A valódi felület kicsit másképp nézhet ki, mert az alkalmazások változnak.</figcaption></figure>';
}

export function initStepFigures() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sf]');
    if (!b) return;
    const fig = b.closest('.stepfig');
    const n = +fig.dataset.n;
    const i = Math.min(n - 1, Math.max(0, +fig.dataset.i + +b.dataset.sf));
    fig.dataset.i = i;
    fig.querySelectorAll('.stepfig-scene').forEach((s) => { s.hidden = +s.dataset.s !== i; });
    fig.querySelectorAll('.stepfig-steps li').forEach((li) => { if (+li.dataset.s === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    fig.querySelector('[data-sf-count]').textContent = (i + 1) + '. lépés / ' + n;
  });
}
