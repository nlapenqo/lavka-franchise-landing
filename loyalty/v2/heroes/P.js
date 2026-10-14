/* P · Пролёт: позиция скролла → кадр через rAF, скролл не перехватывается.
   Камера стоит в z = 0 и летит вперёд: camZ = прогресс × DEPTH, прогресс = пройдено по секции / --pin (после пина растёт дальше —
   остатки пролёта доигрывают, пока сцена уезжает вверх). Предмет с глубиной z: scale = z / (z − camZ), смещение от точки схода
   (центр текста) умножается на тот же scale. Перед камерой предмет гаснет и подменяется размытой копией (только opacity).
   Левитация: синусоиды со своей фазой и частотой у каждого предмета, фаза = время (очень медленно) + позиция скролла.
   Вход: камера подъезжает из −INTRO к 0 за 1,3 с, когда секции ставят is-live.
   Пауза: нет is-v, секция вне экрана или вкладка в фоне. prefers-reduced-motion: ничего не делает, композиция статична. */
(() => {
  const sec = document.querySelector('.h-p[data-v="P"]');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const stage = sec.querySelector('.h-p__stage'), field = sec.querySelector('.h-p__field'), content = sec.querySelector('.h-p__content');
  const DEPTH = 1, INTRO = .45, INTRO_MS = 1300;
  const FADE = [2.3, 4.2], BLUR = [1.7, 3.1];          // по scale: где начинается и заканчивается гашение и размытие
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const items = [...sec.querySelectorAll('.h-p__item')].map((el, k) => ({
    el, z: +el.dataset.z, sharp: el.querySelector('.h-p__img'), blur: el.querySelector('.h-p__blur'),
    ph: k * 1.93 + .4,                     // фаза
    w: (2 * Math.PI) / (8.2 + k * .9),     // время: период 8–12 с
    q: (2 * Math.PI) / (980 + k * 170),    // скролл: период ~1000–1700 px
    dx: 0, dy: 0, vis: true,
  }));
  let pin = 640, mob = false, cur = null, last = 0, clock = 0, t0 = 0, raf = 0, inView = false, live = sec.classList.contains('is-live');

  function measure() {
    pin = parseFloat(getComputedStyle(sec).getPropertyValue('--pin')) || 640;
    mob = innerWidth < 768;
    const vx = content.offsetLeft + content.offsetWidth / 2, vy = content.offsetTop + content.offsetHeight / 2;
    items.forEach(it => { it.dx = it.el.offsetLeft - vx; it.dy = it.el.offsetTop - vy; });
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(64, now - (last || now)); last = now; clock += dt;   // часы левитации идут только пока сцена активна
    const raw = Math.max(0, -sec.getBoundingClientRect().top);
    /* лёгкое сглаживание к позиции скролла (τ ≈ 80 мс): движение монотонно, без рывков от шага колеса */
    cur = cur === null ? raw : cur + (raw - cur) * (1 - Math.exp(-dt / 80));
    if (Math.abs(raw - cur) < .05) cur = raw;
    const p = cur / pin;
    const intro = live ? easeOut(Math.min(1, (now - t0) / INTRO_MS)) : 0;
    const camZ = p * DEPTH - INTRO * (1 - intro);
    const sec_ = clock / 1000, A = mob ? 4 : 7, R = 2.4;

    items.forEach(it => {
      const rel = it.z - camZ;
      const s = rel > .02 ? it.z / rel : Infinity;
      let o = (1 - ss(FADE[0], FADE[1], s)) * Math.min(1, intro * 1.6);
      if (!(o > .002)) { if (it.vis) { it.el.style.visibility = 'hidden'; it.vis = false; } return; }
      if (!it.vis) { it.el.style.visibility = ''; it.vis = true; }
      /* левитация: время + скролл в одной фазе — плавно в покое и при прокрутке */
      const a = it.ph + sec_ * it.w + cur * it.q;
      const fy = A * Math.sin(a), fx = A * .45 * Math.sin(a * .71 + 1.3), rot = R * Math.sin(a * .83 + it.ph * .5);
      /* при подлёте предмет слегка заваливается наружу — по стороне, где он стоит */
      const roll = Math.max(-9, Math.min(9, (s - 1) * 3.2 * Math.sign(it.dx || 1)));
      const tx = it.dx * (s - 1) + fx * s, ty = it.dy * (s - 1) + fy * s;
      it.el.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${s.toFixed(4)}) rotate(${(rot + roll).toFixed(3)}deg)`;
      it.el.style.opacity = o.toFixed(3);
      const b = ss(BLUR[0], BLUR[1], s);
      it.sharp.style.opacity = (1 - b).toFixed(3); it.blur.style.opacity = b.toFixed(3);
    });
    /* фон: поле чуть приближается, медленнее предметов */
    field.style.transform = `scale(${(1 + Math.min(p, 2.5) * .05).toFixed(4)})`;
    if (active()) raf = requestAnimationFrame(frame);
  }

  const active = () => inView && sec.classList.contains('is-v') && !document.hidden;
  const kick = () => { if (!raf && active()) { last = 0; cur = null; raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; if (inView) { measure(); kick(); } }, { rootMargin: '10% 0px' }).observe(sec);
  new MutationObserver(() => {
    if (!live && sec.classList.contains('is-live')) { live = true; t0 = performance.now(); }
    if (sec.classList.contains('is-v')) { measure(); kick(); }
  }).observe(sec, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', kick);
  addEventListener('resize', () => { measure(); kick(); });
  if (live) t0 = -INTRO_MS;
  measure();
})();
