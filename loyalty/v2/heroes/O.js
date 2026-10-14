/* O · Куча подарков: 2D-физика на Matter.js 0.19.0 (cdnjs, грузится только когда хиро O на экране).
   Карточки подарков и монеты падают сверху и ложатся кучей под кнопками; курсор расталкивает, карточку можно взять и бросить.
   Сенсор и телефон: меньше тел, без перетаскивания. prefers-reduced-motion: куча считается заранее и стоит статично.
   Пауза: секция скрыта (нет is-v), вне экрана или вкладка в фоне; когда всё улеглось — цикл тоже стоит. */
(() => {
  const sec = document.querySelector('.h-o[data-v="O"]');
  if (!sec) return;
  const pile = sec.querySelector('[data-pile]'), content = sec.querySelector('.h-o__content'), actions = sec.querySelector('.hero__actions');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const SRC = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
  const SRI = 'sha512-0z8URjGET6GWnS1xcgiLBZBzoaS8BNlKayfZyQNKz4IRp+s7CKXx0yz7Eco2+TcwoeMBa5KMwmTX7Kus7Fa5Uw==';
  /* подарки и цены 1:1 из GIFTS в v2.js: [id, монеты, фото во весь кадр]; на телефоне берутся первые */
  const GIFTS = [['iphone-air', 1600], ['airpods-max', 1000], ['backpack', 200, 1], ['station-max', 600], ['promo-lavka', 100], ['rover', 300],
    ['yandex-drops', 200], ['tv', 600], ['travelmug', 100], ['iphone-18pro', 2000], ['sportbag', 100], ['station-mini-3', 200],
    ['powerbank', 100], ['promo-travel', 100], ['wine-cabinet', 600], ['promo-afisha', 100]];
  const STEP = 1000 / 60, WALL = 400;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  let M = null, loading = null, st = null, raf = 0, last = 0, acc = 0, inView = false, busy = false;

  function loadMatter() {
    if (window.Matter) return Promise.resolve(window.Matter);
    return loading ||= new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = SRC; s.integrity = SRI; s.crossOrigin = 'anonymous'; s.referrerPolicy = 'no-referrer';
      s.onload = () => window.Matter ? res(window.Matter) : rej(new Error('matter'));
      s.onerror = rej;
      document.head.appendChild(s);
      setTimeout(() => rej(new Error('timeout')), 6000);
    });
  }

  /* размеры — от свободной зоны под кнопками (offset, а не rect: у кнопок ещё идёт fade-up) */
  function plan() {
    const W = sec.clientWidth, H = sec.clientHeight, mobile = W < 768;
    const top = content.offsetTop + actions.offsetTop + actions.offsetHeight + (mobile ? 20 : 32);
    const zone = Math.max(150, H - top);
    const s = mobile ? clamp(zone * .4, 72, 108) : clamp(Math.min(zone * .34, W / 6.2), 112, 196);
    const coins = mobile ? 2 : clamp(Math.round(W / 380), 3, 5);
    const perRow = Math.max(3, Math.floor(W / (s * 1.08)));
    const area = W * zone * (mobile ? .52 : .5) - coins * Math.PI * (s * .23) ** 2;
    /* не больше ≈2 слоёв, чтобы куча не дорастала до кнопок */
    const n = clamp(Math.round(area / (s * s)), mobile ? 3 : 8, Math.min(mobile ? 7 : GIFTS.length, Math.round(perRow * 2.2)));
    return { W, H, top, s, coins, perRow, n, mobile };
  }

  /* очередь появления: слои «кирпичом», внутри слоя слоты перемешаны; монеты — между карточками */
  function makeItems(p) {
    const R = rng(p.mobile ? 5 : 11), items = [];
    let slots = [];
    for (let k = 0; k < p.n; k++) {
      const layer = Math.floor(k / p.perRow);
      if (k % p.perRow === 0) { slots = [...Array(p.perRow).keys()]; for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; } }
      const w = Math.round(p.s * (.88 + R() * .24)), cell = p.W / p.perRow;
      const x = clamp((slots[k % p.perRow] + .5 + (layer % 2) * .5) % p.perRow * cell + (R() - .5) * cell * .3, w * .6, p.W - w * .6);
      const [id, price, cover] = GIFTS[k];
      items.push({ kind: 'card', id, price, cover, w, x, y: -w * .75 - R() * 40, a: (R() - .5) * .56, av: (R() - .5) * .016, t: k * 80 + layer * 200 });
    }
    for (let j = 0; j < p.coins; j++) {
      const w = Math.round(p.s * (.42 + R() * .12)), after = items[Math.min(items.length - 1, Math.floor((j + 1) * p.n / (p.coins + 1)))];
      items.push({ kind: 'coin', w, x: clamp(p.W * (.1 + R() * .8), w, p.W - w), y: -w, a: 0, av: (R() - .5) * .1, t: after.t + 45 });
    }
    return items.sort((a, b) => a.t - b.t);
  }

  function makeEl(it) {
    const el = document.createElement('div');
    el.style.width = el.style.height = it.w + 'px';
    if (it.kind === 'coin') { el.className = 'h-o__b h-o__coin'; el.innerHTML = '<svg aria-hidden="true"><use href="#coin"/></svg>'; }
    else {
      el.className = 'h-o__b h-o__card' + (it.cover ? ' is-cover' : '');
      el.style.setProperty('--s', it.w + 'px');
      el.innerHTML = `<img src="../assets/gifts/${it.id}.webp" alt="" draggable="false" decoding="async"><span class="h-o__price"><svg aria-hidden="true"><use href="#coin"/></svg>${it.price}</span>`;
    }
    pile.appendChild(el);
    return el;
  }

  const place = (it, x, y, a) => { it.el.style.transform = `translate3d(${(x - it.w / 2).toFixed(1)}px,${(y - it.w / 2).toFixed(1)}px,0) rotate(${a.toFixed(4)}rad)`; };

  /* мир Matter: пол и стены за краями секции */
  function world(p) {
    const engine = M.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
    engine.gravity.scale = .0015;
    const opt = { isStatic: true, friction: .8, restitution: 0 };
    const walls = {
      floor: M.Bodies.rectangle(p.W / 2, p.H + WALL / 2, p.W * 4, WALL, opt),
      left: M.Bodies.rectangle(-WALL / 2, -p.H, WALL, p.H * 6, opt),
      right: M.Bodies.rectangle(p.W + WALL / 2, -p.H, WALL, p.H * 6, opt),
    };
    M.Composite.add(engine.world, Object.values(walls));
    return { engine, walls };
  }

  function spawn(it) {
    const o = { friction: .55, frictionStatic: 1, frictionAir: .014, restitution: .02, density: .0016, slop: .03 };
    it.body = it.kind === 'coin'
      ? M.Bodies.circle(it.x, it.y, it.w / 2, { ...o, friction: .4, frictionAir: .03, restitution: .08 })
      : M.Bodies.rectangle(it.x, it.y, it.w, it.w, { ...o, chamfer: { radius: it.w * .2 } });
    it.body.hr = it.kind === 'coin' ? it.w / 2 : it.w * .58;
    /* карточкам — в шесть раз больше инерции вращения: от ударов меньше кувыркаются и ложатся почти ровно, картинкой вверх */
    if (it.kind === 'card') M.Body.setInertia(it.body, it.body.inertia * 6);
    M.Body.setAngle(it.body, it.a);
    M.Body.setAngularVelocity(it.body, it.av);
    M.Body.setVelocity(it.body, { x: 0, y: 2 });
    M.Composite.add(st.engine.world, it.body);
    st.bodies.push(it.body); st.byEl.set(it.el, it.body);
  }

  function step() {
    st.t += STEP;
    while (st.q.length && st.q[0].t <= st.t) spawn(st.q.shift());
    M.Engine.update(st.engine, STEP);
  }
  function render() { for (const it of st.items) if (it.body) place(it, it.body.position.x, it.body.position.y, it.body.angle); }
  const calm = () => st.bodies.every(b => b.isSleeping || (b.speed < .06 && b.angularSpeed < .002));
  const wakeAll = () => st.bodies.forEach(b => M.Sleeping.set(b, false));

  function frame(now) {
    raf = 0;
    if (!st || !st.live || !shown()) return;
    acc += Math.min(now - last, 100); last = now;
    let n = 0;
    while (acc >= STEP && n < 4) { step(); acc -= STEP; n++; }
    if (n === 4) acc = 0;
    render();
    st.still = !st.q.length && !st.drag && calm() ? st.still + 1 : 0;
    if (st.still > 40) return; /* всё улеглось — цикл стоит до следующего движения курсора */
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && st && st.live && !st.frozen && shown()) { last = performance.now(); acc = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* запасной вариант без Matter (CDN недоступен): статичная кладка рядами от пола */
  function staticPile(p) {
    const R = rng(3), cards = st.items.filter(i => i.kind === 'card'), coins = st.items.filter(i => i.kind === 'coin');
    const cell = p.W / p.perRow;
    cards.forEach((it, k) => {
      const row = Math.floor(k / p.perRow), col = k % p.perRow;
      const x = clamp((col + .5 + (row % 2) * .5) * cell, it.w / 2, p.W - it.w / 2), y = p.H - p.s * .5 - row * p.s * .82 - (R() * 6);
      place(it, x, y, (R() - .5) * .22);
    });
    coins.forEach((it, j) => place(it, p.W * (j + 1) / (coins.length + 1), p.H - it.w / 2 - 2, 0));
  }

  async function init() {
    if (busy) return; busy = true;
    const p = plan(), items = makeItems(p);
    pile.textContent = '';
    items.forEach(it => { it.el = makeEl(it); place(it, it.x, it.y, it.a); });
    st = { p, items, q: items.slice(), bodies: [], byEl: new Map(), t: 0, still: 0, live: false, frozen: reduced, drag: null };
    const imgs = [...pile.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(() => {}) : null);
    const ready = Promise.race([Promise.all(imgs), new Promise(r => setTimeout(r, 1500))]);
    try {
      M = await loadMatter();
      await ready;
      Object.assign(st, world(p));
      if (st.frozen) {
        /* reduced motion: считаем падение заранее и показываем итог одним кадром */
        for (let i = 0; i < 1500 && (st.q.length || i < 120 || !calm()); i++) step();
        render();
      } else {
        st.live = true;
        sec.classList.toggle('is-grab', fine);
        kick();
      }
    } catch (e) {
      st.frozen = true;
      staticPile(p);
    }
    busy = false;
  }

  const shown = () => inView && !document.hidden && sec.classList.contains('is-live') && (sec.classList.contains('is-v') || document.body.classList.contains('is-all'));
  function check() {
    if (!shown()) { stop(); return; }
    if (!st) init(); else kick();
  }
  new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; check(); }).observe(sec);
  new MutationObserver(check).observe(sec, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', check);

  /* размер секции поменялся: двигаем пол и стены; сменился телефон ↔ десктоп — собираем кучу заново */
  let rsT = 0;
  new ResizeObserver(() => {
    if (!st || busy || !sec.clientWidth) return;
    clearTimeout(rsT);
    rsT = setTimeout(() => {
      const p = plan();
      if (p.mobile !== st.p.mobile || !st.engine || (st.frozen && (p.W !== st.p.W || p.H !== st.p.H))) { stop(); init(); return; }
      if (p.W === st.p.W && p.H === st.p.H) return;
      const { floor, left, right } = st.walls;
      M.Body.setPosition(floor, { x: p.W / 2, y: p.H + WALL / 2 });
      M.Body.setPosition(left, { x: -WALL / 2, y: -p.H });
      M.Body.setPosition(right, { x: p.W + WALL / 2, y: -p.H });
      st.bodies.forEach(b => { if (b.position.x > p.W - b.hr * .8) M.Body.setPosition(b, { x: p.W - b.hr, y: b.position.y - 20 }); });
      st.p = p; wakeAll(); kick();
    }, 120);
  }).observe(sec);

  /* мышь: курсор расталкивает, карточку можно взять и бросить */
  if (!fine || reduced) return;
  let px = 0, py = 0, pt = -1e9;
  const local = e => { const r = sec.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  sec.addEventListener('pointermove', e => {
    if (!st || !st.live || e.pointerType !== 'mouse') return;
    const { x, y } = local(e), dt = e.timeStamp - pt;
    const vx = (x - px) / Math.max(8, dt) * STEP, vy = (y - py) / Math.max(8, dt) * STEP;
    px = x; py = y; pt = e.timeStamp;
    if (st.drag) { st.drag.pointA.x = x; st.drag.pointA.y = y; M.Sleeping.set(st.drag.bodyB, false); kick(); return; }
    if (dt > 120 || y < st.p.top - st.p.s * 1.5) return;
    const sp = Math.hypot(vx, vy);
    if (sp < .4) return;
    let hit = false;
    for (const b of st.bodies) {
      const dx = b.position.x - x, dy = b.position.y - y, d = Math.hypot(dx, dy) || 1, R = b.hr + 40;
      if (d > R) continue;
      const k = (1 - d / R) * Math.min(sp, 22) * .34;
      const nx = dx / d * .55 + vx / sp * .45, ny = dy / d * .55 + vy / sp * .45;
      M.Body.setVelocity(b, { x: b.velocity.x + nx * k, y: b.velocity.y + ny * k - k * .2 });
      M.Body.setAngularVelocity(b, clamp(b.angularVelocity + nx * k * .003 * Math.sign(-dy || 1), -.2, .2));
      hit = true;
    }
    if (hit) { wakeAll(); kick(); }
  });
  sec.addEventListener('pointerdown', e => {
    if (!st || !st.live || e.button !== 0 || e.pointerType !== 'mouse') return;
    const el = e.target.closest('.h-o__b'), b = el && st.byEl.get(el);
    if (!b) return;
    e.preventDefault();
    const { x, y } = local(e);
    px = x; py = y; pt = e.timeStamp;
    wakeAll();
    st.drag = M.Constraint.create({ pointA: { x, y }, bodyB: b, pointB: { x: x - b.position.x, y: y - b.position.y }, length: 0, stiffness: .2, damping: .1 });
    M.Composite.add(st.engine.world, st.drag);
    st.held = el; el.classList.add('is-held'); sec.classList.add('is-dragging');
    sec.setPointerCapture(e.pointerId);
    kick();
  });
  const drop = () => {
    if (!st || !st.drag) return;
    const b = st.drag.bodyB, v = b.velocity, sp = Math.hypot(v.x, v.y);
    M.Composite.remove(st.engine.world, st.drag);
    if (sp > 38) M.Body.setVelocity(b, { x: v.x / sp * 38, y: v.y / sp * 38 });
    st.drag = null; st.held.classList.remove('is-held'); sec.classList.remove('is-dragging');
    wakeAll(); kick();
  };
  sec.addEventListener('pointerup', drop);
  sec.addEventListener('pointercancel', drop);
  sec.addEventListener('lostpointercapture', drop);
})();
