// Újrahasznosítható interaktív elemek. Mindegyik a fejezet állapotába (szovegek) menti, amit a tanuló beír vagy választ.
// Típusok: igazkitalalt, kovetkezoszo, epito, elotteutana, valasztos, allitas, lepesek, ertekelo,
//          ellenorzolista, agens, letoltes, osszevetes, otletlista

import { getProfile } from '../store.js?v=6bcb5a28';
import { esc, md, icon, promptBox, promptActions, downloadFile, toast } from '../util.js?v=6bcb5a28';

let seq = 0;
const uid = (p) => p + '-' + (++seq);

// ---------- „Igaz vagy kitalált?” kártyák ----------
function igazkitalalt(cfg, ctx) {
  const id = uid('ik');
  const html = '<div class="ia-cards" id="' + id + '">' + cfg.kartyak.map((k, i) =>
    '<div class="flipcard" data-i="' + i + '"><p class="flip-q"><span class="tag">AI-válasz ' + (i + 1) + '</span></p>' +
    '<blockquote>' + md(k.szoveg) + '</blockquote>' +
    '<div class="row"><button type="button" class="btn btn-small btn-ghost" data-v="igaz">Igaz</button><button type="button" class="btn btn-small btn-ghost" data-v="kitalalt">Kitalált</button></div>' +
    '<div class="flip-fb" aria-live="polite"></div></div>').join('') +
    '</div><p class="ia-score small muted" id="' + id + '-score" aria-live="polite"></p>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const saved = ctx.get('valaszok') || {};
      const show = (i, v) => {
        const k = cfg.kartyak[i];
        const card = box.querySelector('[data-i="' + i + '"]');
        const ok = v === k.valasz;
        card.classList.add(ok ? 'is-correct' : 'is-wrong');
        card.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.dataset.v === v) b.setAttribute('aria-pressed', 'true'); });
        card.querySelector('.flip-fb').innerHTML = '<p class="' + (ok ? 'fb-ok' : 'fb-no') + '">' + icon(ok ? 'check' : 'warn') + '<span><strong>' +
          (k.valasz === 'igaz' ? 'Igaz.' : 'Kitalált.') + '</strong> ' + md(k.magyarazat) + '</span></p>';
      };
      const score = () => {
        const n = Object.keys(saved).length;
        const ok = Object.entries(saved).filter(([i, v]) => cfg.kartyak[i].valasz === v).length;
        root.querySelector('#' + id + '-score').textContent = n ? ok + ' / ' + n + ' helyes tipp' + (n === cfg.kartyak.length ? ' – mind a ' + n + ' kártyát megnézted.' : '') : '';
      };
      Object.entries(saved).forEach(([i, v]) => show(Number(i), v));
      score();
      box.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]');
        if (!b) return;
        const i = Number(b.closest('.flipcard').dataset.i);
        saved[i] = b.dataset.v;
        ctx.set('valaszok', saved);
        show(i, b.dataset.v);
        score();
      });
    },
  };
}

// ---------- Következő szó megjóslása (animált) ----------
function kovetkezoszo(cfg) {
  const id = uid('ksz');
  const html = '<div class="nextword" id="' + id + '">' +
    '<p class="nw-sentence" aria-live="polite"><span class="nw-text"></span><span class="nw-cursor" aria-hidden="true">▍</span></p>' +
    '<ol class="nw-bars" aria-label="A következő szó jelöltjei és valószínűségük"></ol>' +
    '<div class="row"><button type="button" class="btn btn-primary nw-next">Következő szó ' + icon('arrowRight') + '</button>' +
    '<button type="button" class="btn btn-ghost nw-reset">Újrakezdés</button></div>' +
    '<p class="small muted">A számok szemléltető becslések, nem egy valódi modell kimenetei.</p></div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      let step = 0;
      const text = box.querySelector('.nw-text');
      const bars = box.querySelector('.nw-bars');
      const next = box.querySelector('.nw-next');
      function draw() {
        const done = cfg.lepesek.slice(0, step).map((l) => l.jeloltek[0][0]);
        text.textContent = cfg.kezdet + (done.length ? ' ' + done.join(' ') : '');
        const cur = cfg.lepesek[step];
        if (!cur) {
          bars.innerHTML = '<li class="nw-done">' + esc(cfg.zaras) + '</li>';
          next.disabled = true;
          return;
        }
        next.disabled = false;
        bars.innerHTML = cur.jeloltek.map((j, i) => '<li class="' + (i === 0 ? 'nw-top' : '') + '"><span class="nw-word">' + esc(j[0]) + '</span>' +
          '<span class="nw-bar"><span style="--w:' + j[1] + '%"></span></span><span class="nw-p">' + j[1] + '%</span></li>').join('');
      }
      next.addEventListener('click', () => { step++; draw(); });
      box.querySelector('.nw-reset').addEventListener('click', () => { step = 0; draw(); });
      draw();
    },
  };
}

