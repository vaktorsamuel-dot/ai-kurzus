// Kezelői nézet (#/kezelo): rejtett útvonal, sehonnan nincs rá link. A visszajelzések olvasását a Firebase
// bejelentkezés (e-mail + jelszó) és a Firestore szabályai védik, nem a kliensoldali kód. A jelszó sehol nincs a forrásban.
// #/kezelo/oklevel: a tanúsítvány előnézete példanévvel; semmit nem ment, a haladást nem érinti.

import { course } from '../data.js?v=6bcb5a28';
import { FIREBASE } from '../firebase-config.js?v=6bcb5a28';
import { isConfigured, docsUrl, COLLECTION, ERTEKEK } from '../feedback.js?v=6bcb5a28';
import { certificateHtml, printCertificate } from './finish.js?v=6bcb5a28';
import { esc, icon, fmtDateTime } from '../util.js?v=6bcb5a28';

const TOKEN_KEY = 'aikurzus.v1.kezelo.token'; // csak sessionStorage: a lap/böngésző bezárásakor megszűnik
let mem = null;

function loadTok() {
  try { return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null') || mem; } catch (e) { return mem; }
}
function saveTok(t) {
  mem = t;
  try { if (t) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t)); else sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* memóriás tartalék */ }
}

async function signIn(email, password) {
  const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(FIREBASE.apiKey), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Nem sikerült a belépés. Ellenőrizd az e-mailt és a jelszót.');
  saveTok({ idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (Number(j.expiresIn) - 60) * 1000 });
}

async function token() {
  const t = loadTok();
  if (!t) return null;
  if (Date.now() < t.exp) return t.idToken;
  try {
    const res = await fetch('https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(FIREBASE.apiKey), {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(t.refreshToken),
    });
    const j = await res.json();
    if (!res.ok) throw new Error('lejárt');
    saveTok({ idToken: j.id_token, refreshToken: j.refresh_token, exp: Date.now() + (Number(j.expires_in) - 60) * 1000 });
    return j.id_token;
  } catch (e) { saveTok(null); return null; }
}

async function authed(url, opts) {
  const tk = await token();
  if (!tk) throw new Error('auth');
  const res = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' }, (opts || {}).headers) }));
  if (res.status === 401 || res.status === 403) { if (res.status === 401) saveTok(null); throw new Error(res.status === 401 ? 'auth' : 'jog'); }
  if (!res.ok) throw new Error('hiba ' + res.status);
  return res.json();
}

const val = (f, k, t) => (f[k] && f[k][t] !== undefined ? f[k][t] : undefined);

async function fetchAll() {
  const body = { structuredQuery: { from: [{ collectionId: COLLECTION }], orderBy: [{ field: { fieldPath: 'ido' }, direction: 'DESCENDING' }], limit: 2000 } };
  const rows = await authed(docsUrl() + ':runQuery', { method: 'POST', body: JSON.stringify(body) });
  return rows.filter((r) => r.document).map((r) => {
    const f = r.document.fields || {};
    return {
      id: r.document.name.split('/').pop(),
      modul: val(f, 'modul', 'stringValue') || '', fejezet: val(f, 'fejezet', 'stringValue') || '',
      ertek: val(f, 'ertek', 'stringValue') || '', szoveg: val(f, 'szoveg', 'stringValue') || '',
      ido: val(f, 'ido', 'timestampValue') || '', olvasva: !!val(f, 'olvasva', 'booleanValue'), kezelve: !!val(f, 'kezelve', 'booleanValue'),
    };
  });
}

async function setFlag(item, name, value) {
  await authed(docsUrl() + '/' + COLLECTION + '/' + encodeURIComponent(item.id) + '?updateMask.fieldPaths=' + name, {
    method: 'PATCH', body: JSON.stringify({ fields: { [name]: { booleanValue: value } } }),
  });
  item[name] = value;
}

function chapterLabel(chId) {
  const ch = course.fejezetById[chId];
  return ch ? ch.label + ' ' + ch.cim : chId;
}
function moduleLabel(mId) {
  const m = course.modulById[mId];
  return m ? (m.id === 'zp' ? m.cim : m.sorszam + '. ' + m.cim) : mId;
}

