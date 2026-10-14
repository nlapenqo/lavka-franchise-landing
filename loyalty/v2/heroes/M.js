/* M — Кольцо подарков: геометрия под экран, медленное вращение, перетаскивание и колесо с инерцией,
   прозрачность граней по глубине, пауза вне экрана и в скрытом варианте. Без глобальных переменных. */
(() => {
  const sec = document.querySelector('.h-m'); if (!sec) return;
  const ring = sec.querySelector('[data-ring]'), copy = sec.querySelector('.h-m__copy');
  const RAD = Math.PI / 180, BASE = 6; /* °/с: оборот за минуту */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const slots = [...ring.children].map(el => ({ el, k: +el.style.getPropertyValue('--k'), km: +el.style.getPropertyValue('--km'), desk: el.classList.contains('is-desk'), f: el.children[0], b: el.children[1], of: -1, ob: -1, vb: -1 }));
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  let mob = false, n = 12, R = 540, pxPerDeg = 10, shift = 0, a = 0, v = 0, last = 0, raf = 0, seen = false, drag = null, intro = false;

  /* геометрия: кольцо вокруг текста — спереди карточки проходят под кнопками, сзади уходят за заголовок.
     На телефоне кольцо — отдельная сцена под текстом */
  function layout() {
    const W = sec.clientWidth, H = sec.clientHeight; if (!W || !H) return;
    mob = W < 768; n = mob ? 8 : 12;
    const t = mob ? 20 : 24, st = Math.sin(t * RAD), ct = Math.cos(t * RAD);
    let cw, ch, P, yc, sf, Yf = 0, hf = 0;
    if (mob) {
      shift = 0;
      R = Math.min(W * .36, 168); cw = Math.min(W * .2, 96); ch = cw * 1.22; P = Math.max(1100, R * 7);
      sf = P / (P - R * ct); const sb = P / (P + R * ct);
      const up = R * st * sb + ch / 2 * ct * sb, down = R * st * sf + ch / 2 * ct * sf;
      yc = up + 14;
      sec.style.setProperty('--sh', Math.round(up + down + 30) + 'px');
    } else {
      const cBot = copy.getBoundingClientRect().bottom - sec.getBoundingClientRect().top - shift;
      let k = 1;
      for (let i = 0; i < 16; i++) {
        R = clamp(W * .38, 300, 800) * k; cw = clamp(W * .117, 110, 206) * k; ch = cw * 1.22; P = Math.max(2000, R * 4.2);
        sf = P / (P - R * ct); Yf = R * st * sf; hf = ch / 2 * ct * sf; const sb = P / (P + R * ct), Yb = R * st * sb, hb = ch / 2 * ct * sb;
        /* передние карточки — у нижнего края (на высоком экране — не дальше 170 px от кнопок), их верх — ниже кнопок;
           задние — ниже шапки */
        yc = Math.min(H - 32 - Yf - hf, cBot + 170 - Yf + hf);
        if (yc + Yf - hf >= cBot + 22 && yc - Yb - hb >= 100) break;
        k *= .94;
      }
      /* высокий экран (планшет стоя): текст и кольцо вместе опускаются к середине */
      const spare = H - 40 - (yc + Yf + hf);
      shift = spare > 40 ? Math.round(spare / 2) : 0; yc += shift;
    }
    sec.style.setProperty('--shift', shift + 'px');
    pxPerDeg = R * sf * RAD;
    const s = sec.style;
    s.setProperty('--n', n); s.setProperty('--R', R.toFixed(1) + 'px'); s.setProperty('--cw', cw.toFixed(1) + 'px'); s.setProperty('--ch', ch.toFixed(1) + 'px');
    s.setProperty('--P', Math.round(P) + 'px'); s.setProperty('--yc', yc.toFixed(1) + 'px'); s.setProperty('--tilt', -t + 'deg');
    paint();
  }

  /* глубина — тёмно-синим «туманом» поверх сплошной белой карточки: лицо чистое спереди и темнеет к бокам,
     оборот с монетой темнеет к дальней точке, а прямо за заголовком растворяется в поле — тексту ничего не мешает */
  function paint() {
    ring.style.transform = `rotateY(${a.toFixed(2)}deg)`;
    for (const s of slots) {
      if (mob && s.desk) continue;
      const d = Math.cos(((mob ? s.km : s.k) * 360 / n + a) * RAD);
      const of = d > -.3 ? .5 * (1 - smooth(-.25, .85, d)) : 1, ob = d < .3 ? .1 + .62 * smooth(-.3, -.75, d) : 1, vb = smooth(-.94, -.62, d);
      if (Math.abs(of - s.of) > .006) { s.f.style.setProperty('--fog', of.toFixed(3)); s.of = of; }
      if (Math.abs(ob - s.ob) > .006) { s.b.style.setProperty('--fog', ob.toFixed(3)); s.ob = ob; }
      if (Math.abs(vb - s.vb) > .006) { s.b.style.opacity = vb.toFixed(3); s.vb = vb; }
    }
  }

  const still = () => (reduce.matches || !intro) && !drag;
  function frame(ts) {
    raf = 0;
    const dt = last ? Math.min(.05, (ts - last) / 1000) : 0; last = ts;
    if (!drag) {
      if (reduce.matches) v = 0;
      else if (intro) { v += (BASE - v) * (1 - Math.exp(-dt / .9)); a += v * dt; }
    }
    a %= 360;
    paint();
    if (seen && !document.hidden && !still()) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && seen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* появление: кольцо въезжает с разгоном и мягко сбавляет до 6 °/с, без отскока */
  function start() {
    if (intro || !sec.classList.contains('is-live')) return;
    intro = true; if (!reduce.matches) { a = -70; v = 52; }
    kick();
  }
  new MutationObserver(start).observe(sec, { attributes: true, attributeFilter: ['class'] });

  /* перетаскивание: мышью в любом месте хиро, кроме текста; пальцем — только по горизонтали (pan-y) */
  sec.addEventListener('pointerdown', e => {
    if (e.button !== 0 || copy.contains(e.target)) return;
    drag = { id: e.pointerId, x: e.clientX, t: performance.now(), w: 0 };
    try { sec.setPointerCapture(e.pointerId); } catch (_) {} sec.classList.add('is-drag'); v = 0; kick();
  });
  sec.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const now = performance.now(), da = (e.clientX - drag.x) / pxPerDeg, dts = Math.max(8, now - drag.t) / 1000;
    a += da; drag.w = .75 * (da / dts) + .25 * drag.w; drag.x = e.clientX; drag.t = now;
    if (reduce.matches) paint();
  });
  const release = e => {
    if (!drag || e.pointerId !== drag.id) return;
    v = reduce.matches || performance.now() - drag.t > 90 ? 0 : clamp(drag.w, -240, 240);
    drag = null; sec.classList.remove('is-drag'); kick();
  };
  sec.addEventListener('pointerup', release); sec.addEventListener('pointercancel', release);

  /* колесо: горизонтальный жест крутит кольцо (и не листает историю), вертикальный — подкручивает, страница при этом прокручивается */
  sec.addEventListener('wheel', e => {
    const dx = e.deltaX, dy = e.deltaY, side = Math.abs(dx) > Math.abs(dy);
    if (side) e.preventDefault();
    if (reduce.matches) { if (side) { a -= dx / pxPerDeg; paint(); } return; }
    v = clamp(v + (side ? -dx * .3 : dy * .08), -260, 260); kick();
  }, { passive: false });

  /* пауза: вне экрана, в скрытом варианте (display:none — тоже не пересекается), во фоновой вкладке */
  new IntersectionObserver(es => es.forEach(e => { seen = e.isIntersecting; seen ? kick() : stop(); })).observe(sec);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : kick());
  const ro = new ResizeObserver(layout); ro.observe(sec); ro.observe(copy);
  reduce.addEventListener('change', () => { v = 0; kick(); });
  if (document.fonts) document.fonts.ready.then(layout);
  layout(); start();
})();