// ---------- Építő (prompt, képleírás, jelenet, oldal-leírás) ----------
function epito(cfg, ctx) {
  const id = uid('ep');
  const vals = ctx.get('mezok') || {};
  const fields = cfg.mezok.map((f) => {
    const fid = id + '-' + f.id;
    const v = vals[f.id] != null ? vals[f.id] : '';
    let input;
    if (f.opciok) {
      input = '<div class="chips" role="group" aria-labelledby="' + fid + '-l">' + f.opciok.map((o) =>
        '<button type="button" class="chip" data-field="' + f.id + '" data-val="' + esc(o) + '" aria-pressed="' + (v === o ? 'true' : 'false') + '">' + esc(o) + '</button>').join('') +
        '</div><input type="text" id="' + fid + '" data-field="' + f.id + '" value="' + esc(v) + '" placeholder="' + esc(f.minta || 'vagy írd be a sajátodat') + '">';
    } else {
      input = '<textarea id="' + fid + '" data-field="' + f.id + '" rows="2" placeholder="' + esc(f.minta || '') + '">' + esc(v) + '</textarea>';
    }
    return '<div class="field"><label id="' + fid + '-l" for="' + fid + '"><strong>' + esc(f.cimke) + '</strong>' + (f.sugo ? ' <span class="muted">– ' + esc(f.sugo) + '</span>' : '') + '</label>' + input + '</div>';
  }).join('');
  const html = '<div class="builder" id="' + id + '"><div class="builder-fields">' + fields + '</div>' +
    '<div class="row"><button type="button" class="btn btn-ghost btn-small" data-minta>Kitöltés mintával</button><button type="button" class="btn btn-ghost btn-small" data-torles>Mezők törlése</button></div>' +
    '<div class="prompt-box builder-out"><div class="prompt-head"><span>' + esc(cfg.kimenetCim || 'Az összerakott kérés') + '</span>' +
    '<button type="button" class="btn btn-small btn-ghost copy-btn" data-copy>' + icon('copy') + '<span>Másolás</span></button></div><pre class="prompt-text" aria-live="polite"></pre>' + promptActions() + '</div></div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const out = box.querySelector('.prompt-text');
      function build() {
        const parts = cfg.mezok.map((f) => {
          const v = (vals[f.id] || '').trim();
          return v ? (f.elotag ? f.elotag + ' ' : '') + v + (f.utotag || '') : '';
        }).filter(Boolean);
        out.textContent = parts.length ? parts.join(cfg.elvalaszto || '\n') : 'Töltsd ki a fenti mezőket – itt jelenik meg az eredmény.';
      }
      function sync(field, v) {
        vals[field] = v;
        box.querySelectorAll('.chip[data-field="' + field + '"]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.val === v)));
        const inp = box.querySelector('[data-field="' + field + '"]:not(.chip)');
        if (inp && inp.value !== v) inp.value = v;
        ctx.set('mezok', vals);
        build();
      }
      box.addEventListener('input', (e) => { const f = e.target.dataset.field; if (f) sync(f, e.target.value); });
      box.addEventListener('click', (e) => {
        const c = e.target.closest('.chip');
        if (c) { sync(c.dataset.field, c.getAttribute('aria-pressed') === 'true' ? '' : c.dataset.val); return; }
        if (e.target.closest('[data-minta]')) cfg.mezok.forEach((f) => sync(f.id, f.mintaErtek || f.minta || ''));
        if (e.target.closest('[data-torles]')) cfg.mezok.forEach((f) => sync(f.id, ''));
      });
      build();
    },
  };
}

