// Effektek: görgetéses megjelenés, kattintási hullám, konfetti lezáráskor.
const COLORS = ['#1d4ed8', '#3b82f6', '#93c5fd', '#f59e0b', '#22c55e', '#a78bfa'];
const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function confetti(x, y) {
  if (reduce()) return;
  const box = document.createElement('div');
  box.className = 'fx-confetti';
  box.style.left = x + 'px'; box.style.top = y + 'px';
  for (let i = 0; i < 46; i++) {
    const p = document.createElement('i');
    const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 220;
    p.style.background = COLORS[i % COLORS.length];
    p.style.setProperty('--dx', Math.cos(a) * d + 'px');
    p.style.setProperty('--dy', Math.sin(a) * d - 60 + 'px');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.animationDelay = Math.random() * .12 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2000);
}

let io = null;
let t0 = 0;
export function fxPage(main) {
  t0 = Date.now();
  if (io) io.disconnect();
  const items = main.querySelectorAll('.ch-sec, .chapter .goals, .chapter .media, .closing .card, .closing .ch-sec, .ch-nav');
  if (reduce() || !('IntersectionObserver' in window)) return;
  io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  main.querySelectorAll('.ch-toc li').forEach((li, i) => li.style.setProperty('--i', i));
  items.forEach((el, i) => {
    el.classList.add('fx-reveal');
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) { el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms'; requestAnimationFrame(() => el.classList.add('fx-in')); }
    else io.observe(el);
  });
}

export function initFx() {
  // hullám minden gombon
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn');
    if (!b || b.disabled || reduce()) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const el = document.createElement('span');
    el.className = 'fx-ripple';
    el.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(el);
    setTimeout(() => el.remove(), 650);
  }, { passive: true });

  // konfetti: fejezet lezárása, modul lezárása, sikeres kvíz
  const main = document.getElementById('main');
  new MutationObserver((muts) => {
    if (Date.now() - t0 < 900) return; // az oldal első kirajzolásakor nincs konfetti
    for (const m of muts) {
      const t = m.target;
      if (m.type === 'attributes' && t.id === 'next-ch' && !t.hidden) {
        const r = t.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2);
      }
      if (m.type === 'childList') {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const c = n.id === 'congrats' ? n : n.querySelector && n.querySelector('#congrats');
          if (c) { const r = c.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + 40); }
        });
      }
    }
  }).observe(main, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden'] });
}
