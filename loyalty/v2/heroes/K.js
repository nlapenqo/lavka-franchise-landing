/* K — Обменник: стопка монет растёт до цены выбранного подарка (одна монета в стопке = 100), подарок едет на её вершине, цена — рядом.
   Все три движутся от одного значения L (высота стопки в монетах), поэтому всегда совпадают. Цены — из каталога GIFTS (v2.js).
   Без выбора — демо-переключение раз в 3,6 с (пауза под курсором); после выбора пользователем демо выключается.
   Пауза, когда вариант скрыт или секция вне экрана. */
(() => {
  const sec = document.querySelector('.h-k'); if (!sec) return;
  const $ = s => sec.querySelector(s), $$ = s => [...sec.querySelectorAll(s)];
  const stage = $('.h-k__stage'), stackEl = $('[data-stack]'), rider = $('[data-rider]'), level = $('[data-level]');
  const priceEl = $('[data-price]'), nameEl = $('[data-name]'), row = $('.h-k__chips'), ex = $('.h-k__ex');
  const chips = $$('.h-k__chip'), imgs = $$('.h-k__gift img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const UNIT = 100, MAX = Math.max(...chips.map(c => c.dataset.price / UNIT)), DEMO = 3600;
  const CROWN = document.querySelector('#crown path').getAttribute('d');
  let cur = Math.max(0, chips.findIndex(c => c.getAttribute('aria-pressed') === 'true'));
  let geo = null, L = chips[cur].dataset.price / UNIT, from = L, to = L, t0 = 0, dur = 0, raf = 0, front = 0;
  let demo = !reduce, timer = 0, inView = false, hover = false, started = false;

  /* стопка в стиле tower() из v2.js; ребро — сплошной цилиндр с линиями стыков, верх срезает clipPath на уровне L */
  function build() {
    const vw = innerWidth, [w, t] = vw < 768 ? [100, 6] : vw < 1200 ? [124, 10] : vw < 1800 ? [156, 12] : [180, 14];
    if (geo && geo.w === w && geo.t === t) return;
    const rx = w / 2, ry = Math.round(rx * .314), cx = rx + 6, W = w + 12, H = ry * 2 + MAX * t + 18, base = H - 10 - ry;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>
      <linearGradient id="hk-edge" x1="0" x2="1"><stop offset="0" stop-color="#1f4f86"/><stop offset=".38" stop-color="#3e88c5"/><stop offset=".6" stop-color="#5aa3dd"/><stop offset="1" stop-color="#285f97"/></linearGradient>
      <radialGradient id="hk-shadow"><stop offset="0" stop-color="#061630" stop-opacity=".45"/><stop offset="1" stop-color="#061630" stop-opacity="0"/></radialGradient>
      <clipPath id="hk-clip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>
      <ellipse cx="${cx}" cy="${base + 4}" rx="${rx * 1.12}" ry="${ry * 1.15}" fill="url(#hk-shadow)"/><g clip-path="url(#hk-clip)">`;
    for (let k = 0; k < MAX; k++) {
      const y = base - t - k * t;
      s += `<path d="M${cx - rx} ${y}V${y + t}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + t}V${y}Z" fill="url(#hk-edge)"/>`;
      s += `<path d="M${cx - rx} ${y + t}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + t}" fill="none" stroke="#1b3a6a" stroke-opacity=".35"/>`;
    }
    s += `</g><g><ellipse cx="${cx}" cy="0" rx="${rx}" ry="${ry}" fill="#4b93cf"/><ellipse cx="${cx}" cy="0" rx="${rx * .8}" ry="${ry * .8}" fill="#aad9fc" stroke="#3e88c5" stroke-width="1.2"/><path d="${CROWN}" fill="#3e88c5" transform="translate(${cx} 0) scale(${rx * .075} ${rx * .075 * ry / rx}) translate(-13.92 -14.06)"/></g></svg>`;
    stackEl.innerHTML = s;
    const svg = stackEl.firstChild;
    geo = { w, t, H, base, clip: svg.querySelector('clipPath rect'), cap: svg.lastChild };
    [['sw', W], ['cx', cx], ['ry', ry], ['b0', H - base]].forEach(([k, v]) => stage.style.setProperty('--' + k, v));
    draw();
  }
  function draw() {
    if (!geo) return;
    const yc = geo.base - L * geo.t, dy = `translate3d(0,${(-L * geo.t).toFixed(1)}px,0)`;
    geo.clip.setAttribute('y', yc.toFixed(2)); geo.clip.setAttribute('height', (geo.H - yc).toFixed(2));
    geo.cap.setAttribute('transform', `translate(0 ${yc.toFixed(2)})`);
    rider.style.transform = dy; level.style.transform = dy;
    priceEl.textContent = Math.round(L) * UNIT;
  }

  /* перестройка: мягкое замедление без отскока, 0,7–1,4 с в зависимости от разницы */
  const ease = x => 1 - Math.pow(1 - x, 3);
  function tweenTo(n) {
    from = L; to = n; t0 = performance.now(); dur = reduce ? 0 : Math.min(1400, 700 + Math.abs(n - from) * 45);
    if (!dur) { L = n; draw(); return; }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step(now) {
    const p = Math.min(1, (now - t0) / dur);
    L = from + (to - from) * ease(p); draw();
    raf = p < 1 ? requestAnimationFrame(step) : 0;
  }

  function select(i, user) {
    if (user) { demo = false; clearTimeout(timer); timer = 0; }
    if (i === cur) return;
    cur = i; const c = chips[i], src = c.querySelector('img').getAttribute('src');
    chips.forEach((x, k) => x.setAttribute('aria-pressed', String(k === i)));
    const nx = 1 - front; imgs[nx].src = src; imgs[nx].classList.add('is-on'); imgs[front].classList.remove('is-on'); front = nx;
    nameEl.textContent = c.textContent.trim();
    tweenTo(c.dataset.price / UNIT);
    /* на телефоне чипы в одну прокручиваемую строку: демо подкручивает выбранный в середину строки */
    if (!user && row.scrollWidth > row.clientWidth + 2) row.scrollTo({ left: c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  }
  row.addEventListener('click', e => { const c = e.target.closest('.h-k__chip'); if (c) select(chips.indexOf(c), true); });
  ['pointerdown', 'wheel', 'touchstart'].forEach(ev => row.addEventListener(ev, () => { demo = false; clearTimeout(timer); timer = 0; }, { passive: true }));
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    ex.addEventListener('pointerenter', () => { hover = true; sync(); });
    ex.addEventListener('pointerleave', () => { hover = false; sync(); });
  }

  /* запуск, демо и пауза */
  const shown = () => sec.classList.contains('is-v') || document.body.classList.contains('is-all');
  const running = () => inView && shown() && !document.hidden;
  function next() { timer = 0; if (demo && running() && !hover) select((cur + 1) % chips.length, false); sync(); }
  function sync() {
    const r = running();
    if (sec.classList.contains('is-run') !== r) sec.classList.toggle('is-run', r);
    if (r && !started && sec.classList.contains('is-live')) {
      started = true;
      if (!reduce) { const n = L; L = 1; draw(); setTimeout(() => tweenTo(n), 700); }
    }
    if (r && demo && started && !hover) { if (!timer) timer = setTimeout(next, DEMO + (raf ? dur : 0)); }
    else if (timer) { clearTimeout(timer); timer = 0; }
  }
  new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; sync(); }).observe(sec);
  const mo = new MutationObserver(sync);
  mo.observe(sec, { attributes: true, attributeFilter: ['class'] });
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
  addEventListener('resize', build);
  build(); sync();
})();