function summaryHtml(items) {
  const by = {};
  items.forEach((x) => { (by[x.fejezet] = by[x.fejezet] || { igen: 0, reszben: 0, nem_ertem: 0 })[x.ertek] += 1; });
  const empty = [];
  const blocks = course.modulok.map((m) => {
    const rows = m.fejezetek.filter((c) => by[c.id]);
    if (!rows.length) { empty.push(m); return ''; }
    return '<h3 class="h-small">' + esc(moduleLabel(m.id)) + '</h3><div class="table-wrap"><table class="fb-table"><thead><tr><th scope="col">Fejezet</th><th scope="col">Igen</th><th scope="col">Részben</th><th scope="col">Nem értem</th></tr></thead><tbody>' +
      rows.map((c) => '<tr><th scope="row">' + esc(c.label + ' ' + c.cim) + '</th><td>' + by[c.id].igen + '</td><td>' + by[c.id].reszben + '</td><td' + (by[c.id].nem_ertem ? ' class="fb-warn"' : '') + '>' + by[c.id].nem_ertem + '</td></tr>').join('') +
      '</tbody></table></div>';
  }).join('');
  return (blocks || '<p class="muted">Még nem érkezett visszajelzés.</p>') +
    (empty.length ? '<h3 class="h-small">Erről még nem jött visszajelzés</h3><ul>' + empty.map((m) => '<li>' + esc(moduleLabel(m.id)) + '</li>').join('') + '</ul>' : '');
}

function entryHtml(x) {
  return '<li class="fb-entry' + (x.olvasva ? '' : ' is-unread') + (x.kezelve ? ' is-done' : '') + '" data-id="' + esc(x.id) + '">' +
    '<div class="fb-head"><span class="fb-val fb-val-' + esc(x.ertek) + '">' + esc(ERTEKEK[x.ertek] || x.ertek) + '</span>' +
    (x.olvasva ? '' : '<span class="tag tag-next">Új</span>') +
    '<span class="small muted">' + esc(chapterLabel(x.fejezet)) + ' · ' + esc(fmtDateTime(x.ido)) + '</span></div>' +
    '<p class="fb-text">' + (x.szoveg ? esc(x.szoveg) : '<span class="muted">(nincs szöveg)</span>') + '</p>' +
    '<div class="row">' +
    '<label class="check-item"><input type="checkbox" data-flag="olvasva"' + (x.olvasva ? ' checked' : '') + '><span>Olvasott</span></label>' +
    '<label class="check-item"><input type="checkbox" data-flag="kezelve"' + (x.kezelve ? ' checked' : '') + '><span>Kezelve</span></label></div></li>';
}