// ---------- Előtte / utána csúszka ----------
function elotteutana(cfg) {
  const id = uid('eu');
  const html = '<div class="beforeafter" id="' + id + '">' +
    '<div class="ba-stage">' +
    '<div class="ba-pane ba-before"><p class="ba-label">' + esc(cfg.elotteCim || 'Előtte') + '</p>' + cfg.elotte.map((p) => '<p>' + md(p) + '</p>').join('') + '</div>' +
    '<div class="ba-pane ba-after"><p class="ba-label">' + esc(cfg.utanaCim || 'Utána') + '</p>' + cfg.utana.map((p) => '<p>' + md(p) + '</p>').join('') + '</div>' +
    '</div>' +
    '<label class="ba-control"><span>' + esc(cfg.elotteCim || 'Előtte') + '</span><input type="range" min="0" max="100" value="0" aria-label="Csúszka: előtte vagy utána"><span>' + esc(cfg.utanaCim || 'Utána') + '</span></label>' +
    (cfg.megjegyzes ? '<p class="small muted">' + md(cfg.megjegyzes) + '</p>' : '') + '</div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const r = box.querySelector('input');
      const set = () => {
        box.style.setProperty('--ba', r.value);
        box.classList.toggle('ba-show-after', Number(r.value) >= 50);
        r.setAttribute('aria-valuetext', Number(r.value) >= 50 ? 'Utána látszik' : 'Előtte látszik');
      };
      r.addEventListener('input', set);
      set();
    },
  };
}

// ---------- Választós esetek („Mit kérnél?”, „Megoszthatom?”, csalásfelismerés) ----------
function valasztos(cfg, ctx) {
  const id = uid('va');
  const saved = ctx.get('valaszok') || {};
  const html = '<div class="cases" id="' + id + '">' + cfg.esetek.map((e, i) =>
    '<div class="case" data-i="' + i + '"><p class="case-n small muted">' + (i + 1) + ' / ' + cfg.esetek.length + '</p>' +
    (e.kontextus ? '<div class="case-ctx">' + md(e.kontextus) + '</div>' : '') +
    '<p class="case-q"><strong>' + md(e.kerdes || cfg.kerdes) + '</strong></p>' +
    '<div class="case-opts">' + (e.opciok || cfg.opciok).map((o, j) => '<button type="button" class="btn btn-ghost case-opt" data-j="' + j + '">' + md(o) + '</button>').join('') + '</div>' +
    '<div class="case-fb" aria-live="polite"></div></div>').join('') + '</div><p class="ia-score small muted" aria-live="polite"></p>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const show = (i, j) => {
        const e = cfg.esetek[i];
        const card = box.querySelector('[data-i="' + i + '"]');
        const ok = j === e.helyes;
        card.querySelectorAll('.case-opt').forEach((b) => {
          b.disabled = true;
          const k = Number(b.dataset.j);
          if (k === e.helyes) b.classList.add('is-correct');
          if (k === j && !ok) b.classList.add('is-wrong');
        });
        card.querySelector('.case-fb').innerHTML = '<p class="' + (ok ? 'fb-ok' : 'fb-no') + '">' + icon(ok ? 'check' : 'warn') + '<span><strong>' + (ok ? 'Jó választás.' : 'Inkább nem.') + '</strong> ' + md(e.magyarazat) + '</span></p>';
      };
      const score = () => {
        const n = Object.keys(saved).length;
        const ok = Object.entries(saved).filter(([i, j]) => cfg.esetek[i].helyes === j).length;
        box.nextElementSibling.textContent = n ? ok + ' / ' + n + ' jó válasz' : '';
      };
      Object.entries(saved).forEach(([i, j]) => show(Number(i), j));
      score();
      box.addEventListener('click', (ev) => {
        const b = ev.target.closest('.case-opt');
        if (!b || b.disabled) return;
        const i = Number(b.closest('.case').dataset.i);
        saved[i] = Number(b.dataset.j);
        ctx.set('valaszok', saved);
        show(i, saved[i]);
        score();
      });
    },
  };
}

