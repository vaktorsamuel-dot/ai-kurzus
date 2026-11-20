// Képek és videók a manifesztből, arányos helyőrzővel hiányzó vagy betölthetetlen fájl esetén.

import { media } from '../data.js?v=6dc27975';
import { esc, icon } from '../util.js?v=6dc27975';

export const DEV = new URLSearchParams(location.search).has('dev');

const RATIOS = { hero: '16 / 9', kartya: '4 / 3', video: '16 / 9', telefon: '9 / 16' };

function placeholderInner(m, kind) {
  const what = m ? m.hova || m.alt || m.cim : 'média';
  const dev = DEV && m
    ? '<details class="ph-dev"><summary>Fejlesztői mód: generálási leírás (' + esc(m.id) + ')</summary>' +
      (m.prompt_en ? '<p><strong>Prompt (EN):</strong> ' + esc(m.prompt_en) + '</p>' : '') +
      (m.prompt_hu ? '<p><strong>Leírás (HU):</strong> ' + esc(m.prompt_hu) + '</p>' : '') +
      (m.forgatokonyv ? '<p><strong>Forgatókönyv:</strong> ' + esc(m.forgatokonyv.osszefoglalo || '') + '</p>' : '') +
      '<p class="small">Fájl: <code>' + esc(m.fajl || '') + '</code> · státusz: ' + esc(m.statusz) + '</p></details>'
    : '';
  return '<div class="ph-inner">' + icon(kind === 'video' ? 'video' : 'image', 'ph-icon') +
    '<p class="ph-text"><span class="ph-label">' + (kind === 'video' ? 'Videó helye' : 'Kép helye') + '</span>Ide kerül: ' + esc(what) + '</p>' + dev + '</div>';
}

export function placeholder(m, kind, ratio) {
  return '<div class="media-frame ph" style="aspect-ratio:' + ratio + '" role="img" aria-label="' +
    esc((kind === 'video' ? 'Videó helyőrző: ' : 'Kép helyőrző: ') + (m ? m.alt || m.hova || '' : '')) + '">' + placeholderInner(m, kind) + '</div>';
}

// Kép: <picture> webp + jpg tartalékkal, lusta betöltéssel, fix arányú keretben.
export function image(id, variant = 'hero') {
  const m = media(id);
  const ratio = RATIOS[variant] || RATIOS.hero;
  // Hiányzó kép: élesben semmi nem látszik (se hibaikon, se üres keret); fejlesztői módban (?dev=1) helyőrző.
  if (!m || m.statusz !== 'kesz') return DEV ? '<figure class="media">' + placeholder(m, 'kep', ratio) + '</figure>' : '';
  const base = 'assets/img/' + m.fajl.replace(/\.(webp|jpe?g|png)$/i, '');
  const [w, h] = (m.meret || '1600x900').split('x');
  return '<figure class="media"><div class="media-frame" style="aspect-ratio:' + ratio + '" data-media-id="' + esc(m.id) + '">' +
    '<button type="button" class="media-zoom" data-zoom aria-label="Nagyítás: ' + esc(m.alt) + '">' +
    '<picture><source srcset="' + esc(base) + '.webp" type="image/webp">' +
    '<img src="' + esc(base) + '.jpg" alt="' + esc(m.alt) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async" data-ph-kind="kep"></picture></button></div>' +
    (m.felirat ? '<figcaption class="muted small">' + esc(m.felirat) + '</figcaption>' : '') + '</figure>';
}

// Képhiba esetén helyőrzőre cserélünk (a keret mérete nem változik).
export function bindImageFallbacks(root) {
  root.querySelectorAll('img[data-ph-kind]').forEach((img) => {
    const fail = () => {
      // Ha csak a webp hiányzik, próbáljuk a jpg tartalékot.
      const source = img.parentElement.querySelector('source');
      if (source && !img.dataset.retried) {
        img.dataset.retried = '1';
        source.remove();
        img.addEventListener('error', fail, { once: true });
        img.src = img.getAttribute('src');
        return;
      }
      const frame = img.closest('.media-frame');
      if (!frame || frame.classList.contains('ph')) return;
      if (!DEV) { const fig = frame.closest('figure'); (fig || frame).remove(); return; } // betölthetetlen kép: ne látsszon hibás elem
      const m = media(frame.dataset.mediaId);
      frame.classList.add('ph');
      frame.setAttribute('role', 'img');
      frame.setAttribute('aria-label', 'Kép helyőrző: ' + (m ? m.alt : ''));
      frame.innerHTML = placeholderInner(m, 'kep');
    };
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail, { once: true });
  });
}

export { placeholderInner };

// Kattintásra nagyítás (egyszerű, billentyűzettel is zárható párbeszédablak).
export function initMediaZoom() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-zoom]');
    if (!b) return;
    const img = b.querySelector('img');
    if (!img) return;
    const d = document.createElement('dialog');
    d.className = 'media-lightbox';
    d.setAttribute('aria-label', 'Nagyított kép');
    d.innerHTML = '<button type="button" class="btn btn-ghost media-lightbox-close" aria-label="Bezárás">Bezárás</button>' +
      '<img src="' + esc(img.currentSrc || img.src) + '" alt="' + esc(img.alt) + '">';
    document.body.appendChild(d);
    const close = () => { d.close(); d.remove(); b.focus(); };
    d.addEventListener('click', (ev) => { if (ev.target === d || ev.target.closest('.media-lightbox-close')) close(); });
    d.addEventListener('cancel', (ev) => { ev.preventDefault(); close(); });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    d.querySelector('.media-lightbox-close').focus();
  });
}
