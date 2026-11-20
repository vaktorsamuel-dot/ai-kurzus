// Közös segédfüggvények: HTML-építés, szövegjelölés, formázás, ikonok, értesítés, másolás.

import { course } from './data.js?v=7150738a';

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let termSeq = 0;
// Egyszerű jelölés: **félkövér**, *dőlt*, [[fogalom]] vagy [[fogalom|megjelenő szöveg]], `kód`
export function md(text) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Hivatkozás: [szöveg](https://...) – csak https, új lapon nyílik
  s = s.replace(/\[([^\]\[]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1<span class="visually-hidden"> (új lapon nyílik)</span></a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, id, label) => {
    const f = course.szoszedet[id.trim()];
    const shown = label || (f ? f.kifejezes : id);
    if (!f) return shown;
    const tid = 'term-' + (++termSeq);
    return '<span class="term-wrap"><button type="button" class="term" aria-expanded="false" aria-controls="' + tid + '">' +
      shown + '</button><span class="term-pop" role="tooltip" id="' + tid + '" hidden><strong>' + esc(f.kifejezes) +
      ':</strong> ' + esc(f.magyarazat) + '</span></span>';
  });
  return s;
}

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function $(sel, root = document) { return root.querySelector(sel); }
export function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

const dtf = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
const dtfTime = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export function fmtDate(iso) { return iso ? dtf.format(new Date(iso)) : ''; }
export function fmtDateTime(iso) { return iso ? dtfTime.format(new Date(iso)) : ''; }
export function fmtPct(n) { return new Intl.NumberFormat('hu-HU').format(n) + '%'; }
export function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}
export function fmtMin(min) { return 'kb. ' + min + ' perc'; }

// Ikonok (inline SVG, a színt a currentColor adja)
const ICONS = {
  lock: '<path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  progress: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
  skip: '<path d="M6 6l7 6-7 6zM15 6h3v12h-3z" fill="currentColor"/>',
  arrowLeft: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  arrowRight: '<path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M4 18l5.5-5 4 3.5L17 13l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 10.5l5-3v9l-5-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  tip: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  warn: '<path d="M12 3l9.5 17h-19z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.2v.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  settings: '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  help: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.3a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.9-1.1 1.6v.4M12 16.8v.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  pause: '<rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>',
  back10: '<path d="M11.5 5.5A7 7 0 1 1 5 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11.5 2.5v6l-4-3z" fill="currentColor"/><text x="12.3" y="15.5" font-size="7" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="currentColor">10</text>',
  fwd10: '<path d="M12.5 5.5A7 7 0 1 0 19 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12.5 2.5v6l4-3z" fill="currentColor"/><text x="11.7" y="15.5" font-size="7" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="currentColor">10</text>',
  volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  cc: '<rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 10.3a2.2 2.2 0 1 0 0 3.4M17 10.3a2.2 2.2 0 1 0 0 3.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  fullscreen: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 18.5h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  circle: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/>',
  user: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};
export function icon(name, cls = '') {
  return '<svg class="icon ' + cls + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
}

export const STATUS = {
  kesz: { label: 'Kész', icon: 'check' },
  folyamatban: { label: 'Folyamatban', icon: 'progress' },
  nincs: { label: 'Nincs elkezdve', icon: 'circle' },
};
export function statusBadge(status, extra = '') {
  const s = STATUS[status];
  return '<span class="badge badge-' + status + '">' + icon(s.icon) + '<span>' + (extra || s.label) + '</span></span>';
}

export function progressBar(pct, label, cls = '') {
  return '<div class="pbar ' + cls + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct +
    '" aria-label="' + esc(label) + '"><span style="width:' + pct + '%"></span></div>';
}

let toastTimer;
export function toast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }
}

// ---- Másolható prompt-doboz + Másolás / Megnyitás gombok (a közös komponens) ----
// Az előtöltő címek változhatnak; ha az eszköz nem tölti be magától a kérést, a vágólapra másolt szöveget kell beilleszteni.
export const MAX_URL_PROMPT = 1800; // a kódolt kérés ennél hosszabb esetén nem kerül a címbe
const AI_TOOLS = {
  claude: { label: 'Megnyitás Claude-ban', short: 'Claude', url: 'https://claude.ai/new', q: 'q' },
  chatgpt: { label: 'Megnyitás ChatGPT-ben', short: 'ChatGPT', url: 'https://chatgpt.com/', q: 'q' },
  gemini: { label: 'Megnyitás Gemini-ben', short: 'Gemini', url: 'https://gemini.google.com/app', q: null },
};
const PLACEHOLDER = /\[[^\]\n]+\]/;

