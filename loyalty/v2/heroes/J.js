/* J — Монета на орбите: геометрия сцены по её размеру, карточки по эллипсу (глубина — масштаб и z-index),
   монета слегка наклоняется за курсором. Пауза, когда вариант скрыт или секция вне экрана. */
(() => {
  const sec = document.querySelector('.h-j'); if (!sec) return;
  const scene = sec.querySelector('.h-j__scene'), tilt = sec.querySelector('.h-j__tilt');
  const all = [...sec.querySelectorAll('.h-j__sat')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 767px)');
  const REV = 96000; /* мс на полный оборот: карточка проходит ≈ 25–35 px/с */
  let sats = [], g = null, phase = .38, raf = 0, last = 0, inView = false;

  function measure() {
    const W = scene.clientWidth, H = scene.clientHeight; if (!W || !H) return;
    const m = phone.matches;
    const d = Math.round(Math.min(H * (m ? .54 : .72), W * (m ? .5 : .27), 440));
    const s = Math.round(d * (m ? .5 : .46));
    const rx = Math.round(Math.min(W / 2 - s / 2 - (m ? 4 : 24), d * (m ? 1.7 : 1.85)));
    const cy = Math.round(H * (m ? .5 : .46));
    const ry = Math.round(Math.max(24, Math.min(rx * (m ? .3 : .2), H - cy - s / 2 - 10)));
    g = { cx: Math.round(W / 2), cy, d, s, rx, ry };
    for (const k in g) scene.style.setProperty('--' + k, g[k]);
    sats = all.filter(el => getComputedStyle(el).display !== 'none').map((el, i, a) => ({ el, a: i / a.length * Math.PI * 2, front: null }));
    place();
  }
  function place() {
    if (!g) return;
    for (const s of sats) {
      const th = s.a + phase, sn = Math.sin(th);
      const x = g.cx + g.rx * Math.cos(th), y = g.cy + g.ry * sn, sc = .58 + .42 * (sn + 1) / 2;
      s.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) scale(${sc.toFixed(3)})`;
      const f = sn > 0; if (f !== s.front) { s.front = f; s.el.classList.toggle('is-front', f); }
    }
  }

  const shown = () => sec.classList.contains('is-v') || document.body.classList.contains('is-all');
  const running = () => !reduce && inView && shown() && !document.hidden;
  function tick(now) {
    raf = 0;
    if (!running()) return sync();
    phase += Math.min(now - last, 64) / REV * Math.PI * 2; last = now;
    place();
    raf = requestAnimationFrame(tick);
  }
  function sync() {
    const r = running();
    if (sec.classList.contains('is-run') !== r) sec.classList.toggle('is-run', r);
    if (r && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  new ResizeObserver(measure).observe(scene);
  new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; sync(); }).observe(sec);
  const mo = new MutationObserver(sync);
  mo.observe(sec, { attributes: true, attributeFilter: ['class'] });
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  phone.addEventListener('change', measure);
  measure();

  /* наклон монеты за курсором: до ±8° по горизонтали и ±5° по вертикали, сглаживает transition в CSS */
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    sec.addEventListener('pointermove', e => {
      const r = sec.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      tilt.style.setProperty('--ty', (px * 16).toFixed(2) + 'deg');
      tilt.style.setProperty('--tx', (-py * 10).toFixed(2) + 'deg');
    });
    sec.addEventListener('pointerleave', () => { tilt.style.setProperty('--ty', '0deg'); tilt.style.setProperty('--tx', '0deg'); });
  }
})();
