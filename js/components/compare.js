// Egymás melletti összehasonlító: ugyanaz a kérés ChatGPT-ben és Claude-ban.
// Az adatok a data/osszehasonlitas.json fájlból jönnek; üres mintaválasznál csak a kérés és a gombok látszanak.

import { course } from '../data.js?v=6bcb5a28';
import { esc, promptBox, fmtDate } from '../util.js?v=6bcb5a28';

function answerCol(name, text, model) {
  const body = (text || '').trim()
    ? '<div class="compare-answer">' + esc(text) + '</div>'
    : '<p class="muted small">Ehhez az eszközhöz még nincs mintaválasz.</p>';
  return '<section class="compare-col" aria-label="' + esc(name) + ' válasza"><h4>' + esc(name) + '</h4>' +
    (model ? '<p class="small muted">Modell: ' + esc(model) + '</p>' : '') + body + '</section>';
}

export function renderCompare() {
  const items = course.osszehasonlitas || [];
  if (!items.length) return '';
  return '<div class="compare-list">' + items.map((e, i) => {
    const hasAnswer = (e.chatgpt_valasz || '').trim() || (e.claude_valasz || '').trim();
    const when = e.futtatva ? (/^\d{4}-\d{2}-\d{2}/.test(e.futtatva) ? fmtDate(e.futtatva) : e.futtatva) : '';
    return '<details class="compare-item"' + (i === 0 ? ' open' : '') + '><summary><span class="compare-n">' + (i + 1) + '.</span> ' + esc(e.cim || 'Példa') + '</summary>' +
      promptBox(e.kerdes, 'Közös kérés', 'Próbáld ki te is – mindkét eszközben:') +
      (hasAnswer
        ? '<div class="compare-cols">' + answerCol('ChatGPT', e.chatgpt_valasz, e.modell_chatgpt) + answerCol('Claude', e.claude_valasz, e.modell_claude) + '</div>' +
          (when ? '<p class="small muted">Lefuttatva: ' + esc(when) + '</p>' : '') +
          '<p class="small muted"><em>Mintaválasz. A tiéd más lehet, mert az AI nem ugyanazt írja le kétszer.</em></p>' +
          (e.jegyzet ? '<div class="compare-note"><strong>Mit vegyél észre?</strong> ' + esc(e.jegyzet) + '</div>' : '')
        : (e.jegyzet ? '<div class="compare-note"><strong>Mit vegyél észre?</strong> ' + esc(e.jegyzet) + '</div>' : '')) +
      '</details>';
  }).join('') + '</div>';
}