export function viewKezelo() {
  return {
    title: 'Kezelő',
    html:
      '<div class="wrap section kezelo"><nav class="crumbs no-print"><a class="btn btn-ghost btn-small" href="#/">' + icon('arrowLeft') + 'Főképernyő</a></nav>' +
      '<h1>Kezelő</h1><div id="kz-box"></div></div>',
    mount(root) {
      const box = root.querySelector('#kz-box');
      let items = [];
      let onlyNem = false;
      let onlyText = false;
      let onlyOpen = false;

      const tools = '<section class="card"><h2 class="h-small">Tanúsítvány előnézete</h2><p>Példanévvel és mai dátummal mutatja a tanúsítványt. Nem ment el semmit, és nem érinti a haladást.</p>' +
        '<a class="btn btn-primary" href="#/kezelo/oklevel">' + icon('print') + 'Tanúsítvány előnézete</a></section>';

      function loginView(msg) {
        if (!isConfigured()) {
          box.innerHTML = tools + '<section class="card"><h2 class="h-small">Visszajelzések</h2><div class="callout callout-warn">' + icon('warn') + '<div><p>A Firebase még nincs beállítva (<code>js/firebase-config.js</code>), ezért a visszajelzések csak azon az eszközön várakoznak, ahol írták őket. A beállítás menete: <code>FIREBASE-BEALLITAS.md</code>.</p></div></div></section>';
          return;
        }
        box.innerHTML = tools + '<section class="card"><h2 class="h-small">Visszajelzések</h2><form id="kz-login" class="form" novalidate>' +
          (msg ? '<p class="fb-err" role="alert">' + esc(msg) + '</p>' : '') +
          '<div class="field"><label for="kz-mail">E-mail</label><input type="email" id="kz-mail" autocomplete="username" required></div>' +
          '<div class="field"><label for="kz-pw">Jelszó</label><input type="password" id="kz-pw" autocomplete="current-password" required></div>' +
          '<button type="submit" class="btn btn-primary btn-lg" id="kz-go">Belépés</button></form></section>';
        box.querySelector('#kz-login').addEventListener('submit', async (e) => {
          e.preventDefault();
          const b = box.querySelector('#kz-go');
          b.disabled = true;
          try {
            await signIn(box.querySelector('#kz-mail').value.trim(), box.querySelector('#kz-pw').value);
            await load();
          } catch (err) { loginView(err.message); }
        });
      }

      async function load() {
        box.innerHTML = tools + '<p role="status">Visszajelzések betöltése…</p>';
        try {
          items = await fetchAll();
        } catch (err) {
          if (err.message === 'auth') { loginView('A munkamenet lejárt, lépj be újra.'); return; }
          box.innerHTML = tools + '<div class="callout callout-warn">' + icon('warn') + '<div><p>' + (err.message === 'jog' ? 'Ehhez a fiókhoz nincs olvasási jog a Firestore szabályai szerint.' : 'Nem sikerült betölteni a visszajelzéseket (' + esc(err.message) + ').') + '</p>' +
            '<button type="button" class="btn btn-ghost" id="kz-retry">Újra</button></div></div>';
          box.querySelector('#kz-retry').addEventListener('click', load);
          return;
        }
        list();
      }

      function list() {
        const unread = items.filter((x) => !x.olvasva).length;
        const shown = items.filter((x) => (!onlyNem || x.ertek === 'nem_ertem') && (!onlyText || x.szoveg) && (!onlyOpen || !x.kezelve));
        box.innerHTML = tools +
          '<section class="card"><div class="row-between"><h2 class="h-small">Visszajelzések' + (unread ? ' <span class="tag tag-next">' + unread + ' olvasatlan</span>' : '') + '</h2>' +
          '<div class="row"><button type="button" class="btn btn-ghost btn-small" id="kz-reload">Frissítés</button>' +
          '<button type="button" class="btn btn-ghost btn-small" id="kz-logout">Kilépés</button></div></div>' +
          '<h3 class="h-small">Összesítés modul és fejezet szerint</h3>' + summaryHtml(items) + '</section>' +
          '<section class="card"><h2 class="h-small">Legutóbbi visszajelzések</h2>' +
          '<div class="row"><label class="check-item"><input type="checkbox" id="f-nem"' + (onlyNem ? ' checked' : '') + '><span>Csak „Nem értem”</span></label>' +
          '<label class="check-item"><input type="checkbox" id="f-txt"' + (onlyText ? ' checked' : '') + '><span>Csak szöveges</span></label>' +
          '<label class="check-item"><input type="checkbox" id="f-open"' + (onlyOpen ? ' checked' : '') + '><span>Csak kezeletlen</span></label>' +
          (unread ? '<button type="button" class="btn btn-ghost btn-small" id="kz-allread">Mind olvasott</button>' : '') + '</div>' +
          (shown.length ? '<ul class="fb-list">' + shown.map(entryHtml).join('') + '</ul>' : '<p class="muted">Nincs ilyen bejegyzés.</p>') + '</section>';

        box.querySelector('#kz-reload').addEventListener('click', load);
        box.querySelector('#kz-logout').addEventListener('click', () => { saveTok(null); items = []; loginView(); });
        [['f-nem', (v) => { onlyNem = v; }], ['f-txt', (v) => { onlyText = v; }], ['f-open', (v) => { onlyOpen = v; }]].forEach(([id, set]) => {
          box.querySelector('#' + id).addEventListener('change', (e) => { set(e.target.checked); list(); });
        });
        const all = box.querySelector('#kz-allread');
        if (all) all.addEventListener('click', async () => {
          all.disabled = true;
          for (const x of items.filter((i) => !i.olvasva)) { try { await setFlag(x, 'olvasva', true); } catch (e) { break; } }
          list();
        });
        box.querySelectorAll('.fb-entry input[data-flag]').forEach((inp) => inp.addEventListener('change', async () => {
          const x = items.find((i) => i.id === inp.closest('.fb-entry').dataset.id);
          try { await setFlag(x, inp.dataset.flag, inp.checked); } catch (e) { inp.checked = !inp.checked; }
          list();
        }));
      }

      if (isConfigured() && loadTok()) load(); else loginView();
    },
  };
}

// A tanúsítvány előnézete: példanév, mai dátum, semmi nem mentődik, a haladást nem olvassa és nem írja.
export function viewKezeloCert() {
  return {
    title: 'Tanúsítvány előnézete',
    html:
      '<div class="wrap section cert-page">' +
      '<div class="no-print"><nav class="crumbs"><a class="btn btn-ghost btn-small" href="#/kezelo">' + icon('arrowLeft') + 'Vissza a kezelőhöz</a></nav>' +
      '<p class="eyebrow">Előnézet</p><h1>Tanúsítvány előnézete</h1>' +
      '<p class="lead">Példanévvel és mai dátummal. Ez nem a te haladásod, és nem ment el semmit.</p>' +
      '<div class="row"><button type="button" class="btn btn-accent btn-lg" id="print">' + icon('print') + 'Nyomtatás / Mentés PDF-ként</button></div></div>' +
      certificateHtml({ nev: 'Minta Név', datum: new Date().toISOString(), pct: 100, preview: true }) +
      '</div>',
    mount(root) {
      root.querySelector('#print').addEventListener('click', printCertificate);
    },
  };
}