// ---------- Állítás-ellenőrző (forrással) ----------
function allitas(cfg, ctx) {
  const id = uid('al');
  const saved = ctx.get('allitasok') || {};
  const html = '<div class="claims" id="' + id + '">' + cfg.allitasok.map((a, i) => {
    const s = saved[i] || {};
    return '<div class="claim card-flat" data-i="' + i + '"><p class="tag">' + (i + 1) + '. AI-állítás</p><blockquote>' + md(a.szoveg) + '</blockquote>' +
      '<p class="small muted">' + icon('tip') + ' ' + md(a.tipp) + '</p>' +
      '<div class="field"><label for="' + id + '-f' + i + '">Hol ellenőrizted? (forrás neve vagy webcíme)</label><input type="text" id="' + id + '-f' + i + '" data-k="forras" value="' + esc(s.forras || '') + '" placeholder="pl. hivatalos statisztikai hivatal oldala"></div>' +
      '<fieldset class="field"><legend>Mit találtál?</legend><div class="choices choices-inline">' +
      [['igaz', 'Megerősítette'], ['reszben', 'Részben igaz'], ['hamis', 'Cáfolta'], ['nemtalaltam', 'Nem találtam forrást']].map(([v, l]) =>
        '<label class="choice"><input type="radio" name="' + id + '-v' + i + '" value="' + v + '" data-k="itelet"' + (s.itelet === v ? ' checked' : '') + '><span>' + l + '</span></label>').join('') +
      '</div></fieldset><div class="claim-fb"></div></div>';
  }).join('') + '</div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const fb = (i) => {
        const s = saved[i] || {};
        const el = box.querySelector('[data-i="' + i + '"] .claim-fb');
        if (s.itelet && (s.forras || '').trim().length > 2) {
          el.innerHTML = '<p class="fb-ok">' + icon('check') + '<span>' + md(cfg.allitasok[i].megoldas) + '</span></p>';
        } else el.innerHTML = '';
      };
      cfg.allitasok.forEach((a, i) => fb(i));
      box.addEventListener('input', (e) => {
        const c = e.target.closest('.claim');
        if (!c) return;
        const i = c.dataset.i;
        saved[i] = saved[i] || {};
        saved[i][e.target.dataset.k] = e.target.value;
        ctx.set('allitasok', saved);
        fb(i);
      });
    },
  };
}

// ---------- Lépésenkénti útmutató telefon-mockuppal ----------
function lepesek(cfg) {
  const id = uid('lp');
  const html = '<div class="stepper" id="' + id + '"><div class="stepper-grid">' +
    '<div class="phone" aria-hidden="true"><div class="phone-notch"></div><div class="phone-screen"></div></div>' +
    '<div class="stepper-text"><p class="small muted stepper-n" aria-live="polite"></p><h4 class="stepper-title"></h4><p class="stepper-desc"></p>' +
    '<div class="row"><button type="button" class="btn btn-ghost" data-d="-1">' + icon('arrowLeft') + 'Előző</button><button type="button" class="btn btn-primary" data-d="1">Következő' + icon('arrowRight') + '</button></div></div></div>' +
    '<p class="small muted">A képernyők egyszerűsített, általános mockupok – a te alkalmazásodban a gombok helye és neve eltérhet.</p></div>';
  function screen(s) {
    const items = (s.kepernyo || []).map((r) => {
      if (r.tipus === 'buborek-ai') return '<div class="ph-bubble ph-ai">' + esc(r.szoveg) + '</div>';
      if (r.tipus === 'buborek-en') return '<div class="ph-bubble ph-me">' + esc(r.szoveg) + '</div>';
      if (r.tipus === 'gomb') return '<div class="ph-btn' + (r.kiemelt ? ' ph-btn-hl' : '') + '">' + esc(r.szoveg) + '</div>';
      if (r.tipus === 'foto') return '<div class="ph-photo">' + esc(r.szoveg) + '</div>';
      if (r.tipus === 'mikrofon') return '<div class="ph-mic"><span></span></div><p class="ph-cap">' + esc(r.szoveg || '') + '</p>';
      return '<p class="ph-cap">' + esc(r.szoveg) + '</p>';
    }).join('');
    return '<div class="ph-top">' + esc(s.fejlec || 'AI-asszisztens') + '</div><div class="ph-body">' + items + '</div>';
  }
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      let i = 0;
      const draw = () => {
        const s = cfg.lepesek[i];
        box.querySelector('.phone-screen').innerHTML = screen(s);
        box.querySelector('.stepper-n').textContent = (i + 1) + '. lépés / ' + cfg.lepesek.length;
        box.querySelector('.stepper-title').textContent = s.cim;
        box.querySelector('.stepper-desc').innerHTML = md(s.leiras);
        box.querySelector('[data-d="-1"]').disabled = i === 0;
        box.querySelector('[data-d="1"]').disabled = i === cfg.lepesek.length - 1;
      };
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-d]');
        if (!b) return;
        i = Math.max(0, Math.min(cfg.lepesek.length - 1, i + Number(b.dataset.d)));
        draw();
      });
      draw();
    },
  };
}

