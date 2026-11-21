// „Hasznos volt ez a fejezet?” blokk a fejezet végén. Nincs név, nincs kötelező szöveg; többször is küldhető.

import { addFeedback, feedbackFor, ERTEKEK, MAX_TEXT, isConfigured } from '../feedback.js?v=6bcb5a28';
import { esc, icon, fmtDateTime } from '../util.js?v=6bcb5a28';

export function feedbackBlock() {
  return '<section class="card feedback-card no-print" id="visszajelzes" aria-labelledby="fb-title">' +
    '<h2 class="h-small" id="fb-title">Hasznos volt ez a fejezet?</h2><div id="fb-body"></div></section>';
}

export function mountFeedback(root, ch) {
  const body = root.querySelector('#fb-body');
  if (!body) return;

  function last() {
    const l = feedbackFor(ch.id)[0];
    if (!l) return '';
    return '<p class="small muted fb-last">Az utolsó visszajelzésed: <strong>' + esc(ERTEKEK[l.ertek] || '') + '</strong> · ' + esc(fmtDateTime(l.ido)) +
      (l.elkuldve ? '' : ' · <span>még nem ment el, később automatikusan újrapróbálom</span>') + '</p>';
  }

  function form(msg) {
    body.innerHTML =
      (msg || '') +
      '<form id="fb-form" novalidate>' +
      '<fieldset class="field"><legend class="visually-hidden">Hasznos volt ez a fejezet?</legend><div class="choices choices-inline">' +
      Object.keys(ERTEKEK).map((k) => '<label class="choice"><input type="radio" name="fb-ertek" value="' + k + '"><span>' + ERTEKEK[k] + '</span></label>').join('') +
      '</div></fieldset>' +
      '<div class="field"><label for="fb-text">Mit írnál még hozzá? <span class="muted">(nem kötelező)</span></label>' +
      '<textarea id="fb-text" rows="3" maxlength="' + MAX_TEXT + '"></textarea>' +
      '<p class="small muted" aria-live="off"><span id="fb-count">0</span> / ' + MAX_TEXT + ' karakter</p></div>' +
      '<div class="row"><button type="submit" class="btn btn-primary" id="fb-send" disabled>' + icon('check') + 'Küldés</button></div>' +
      '<p class="fb-err" id="fb-err" role="alert" hidden></p>' +
      '</form>' + last();

    const f = body.querySelector('#fb-form');
    const send = body.querySelector('#fb-send');
    const ta = body.querySelector('#fb-text');
    const cnt = body.querySelector('#fb-count');
    f.addEventListener('change', () => { send.disabled = !f.querySelector('input[name="fb-ertek"]:checked'); });
    ta.addEventListener('input', () => { cnt.textContent = ta.value.length; });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sel = f.querySelector('input[name="fb-ertek"]:checked');
      if (!sel) return;
      send.disabled = true;
      let item;
      try {
        item = await addFeedback({ modul: ch.modulId, fejezet: ch.id, ertek: sel.value, szoveg: ta.value });
      } catch (err) {
        const eEl = body.querySelector('#fb-err');
        eEl.textContent = 'Nem sikerült elmenteni: ' + err.message;
        eEl.hidden = false;
        send.disabled = false;
        return;
      }
      thanks(item);
    });
  }

  function thanks(item) {
    const ok = item.elkuldve;
    const text = ok
      ? 'Köszönöm! A visszajelzésed megérkezett.'
      : (isConfigured()
        ? 'Köszönöm! Elmentettem a visszajelzésedet. Most nincs kapcsolat, ezért később automatikusan elküldöm.'
        : 'Köszönöm! Elmentettem a visszajelzésedet ezen az eszközön.');
    body.innerHTML = '<div class="callout callout-done" role="status" tabindex="-1" id="fb-thanks">' + icon('check') + '<div><p><strong>' + text + '</strong></p></div></div>' +
      '<div class="row"><button type="button" class="btn btn-ghost" id="fb-again">Új visszajelzés írása</button></div>' + last();
    body.querySelector('#fb-thanks').focus({ preventScroll: true });
    body.querySelector('#fb-again').addEventListener('click', () => form());
  }

  form();
}