export function hasPlaceholder(text) { return PLACEHOLDER.test(text || ''); }

// Megnyitási cím egy eszközhöz; { href, prefilled }.
export function openUrl(tool, text) {
  const t = AI_TOOLS[tool];
  const enc = encodeURIComponent(text || '');
  if (!t.q || !text || enc.length > MAX_URL_PROMPT) return { href: t.url, prefilled: false };
  return { href: t.url + '?' + t.q + '=' + enc, prefilled: true };
}

export function promptActions(label) {
  return '<div class="prompt-actions no-print">' + (label ? '<p class="prompt-try"><strong>' + esc(label) + '</strong></p>' : '') + '<div class="prompt-open">' +
    Object.keys(AI_TOOLS).map((k) => '<a class="btn btn-ghost btn-open" href="' + AI_TOOLS[k].url + '" target="_blank" rel="noopener" data-open="' + k + '">' + icon('arrowRight') + '<span>' + AI_TOOLS[k].label + '</span></a>').join('') +
    '</div><p class="small muted prompt-note">Ha nem vagy bejelentkezve, előbb jelentkezz be, utána illeszd be a kérést.</p></div>';
}

let boxSeq = 0;
export function promptBox(text, title = 'Másolható kérés', tryLabel = '') {
  const edit = hasPlaceholder(text);
  const id = 'pb-' + (++boxSeq);
  const body = edit
    ? '<p class="prompt-edit-note" id="' + id + '-n"><strong>Előbb írd át a szögletes zárójeles részt.</strong></p>' +
      '<textarea class="prompt-text prompt-edit" id="' + id + '" rows="' + Math.min(14, Math.max(4, String(text).split('\n').length + 1)) + '" aria-describedby="' + id + '-n" spellcheck="false">' + esc(text) + '</textarea>'
    : '<pre class="prompt-text">' + esc(text) + '</pre>';
  return '<div class="prompt-box' + (edit ? ' prompt-editable' : '') + '"><div class="prompt-head"><span>' + esc(title) + '</span>' +
    '<button type="button" class="btn btn-small btn-ghost copy-btn" data-copy>' + icon('copy') + '<span>Másolás</span></button></div>' +
    body + promptActions(tryLabel) + '</div>';
}

function promptTextOf(box) {
  const src = box.querySelector('.prompt-text');
  if (!src) return '';
  return (src.tagName === 'TEXTAREA' ? src.value : src.textContent) || '';
}

// Delegált események: szakszó-buborék és másolás gombok
export function initGlobalHandlers() {
  document.addEventListener('click', async (e) => {
    const term = e.target.closest('.term');
    document.querySelectorAll('.term[aria-expanded="true"]').forEach((t) => {
      if (t !== term) { t.setAttribute('aria-expanded', 'false'); document.getElementById(t.getAttribute('aria-controls')).hidden = true; }
    });
    if (term) {
      const pop = document.getElementById(term.getAttribute('aria-controls'));
      const open = term.getAttribute('aria-expanded') !== 'true';
      term.setAttribute('aria-expanded', String(open));
      pop.hidden = !open;
      return;
    }
    const printBtn = e.target.closest('[data-print-card]');
    if (printBtn) {
      const card = printBtn.closest('.print-card-wrap').querySelector('.print-card');
      card.classList.add('print-target');
      document.body.classList.add('printing-card');
      const done = () => { card.classList.remove('print-target'); document.body.classList.remove('printing-card'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      window.print();
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) {
      // A natív megnyitást nem állítjuk meg: a címet most, kattintáskor állítjuk be az aktuális szövegből.
      const text = promptTextOf(open.closest('.prompt-box'));
      const tool = open.dataset.open;
      const u = openUrl(tool, text);
      open.href = u.href;
      if (!text.trim()) { toast('A kérés mező üres, ezért csak megnyitom az eszközt.'); return; }
      copyText(text).then((ok) => {
        toast(!ok ? 'A másolás nem sikerült. Jelöld ki és másold ki kézzel a kérést, majd illeszd be: Ctrl+V (Mac-en Cmd+V).'
          : u.prefilled ? 'A kérést a vágólapra is átmásoltam. Ha nem töltődött be magától, illeszd be: Ctrl+V (Mac-en Cmd+V).'
            : 'Átmásoltam a kérést. Illeszd be: Ctrl+V (Mac-en Cmd+V).', 6000);
      });
      return;
    }
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const box = copy.closest('.prompt-box');
      const src = copy.dataset.copySource ? document.getElementById(copy.dataset.copySource) : box.querySelector('.prompt-text');
      const text = 'value' in src && src.tagName !== 'PRE' ? src.value : src.textContent;
      if (!text.trim()) { toast('Nincs mit másolni: a kérés mező üres.'); return; }
      const ok = await copyText(text);
      const label = copy.querySelector('span');
      const old = label.textContent;
      label.textContent = ok ? 'Másolva' : 'Nem sikerült';
      copy.classList.add('copied');
      toast(ok ? 'A szöveg a vágólapra került.' : 'A másolás nem sikerült – jelöld ki és másold kézzel.');
      setTimeout(() => { label.textContent = old; copy.classList.remove('copied'); }, 1800);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.term[aria-expanded="true"]').forEach((t) => {
        t.setAttribute('aria-expanded', 'false');
        document.getElementById(t.getAttribute('aria-controls')).hidden = true;
        t.focus();
      });
    }
  });
}