// ---------- Saját értékelő táblázat ----------
function ertekelo(cfg, ctx) {
  const id = uid('er');
  const saved = ctx.get('ertekeles') || { oszlopok: cfg.oszlopok.slice(), pont: {}, jegyzet: '' };
  const head = saved.oszlopok.map((o, c) => '<th scope="col"><input type="text" class="er-col" data-c="' + c + '" value="' + esc(o) + '" aria-label="' + (c + 1) + '. oszlop neve"></th>').join('');
  const rows = cfg.szempontok.map((s, r) => '<tr><th scope="row">' + esc(s) + '</th>' + saved.oszlopok.map((o, c) => {
    const v = saved.pont[r + '-' + c] || '';
    return '<td><select data-rc="' + r + '-' + c + '" aria-label="' + esc(s) + ' – ' + (c + 1) + '. eszköz pontszáma"><option value="">–</option>' +
      [1, 2, 3, 4, 5].map((n) => '<option' + (String(v) === String(n) ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></td>';
  }).join('') + '</tr>').join('');
  const html = '<div class="rating" id="' + id + '"><div class="table-scroll"><table class="table"><thead><tr><th scope="col">Szempont (1–5)</th>' + head + '</tr></thead><tbody>' + rows +
    '</tbody><tfoot><tr><th scope="row">Összesen</th>' + saved.oszlopok.map((o, c) => '<td class="er-sum" data-c="' + c + '">0</td>').join('') + '</tr></tfoot></table></div>' +
    '<div class="field"><label for="' + id + '-j">Saját megjegyzésem</label><textarea id="' + id + '-j" rows="3" placeholder="Melyiket választanám erre a feladatra, és miért?">' + esc(saved.jegyzet) + '</textarea></div></div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const sums = () => saved.oszlopok.forEach((o, c) => {
        let t = 0;
        cfg.szempontok.forEach((s, r) => { t += Number(saved.pont[r + '-' + c] || 0); });
        box.querySelector('.er-sum[data-c="' + c + '"]').textContent = t;
      });
      box.addEventListener('input', (e) => {
        if (e.target.dataset.rc) saved.pont[e.target.dataset.rc] = e.target.value;
        else if (e.target.classList.contains('er-col')) saved.oszlopok[Number(e.target.dataset.c)] = e.target.value;
        else if (e.target.tagName === 'TEXTAREA') saved.jegyzet = e.target.value;
        ctx.set('ertekeles', saved);
        sums();
      });
      sums();
    },
  };
}

