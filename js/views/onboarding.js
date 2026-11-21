import { course, getCourseStats } from '../data.js?v=6bcb5a28';
import { getProfile, setProfile, isLoggedIn, login, takeReturnTo } from '../store.js?v=6bcb5a28';
import { esc, icon, toast, moduleIcon } from '../util.js?v=6bcb5a28';
import { go } from '../app.js?v=6bcb5a28';

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


const FEATURES = [
  { t: 'Lépésről lépésre', d: 'Rövid fejezetek, érthető magyarázatok, szakzsargon nélkül.', svg: '<path d="M4 18h5v-5h5V8h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="8" r="1.6" fill="currentColor"/>' },
  { t: 'Gyakorlatok és kvízek', d: 'Kipróbálod, amit tanulsz, és azonnal visszajelzést kapsz.', svg: '<rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' },
  { t: 'Saját tempóban', d: 'Bármikor abbahagyhatod, a haladásod automatikusan mentődik.', svg: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' },
  { t: 'Oklevél a végén', d: 'A kurzus teljes teljesítése után letölthető, nyomtatható oklevelet kapsz.', svg: '<path d="M12 3.5l2.3 4.7 5.2.8-3.8 3.6.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.6 5.2-.8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' },
];

const STEPS = [
  ['1', 'Belépsz', 'Csak egy név kell, jelszó nem.'],
  ['2', 'Tanulsz és gyakorolsz', 'Valódi, hétköznapi példákon.'],
  ['3', 'Használod', 'Már az első modul után van mit kipróbálni.'],
];

function landingHtml(moduleCount, hours, saved) {
  const mods = course.modulok.map((m, i) =>
    '<li class="lp-mod" style="--i:' + i + '"><span class="lp-mod-num">' + (m.id === 'zp' ? 'Z' : m.sorszam) + '</span>' +
    moduleIcon(m) + '<span class="lp-mod-name">' + esc(m.cim) + '</span></li>').join('');
  const feats = FEATURES.map((f, i) =>
    '<li class="lp-feat" style="--i:' + i + '"><span class="lp-feat-ico"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + f.svg + '</svg></span>' +
    '<h3>' + esc(f.t) + '</h3><p>' + esc(f.d) + '</p></li>').join('');
  const steps = STEPS.map((s, i) =>
    '<li class="lp-step" style="--i:' + i + '"><span class="lp-step-n">' + s[0] + '</span><div><strong>' + esc(s[1]) + '</strong><span>' + esc(s[2]) + '</span></div></li>').join('');
  const chatDemo =
    '<div class="lp-chat" aria-hidden="true">' +
    '<div class="lp-bubble lp-me">Írj udvarias e-mailt a szállítónak a késésről.</div>' +
    '<div class="lp-bubble lp-ai"><span class="lp-typing"><i></i><i></i><i></i></span></div>' +
    '</div>';
  const floaters =
    '<div class="lp-bg" aria-hidden="true">' +
    '<span class="lp-blob lp-b1"></span><span class="lp-blob lp-b2"></span><span class="lp-blob lp-b3"></span>' +
    '<svg class="lp-fl lp-f1" viewBox="0 0 48 48"><path d="M8 10h32a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H22l-8 7v-7H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="16" cy="21" r="2" fill="currentColor"/><circle cx="24" cy="21" r="2" fill="currentColor"/><circle cx="32" cy="21" r="2" fill="currentColor"/></svg>' +
    '<svg class="lp-fl lp-f2" viewBox="0 0 48 48"><path d="M24 4l4.6 12.4L41 21l-12.4 4.6L24 38l-4.6-12.4L7 21l12.4-4.6z" fill="currentColor" opacity=".9"/><path d="M38 34l1.8 4.2L44 40l-4.2 1.8L38 46l-1.8-4.2L32 40l4.2-1.8z" fill="currentColor"/></svg>' +
    '<svg class="lp-fl lp-f3" viewBox="0 0 48 48"><rect x="6" y="9" width="36" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="17" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M8 36l11-10 8 7 6-5 9 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>' +
    '<svg class="lp-fl lp-f4" viewBox="0 0 48 48"><path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M17 24l5 5 9-10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '<svg class="lp-fl lp-f5" viewBox="0 0 48 48"><path d="M14 12L4 24l10 12M34 12l10 12-10 12M28 8l-8 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '<svg class="lp-fl lp-f6" viewBox="0 0 48 48"><path d="M12 5h17l9 9v29H12z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M29 5v9h9M18 24h14M18 31h14M18 38h8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>' +
    '</div>';
  return '<section class="landing">' + floaters +
    '<div class="lp-wrap">' +
    '<div class="lp-hero">' +
    '<div class="lp-hero-text">' +
    '<img class="landing-logo lp-pop" src="assets/img/logo.png" alt="AI kurzus logó">' +
    '<h1 class="visually-hidden">AI kurzus</h1>' +
    '<p class="landing-slogan lp-rise" style="--d:.1s">Az AI, ami a hétköznapokban is segít.</p>' +
    '<p class="lp-sub lp-rise" style="--d:.2s">Tanuld meg érthetően, magyarul, saját tempóban: írj jó kéréseket, készíts szövegeket, képeket, és használd biztonságosan.</p>' +
    '<ul class="lp-stats lp-rise" style="--d:.3s">' +
    '<li><strong data-count="' + moduleCount + '">' + moduleCount + '</strong><span>modul</span></li>' +
    '<li><strong data-count="' + hours + '">' + hours + '</strong><span>óra tartalom</span></li>' +
    '<li><strong>0</strong><span>előképzettség kell</span></li></ul>' +
    '<p class="lp-facts lp-rise" style="--d:.35s">' + esc(getCourseStats().label) + '</p>' +
    '</div>' +
    '<div class="lp-login lp-rise" style="--d:.25s">' + chatDemo +
    '<form id="login-form" class="landing-form" novalidate>' +
    '<label for="login-nev" class="visually-hidden">Hogyan szólítsunk?</label>' +
    '<input id="login-nev" name="nev" type="text" autocomplete="given-name" maxlength="40" placeholder="Hogyan szólítsunk?" value="' + esc(saved ? saved.nev : '') + '">' +
    '<p class="field-error" id="login-err" hidden>Írj be egy nevet (becenév is jó).</p>' +
    '<label class="choice landing-remember"><input type="checkbox" name="emlekezz" checked><span>Emlékezz rám ezen az eszközön</span></label>' +
    '<button class="btn btn-accent btn-xl lp-cta" type="submit">Belépés' + icon('arrowRight') + '</button>' +
    '<p class="landing-info">A haladásod automatikusan mentődik.</p>' +
    '</form></div></div>' +
    '<div class="lp-block"><h2 class="lp-h">Mit kapsz?</h2><ul class="lp-feats">' + feats + '</ul></div>' +
    '<div class="lp-block"><h2 class="lp-h">Hogyan működik?</h2><ol class="lp-steps">' + steps + '</ol></div>' +
    '<div class="lp-block"><h2 class="lp-h">Amit megtanulsz</h2><ul class="lp-mods">' + mods + '</ul></div>' +
    '</div></section>';
}

export function viewIntro() {
  const stats = getCourseStats();
  const hours = stats.hours;
  const moduleCount = stats.modules;
  const hasProfile = !!getProfile();
  const saved = getProfile();
  return {
    title: 'Üdvözlünk',
    bare: !isLoggedIn(),
    html: landingHtml(moduleCount, hours, saved),
    mount(root) {
      const form = root.querySelector('#login-form');
      const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Számlálók felfutása
      if (!calm) root.querySelectorAll('[data-count]').forEach((n) => {
        const to = +n.dataset.count; const t0 = performance.now();
        const tick = (t) => { const k = Math.min(1, (t - t0) / 900); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
        n.textContent = '0'; requestAnimationFrame(tick);
      });
      // Görgetésre megjelenő blokkok
      const blocks = root.querySelectorAll('.lp-block');
      if (calm || !('IntersectionObserver' in window)) blocks.forEach((b) => b.classList.add('in'));
      else {
        const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.15 });
        blocks.forEach((b) => io.observe(b));
      }
      // A lebegő rajzok enyhén követik az egeret
      const land = root.querySelector('.landing');
      if (!calm && land && matchMedia('(pointer: fine)').matches) {
        land.addEventListener('pointermove', (e) => {
          land.style.setProperty('--mx', ((e.clientX / innerWidth) - .5).toFixed(3));
          land.style.setProperty('--my', ((e.clientY / innerHeight) - .5).toFixed(3));
        });
      }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nev = form.nev.value.trim();
        if (!nev) { root.querySelector('#login-err').hidden = false; form.nev.focus(); return; }
        const p = getProfile();
        setProfile(p ? Object.assign({}, p, { nev }) : {
          nev, celok: [], foglalkozas: '', tapasztalat: 'keveset', eszkoz: 'egyik', letrehozva: new Date().toISOString(),
        });
        login(form.emlekezz.checked);
        const target = takeReturnTo() || '#/';
        const land = root.querySelector('.landing');
        if (land && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          land.classList.add('landing-leave');
          setTimeout(() => go(target), 520);
        } else go(target);
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
        go(isNew ? (takeReturnTo() || '#/') : '#/beallitasok');
      });
    },
  };
}

export function toolName(id) {
  const t = ESZKOZOK.find((e) => e.id === id);
  if (!t || id === 'egyik' || id === 'mas') return null;
  return t.label;
}