export function downloadFile(name, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ---- Modulikonok (vonalas, a színt a currentColor adja) ----
const S = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const MODULE_ICONS = {
  // 1. Mi az AI – mikrochip
  m01: '<rect x="6.5" y="6.5" width="11" height="11" rx="2" ' + S + '/><path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3M10 10h4v4h-4z" ' + S + '/>',
  // 2. Jó kérés – szövegbuborék tollal
  m02: '<path d="M4 5.5h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3.5v-3.5H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" ' + S + '/><path d="M15.5 20.5l5-5 1.5 1.5-5 5h-1.5z" ' + S + '/>',
  // 3. Szövegek és dokumentumok – dokumentum
  m03: '<path d="M6 3h8l4 4v14H6z" ' + S + '/><path d="M14 3v4h4M9 11h6M9 14.5h6M9 18h4" ' + S + '/>',
  // 4. Kutatás és ellenőrzés – nagyító pipával
  m04: '<circle cx="10.5" cy="10.5" r="6.5" ' + S + '/><path d="M15.5 15.5L21 21M7.8 10.6l1.9 1.9 3.4-3.6" ' + S + '/>',
  // 5. Hang és fotó – mikrofon
  m05: '<rect x="9" y="3" width="6" height="11" rx="3" ' + S + '/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" ' + S + '/>',
  // 6. Képgenerálás – kép
  m06: '<rect x="3" y="5" width="18" height="14" rx="2" ' + S + '/><circle cx="9" cy="10" r="1.8" ' + S + '/><path d="M4 18l5.5-5 4 3.5L17 13l3 3" ' + S + '/>',
  // 7. Videógenerálás – filmcsapó
  m07: '<rect x="3" y="9" width="18" height="11" rx="1.5" ' + S + '/><path d="M3 9l1-4.5 16.5 2L21 9M7.5 5l2.5 4M12.5 5.6l2.5 3.4" ' + S + '/>',
  // 8. Biztonság – pajzs pipával
  m08: '<path d="M12 3l7.5 3v5.5c0 4.4-3.1 8-7.5 9.5-4.4-1.5-7.5-5.1-7.5-9.5V6z" ' + S + '/><path d="M8.8 12l2.2 2.2 4.3-4.4" ' + S + '/>',
  // 9. Eszközök és saját asszisztens – csúszkák
  m09: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9M4 12h5M13 12h7" ' + S + '/><circle cx="15" cy="7" r="2" ' + S + '/><circle cx="9" cy="17" r="2" ' + S + '/><circle cx="11" cy="12" r="2" ' + S + '/>',
  // 10. Weboldal – böngészőablak
  m10: '<rect x="3" y="4" width="18" height="16" rx="2" ' + S + '/><path d="M3 8.5h18M6 6.3h.01M8.5 6.3h.01M7 13h6M7 16h10" ' + S + '/>',
  // 11. AI-ágensek – terminál
  m11: '<rect x="3" y="4.5" width="18" height="15" rx="2" ' + S + '/><path d="M7 10l3 2.5L7 15M12.5 15.5H17" ' + S + '/>',
  // Átállás ChatGPT-ről Claude-ra – két nyíl
  m12: '<path d="M4 8h13M13 4l4 4-4 4M20 16H7M11 12l-4 4 4 4" ' + S + '/>',
  // Záró projekt – zászló
  zp: '<path d="M5 21V4M5 4.5h11l-2 3.5 2 3.5H5" ' + S + '/>',
};
export function moduleIcon(mod, cls = '') {
  const p = MODULE_ICONS[mod.id];
  if (!p) return '';
  return '<span class="micon ' + cls + '" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">' + p + '</svg></span>';
}