// ---------- Ellenőrzőlista ----------
function ellenorzolista(cfg, ctx) {
  const id = uid('el');
  const saved = ctx.get('pipak') || {};
  const html = '<div class="checklist" id="' + id + '"><ul>' + cfg.tetelek.map((t, i) => {
    const tt = typeof t === 'string' ? { szoveg: t } : t;
    return '<li><label class="check-item"><input type="checkbox" data-i="' + i + '"' + (saved[i] ? ' checked' : '') + '><span>' + md(tt.szoveg) +
      (tt.miert ? '<span class="small muted d-block">' + md(tt.miert) + '</span>' : '') + '</span></label></li>';
  }).join('') + '</ul><p class="small muted cl-count" aria-live="polite"></p>' + (cfg.lezaro ? '<div class="cl-done" hidden>' + md(cfg.lezaro) + '</div>' : '') + '</div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const count = () => {
        const n = Object.values(saved).filter(Boolean).length;
        box.querySelector('.cl-count').textContent = n + ' / ' + cfg.tetelek.length + ' kipipálva';
        const d = box.querySelector('.cl-done');
        if (d) d.hidden = n < cfg.tetelek.length;
      };
      box.addEventListener('change', (e) => {
        saved[e.target.dataset.i] = e.target.checked;
        ctx.set('pipak', saved);
        count();
      });
      count();
    },
  };
}

// ---------- AI-ágens munkamenet szimuláció ----------
function agens(cfg) {
  const id = uid('ag');
  const html = '<div class="agent-sim" id="' + id + '"><div class="term-window" role="log" aria-live="polite" aria-label="Szimulált ágens-munkamenet">' +
    '<div class="term-bar"><span></span><span></span><span></span><em>szimuláció – nem valódi program</em></div><div class="term-body"></div></div>' +
    '<div class="row agent-ctrl"></div></div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const body = box.querySelector('.term-body');
      const ctrl = box.querySelector('.agent-ctrl');
      const role = { te: 'Te', agens: 'Ágens', rendszer: 'Rendszer' };
      let i = 0;
      function add(szerep, szoveg) {
        const d = document.createElement('div');
        d.className = 'term-line term-' + szerep;
        d.innerHTML = '<span class="term-who">' + role[szerep] + '</span><div class="term-msg">' + szoveg.map((p) => '<p>' + md(p) + '</p>').join('') + '</div>';
        body.appendChild(d);
        body.scrollTop = body.scrollHeight;
      }
      function startControls() {
        ctrl.innerHTML = '<button type="button" class="btn btn-primary" data-a="next">Indítás' + icon('arrowRight') + '</button>';
      }
      function showStep() {
        const s = cfg.lepesek[i];
        if (!s) {
          ctrl.innerHTML = '<p class="fb-ok">' + icon('check') + '<span>' + md(cfg.zaras) + '</span></p><button type="button" class="btn btn-ghost" data-a="reset">Újrakezdés</button>';
          return;
        }
        add(s.szerep, s.szoveg);
        if (s.jovahagyas) {
          ctrl.innerHTML = '<p class="small agent-q"><strong>' + md(s.jovahagyas.kerdes) + '</strong></p>' +
            '<button type="button" class="btn btn-accent" data-a="ok">' + esc(s.jovahagyas.igen) + '</button>' +
            '<button type="button" class="btn btn-ghost" data-a="no">' + esc(s.jovahagyas.nem) + '</button>';
        } else {
          ctrl.innerHTML = '<button type="button" class="btn btn-primary" data-a="next">Következő lépés' + icon('arrowRight') + '</button>';
        }
      }
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        const a = b.dataset.a;
        const s = cfg.lepesek[i];
        if (a === 'reset') { body.innerHTML = ''; i = 0; startControls(); return; }
        if (a === 'next') { if (body.children.length) i++; showStep(); return; }
        if (a === 'no') { add('te', [s.jovahagyas.nem]); add('agens', s.jovahagyas.nemValasz); return; }
        if (a === 'ok') { add('te', [s.jovahagyas.igen]); if (s.utana) add('agens', s.utana); i++; showStep(); }
      });
      startControls();
    },
  };
}

