import { course } from '../data.js';
import { getProfile, setProfile, isLoggedIn, login } from '../store.js';
import { esc, icon, toast } from '../util.js';
import { go } from '../app.js';

export const CELOK = [
  { id: 'levelezes', label: 'Levelezés, e-mailek' },
  { id: 'dokumentumok', label: 'Dokumentumok, táblázatok' },
  { id: 'kutatas', label: 'Kutatás, utánanézés' },
  { id: 'kreativ', label: 'Kreatív munka (szöveg, kép)' },
  { id: 'tanulas', label: 'Tanulás, új dolgok megértése' },
  { id: 'egyeb', label: 'Egyéb' },
];
export const TAPASZTALAT = [
  { id: 'kezdo', label: 'Kezdő – alig vagy egyáltalán nem használtam' },
  { id: 'keveset', label: 'Használom, de keveset' },
  { id: 'rendszeresen', label: 'Használom rendszeresen' },
];
export const ESZKOZOK = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'mas', label: 'Más' },
  { id: 'egyik', label: 'Egyiket sem' },
];

export function viewIntro() {
  const total = course.modulok.reduce((a, m) => a + m.ido, 0);
  const hours = Math.round(total / 60);
  const moduleCount = course.modulok.filter((m) => m.id !== 'zp').length;
  const hasProfile = !!getProfile();
  const saved = getProfile();
  return {
    title: 'Üdvözlünk',
    bare: !isLoggedIn(),
    html:
      '<section class="landing"><div class="landing-card">' +
      '<img class="landing-logo" src="assets/img/logo.png" alt="AI kurzus logó">' +
      '<h1 class="visually-hidden">AI kurzus</h1>' +
      '<p class="landing-slogan">Az AI, ami a hétköznapokban is segít.</p>' +
      '<p class="landing-info">' + moduleCount + ' modul · kb. ' + hours + ' óra · a haladásod automatikusan mentődik</p>' +
      '<form id="login-form" class="landing-form" novalidate>' +
      '<label for="login-nev" class="visually-hidden">Hogyan szólítsunk?</label>' +
      '<input id="login-nev" name="nev" type="text" autocomplete="given-name" maxlength="40" placeholder="Hogyan szólítsunk?" value="' + esc(saved ? saved.nev : '') + '">' +
      '<p class="field-error" id="login-err" hidden>Írj be egy nevet (becenév is jó).</p>' +
      '<label class="choice landing-remember"><input type="checkbox" name="emlekezz" checked><span>Emlékezz rám ezen az eszközön</span></label>' +
      '<button class="btn btn-accent btn-xl" type="submit">Belépés' + icon('arrowRight') + '</button>' +
      '</form>' +
      '</div></section>',
    mount(root) {
      const form = root.querySelector('#login-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nev = form.nev.value.trim();
        if (!nev) { root.querySelector('#login-err').hidden = false; form.nev.focus(); return; }
        const p = getProfile();
        setProfile(p ? Object.assign({}, p, { nev }) : {
          nev, celok: [], foglalkozas: '', tapasztalat: 'keveset', eszkoz: 'egyik', letrehozva: new Date().toISOString(),
        });
        login(form.emlekezz.checked);
        go('#/');
      });
    },
  };
}

function checks(name, list, selected, type) {
  return list.map((o) => {
    const on = type === 'checkbox' ? (selected || []).includes(o.id) : selected === o.id;
    return '<label class="choice"><input type="' + type + '" name="' + name + '" value="' + o.id + '"' + (on ? ' checked' : '') + '><span>' + esc(o.label) + '</span></label>';
  }).join('');
}

export function viewProfile() {
  const p = getProfile() || {};
  const isNew = !getProfile();
  return {
    title: isNew ? 'Rövid profil' : 'Profil szerkesztése',
    bare: isNew,
    html:
      '<section class="section"><div class="wrap-narrow">' +
      (isNew ? '<p class="eyebrow">1 perc</p>' : '') +
      '<h1>' + (isNew ? 'Néhány kérdés rólad' : 'Profil szerkesztése') + '</h1>' +
      '<p class="lead">A válaszaid alapján javaslunk neked illő gyakorlatpéldákat. A fő tartalom mindenkinek ugyanaz. Az adatok csak ebben a böngészőben maradnak.</p>' +
      '<form id="profile-form" class="form" novalidate>' +
      '<div class="field"><label for="nev">Hogyan szólítsunk?</label><input id="nev" name="nev" type="text" autocomplete="given-name" required maxlength="40" value="' + esc(p.nev || '') + '">' +
      '<p class="field-error" id="nev-err" hidden>Írj be egy nevet (becenév is jó).</p></div>' +
      '<fieldset class="field"><legend>Mire használnád az AI-t leginkább?</legend><p class="hint">Többet is választhatsz.</p><div class="choices">' + checks('celok', CELOK, p.celok, 'checkbox') + '</div></fieldset>' +
      '<div class="field"><label for="foglalkozas">Mivel foglalkozol, vagy mit szeretnél vele megoldani? <span class="muted">(nem kötelező)</span></label>' +
      '<textarea id="foglalkozas" name="foglalkozas" rows="3" maxlength="400" placeholder="Például: irodai munka, sok e-mail; vagy: otthoni ügyintézés, tanulás">' + esc(p.foglalkozas || '') + '</textarea>' +
      '<p class="hint">Ne írj ide valódi cégnevet vagy személyes adatot – általános leírás elég.</p></div>' +
      '<fieldset class="field"><legend>Mennyi tapasztalatod van?</legend><div class="choices">' + checks('tapasztalat', TAPASZTALAT, p.tapasztalat || 'keveset', 'radio') + '</div></fieldset>' +
      '<fieldset class="field"><legend>Melyik eszközt használod most?</legend><div class="choices choices-inline">' + checks('eszkoz', ESZKOZOK, p.eszkoz || 'egyik', 'radio') + '</div></fieldset>' +
      '<div class="row"><button class="btn btn-accent btn-lg" type="submit">' + (isNew ? 'Mentés és indulás' : 'Mentés') + icon('arrowRight') + '</button>' +
      (isNew ? '' : '<a class="btn btn-ghost btn-lg" href="#/beallitasok">Mégse</a>') + '</div>' +
      '</form></div></section>',
    mount(root) {
      const form = root.querySelector('#profile-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const nev = (fd.get('nev') || '').toString().trim();
        const err = root.querySelector('#nev-err');
        if (!nev) {
          err.hidden = false;
          form.nev.setAttribute('aria-invalid', 'true');
          form.nev.setAttribute('aria-describedby', 'nev-err');
          form.nev.focus();
          return;
        }
        setProfile({
          nev,
          celok: fd.getAll('celok'),
          foglalkozas: (fd.get('foglalkozas') || '').toString().trim(),
          tapasztalat: fd.get('tapasztalat'),
          eszkoz: fd.get('eszkoz'),
          letrehozva: p.letrehozva || new Date().toISOString(),
        });
        toast(isNew ? 'Profil elmentve. Jó tanulást!' : 'Profil elmentve.');
        go(isNew ? '#/' : '#/beallitasok');
      });
    },
  };
}

export function toolName(id) {
  const t = ESZKOZOK.find((e) => e.id === id);
  if (!t || id === 'egyik' || id === 'mas') return null;
  return t.label;
}
