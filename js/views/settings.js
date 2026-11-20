import { getSettings, setSettings, getProfile, exportData, exportCode, importAny, resetAll, isPersistent } from '../store.js?v=7150738a';
import { esc, icon, toast, downloadFile } from '../util.js?v=7150738a';
import { go } from '../app.js?v=7150738a';

function radios(name, opts, cur) {
  return '<div class="choices choices-inline">' + opts.map(([v, l]) =>
    '<label class="choice"><input type="radio" name="' + name + '" value="' + v + '"' + (String(cur) === String(v) ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</div>';
}

export function viewSettings(sub) {
  const s = getSettings();
  const p = getProfile();
  return {
    title: 'Beállítások',
    html:
      '<div class="wrap-narrow section settings">' +
      '<nav class="crumbs no-print"><a class="btn btn-ghost btn-small" href="#/">' + icon('arrowLeft') + 'Vissza a főképernyőre</a></nav>' +
      '<h1>Beállítások</h1>' +
      '<form id="settings-form" class="form">' +
      '<fieldset class="field card"><legend>Betűméret</legend>' + radios('betumeret', [['normal', 'Normál'], ['nagy', 'Nagy'], ['xnagy', 'Extra nagy']], s.betumeret) + '</fieldset>' +
      '<fieldset class="field card"><legend>Téma</legend>' + radios('tema', [['rendszer', 'A rendszer szerint'], ['light', 'Világos'], ['dark', 'Sötét']], s.tema) + '</fieldset>' +
      '<fieldset class="field card"><legend>Videó</legend>' +
      '<label class="check-item"><input type="checkbox" name="autoplay"' + (s.autoplay ? ' checked' : '') + '><span>Automatikus lejátszás, amikor megnyitok egy videót</span></label>' +
      '<label class="check-item"><input type="checkbox" name="feliratok"' + (s.feliratok ? ' checked' : '') + '><span>Feliratok alapértelmezetten bekapcsolva</span></label></fieldset>' +
      '</form>' +
      (p ? '<section class="card"><h2 class="h-small">Profil</h2><p>' + icon('user') + ' ' + esc(p.nev) + '</p><a class="btn btn-ghost" href="#/profil">Profil szerkesztése</a></section>' : '') +
      '<section class="card" id="haladas" tabindex="-1"><h2 class="h-small">Haladás exportálása és importálása</h2>' +
      '<p>Ha másik eszközön (például telefonon) folytatnád, itt mentheted ki a haladásodat, majd ott beolvashatod.' + (isPersistent() ? '' : ' <strong>Most nincs helyi mentés, ezért érdemes exportálni, mielőtt bezárod a lapot.</strong>') + '</p>' +
      '<div class="row"><button type="button" class="btn btn-primary" id="exp-file">' + icon('download') + 'Letöltés fájlként (JSON)</button>' +
      '<button type="button" class="btn btn-ghost" id="exp-code">Szöveges kód mutatása</button></div>' +
      '<div class="prompt-box" id="code-box" hidden><div class="prompt-head"><span>Haladás-kód</span><button type="button" class="btn btn-small btn-ghost copy-btn" data-copy data-copy-source="code-text">' + icon('copy') + '<span>Másolás</span></button></div>' +
      '<textarea id="code-text" class="code-area" rows="4" readonly aria-label="Haladás-kód"></textarea></div>' +
      '<h3>Importálás</h3>' +
      '<div class="field"><label for="imp-file">Mentett fájl kiválasztása</label><input type="file" id="imp-file" accept=".json,application/json"></div>' +
      '<div class="field"><label for="imp-text">…vagy illeszd be a haladás-kódot</label><textarea id="imp-text" rows="3" placeholder="AIK1:…"></textarea></div>' +
      '<button type="button" class="btn btn-ghost" id="imp-go">Importálás</button>' +
      '<p class="small muted">Az importálás felülírja az ezen az eszközön lévő haladást.</p><div id="imp-msg" aria-live="polite"></div></section>' +
      '<section class="card danger-zone"><h2 class="h-small">Haladás törlése</h2><p>Minden haladás, kvízeredmény, jegyzet és a profil törlődik erről az eszközről. Ez nem vonható vissza.</p>' +
      '<button type="button" class="btn btn-danger-ghost" id="del-1">Haladás törlése…</button>' +
      '<div id="del-confirm" hidden class="callout callout-warn" role="alertdialog" aria-labelledby="del-q">' + icon('warn') + '<div><p id="del-q"><strong>Biztosan törlöd? Írd be: TÖRLÉS</strong></p>' +
      '<input type="text" id="del-word" aria-label="Megerősítő szó" autocomplete="off"><div class="row" style="margin-top:.6rem"><button type="button" class="btn btn-danger" id="del-2" disabled>Végleges törlés</button>' +
      '<button type="button" class="btn btn-ghost" id="del-cancel">Mégse</button></div></div></div></section>' +
      '</div>',
    mount(root) {
      const form = root.querySelector('#settings-form');
      form.addEventListener('change', (e) => {
        const t = e.target;
        setSettings({ [t.name]: t.type === 'checkbox' ? t.checked : t.value });
        toast('Beállítás elmentve.');
      });

      root.querySelector('#exp-file').addEventListener('click', () => {
        const d = new Date().toISOString().slice(0, 10);
        downloadFile('ai-kurzus-haladas-' + d + '.json', JSON.stringify(exportData(), null, 2), 'application/json');
        toast('A haladás-fájl letöltődött.');
      });
      root.querySelector('#exp-code').addEventListener('click', () => {
        root.querySelector('#code-box').hidden = false;
        const ta = root.querySelector('#code-text');
        ta.value = exportCode();
        ta.focus();
        ta.select();
      });

      const msg = root.querySelector('#imp-msg');
      const doImport = (text) => {
        try {
          importAny(text);
          msg.innerHTML = '<p class="fb-ok">' + icon('check') + '<span>Sikeres importálás. Visszaviszlek a főképernyőre.</span></p>';
          setTimeout(() => go('#/'), 900);
        } catch (e) {
          msg.innerHTML = '<p class="fb-no">' + icon('warn') + '<span>Nem sikerült beolvasni: ' + esc(e.message.startsWith('Ez nem') ? e.message : 'a fájl vagy kód sérült vagy hiányos.') + '</span></p>';
        }
      };
      root.querySelector('#imp-go').addEventListener('click', () => {
        const f = root.querySelector('#imp-file').files[0];
        const t = root.querySelector('#imp-text').value.trim();
        if (f) { const r = new FileReader(); r.onload = () => doImport(r.result); r.readAsText(f); }
        else if (t) doImport(t);
        else msg.innerHTML = '<p class="small">Válassz ki egy fájlt, vagy illessz be egy kódot.</p>';
      });

      const conf = root.querySelector('#del-confirm');
      const word = root.querySelector('#del-word');
      const del2 = root.querySelector('#del-2');
      root.querySelector('#del-1').addEventListener('click', () => { conf.hidden = false; word.focus(); });
      root.querySelector('#del-cancel').addEventListener('click', () => { conf.hidden = true; word.value = ''; del2.disabled = true; });
      word.addEventListener('input', () => { del2.disabled = word.value.trim().toUpperCase() !== 'TÖRLÉS'; });
      del2.addEventListener('click', () => { resetAll(); toast('A haladás törölve.'); go('#/bevezeto'); });

      if (sub === 'haladas') {
        const h = root.querySelector('#haladas');
        setTimeout(() => { h.scrollIntoView(); h.focus({ preventScroll: true }); }, 50);
      }
    },
  };
}