// ---------- Letölthető kitalált mintadokumentum ----------
function letoltes(cfg) {
  const id = uid('lt');
  const html = '<div class="download card-flat" id="' + id + '">' + cfg.fajlok.map((f, i) =>
    '<div class="dl-item"><div>' + icon('download') + '<strong>' + esc(f.nev) + '</strong><p class="small muted">' + md(f.leiras) + '</p></div>' +
    '<button type="button" class="btn btn-ghost btn-small" data-i="' + i + '">Letöltés</button></div>' +
    '<details><summary>Megnézem itt</summary><pre class="dl-preview">' + esc(f.tartalom) + '</pre></details>').join('') + '</div>';
  return {
    html,
    mount(root) {
      root.querySelector('#' + id).addEventListener('click', (e) => {
        const b = e.target.closest('button[data-i]');
        if (!b) return;
        const f = cfg.fajlok[Number(b.dataset.i)];
        downloadFile(f.nev, f.tartalom, f.nev.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8');
        toast('Letöltve: ' + f.nev);
      });
    },
  };
}

// ---------- Egymás melletti, szemléltető kimenetek ----------
function osszevetes(cfg) {
  const html = '<div class="compare">' + (cfg.feladat ? promptBox(cfg.feladat, 'A közös feladat') : '') +
    '<div class="grid grid-3">' + cfg.valaszok.map((v) => '<div class="card-flat compare-col"><p class="tag">' + esc(v.cim) + '</p>' + v.szoveg.map((p) => '<p>' + md(p) + '</p>').join('') +
    '<p class="small muted"><strong>Megfigyelés:</strong> ' + md(v.megjegyzes) + '</p></div>').join('') + '</div>' +
    '<p class="small muted">' + icon('warn') + ' ' + md(cfg.figyelmeztetes) + '</p></div>';
  return { html, mount() {} };
}

// ---------- Ötletlista a profil alapján (záró projekt) ----------
function otletlista(cfg, ctx) {
  const id = uid('ot');
  const p = getProfile() || {};
  const goals = (p.celok && p.celok.length) ? p.celok : ['egyeb'];
  const mine = [];
  goals.forEach((g) => (cfg.otletek[g] || []).forEach((o) => mine.push({ g, o })));
  const rest = [];
  Object.keys(cfg.otletek).filter((g) => !goals.includes(g)).forEach((g) => cfg.otletek[g].forEach((o) => rest.push({ g, o })));
  const chosen = ctx.get('valasztott') || '';
  const item = (x, k) => '<label class="choice choice-block"><input type="radio" name="' + id + '" value="' + esc(x.o) + '"' + (chosen === x.o ? ' checked' : '') + '><span>' + esc(x.o) + '</span></label>';
  const html = '<div class="ideas" id="' + id + '"><h4>Neked javasolt ötletek</h4><div class="choices">' + mine.map(item).join('') + '</div>' +
    '<details><summary>További ötletek</summary><div class="choices">' + rest.map(item).join('') + '</div></details>' +
    '<div class="field"><label for="' + id + '-sajat">Vagy írd le a saját feladatodat</label><textarea id="' + id + '-sajat" rows="2" placeholder="pl. heti menütervet és bevásárlólistát készíttetek">' + esc(ctx.get('sajat') || '') + '</textarea></div>' +
    '<p class="small muted ideas-sel" aria-live="polite"></p></div>';
  return {
    html,
    mount(root) {
      const box = root.querySelector('#' + id);
      const show = () => {
        const v = (ctx.get('sajat') || '').trim() || ctx.get('valasztott');
        box.querySelector('.ideas-sel').textContent = v ? 'A választott feladatod: ' + v : '';
      };
      box.addEventListener('change', (e) => { if (e.target.type === 'radio') { ctx.set('valasztott', e.target.value); show(); } });
      box.addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') { ctx.set('sajat', e.target.value); show(); } });
      show();
    },
  };
}

const TYPES = { igazkitalalt, kovetkezoszo, epito, elotteutana, valasztos, allitas, lepesek, ertekelo, ellenorzolista, agens, letoltes, osszevetes, otletlista };

export function renderInteractive(cfg, ctx) {
  const f = TYPES[cfg.tipus];
  if (!f) return { html: '<p class="muted">Ismeretlen interaktív elem: ' + esc(cfg.tipus) + '</p>', mount() {} };
  const r = f(cfg, ctx);
  return {
    html: '<div class="interactive">' + (cfg.cim ? '<h3 class="ia-title">' + esc(cfg.cim) + '</h3>' : '') + (cfg.bevezeto ? '<p>' + md(cfg.bevezeto) + '</p>' : '') + r.html + '</div>',
    mount: r.mount,
  };
}
