/* Магазин подарков v2: каталог, корзина «Ваш заказ:», форма заказа, табы, варианты блоков */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const coin = c => `<svg class="${c || ''}" aria-hidden="true"><use href="#coin"/></svg>`;
  const icon = n => `<svg aria-hidden="true"><use href="#${n}"/></svg>`;
  const nb = s => s.replace(/(^|\s)([а-яё]{1,2})\s/gi, '$1$2 ').replace(/Яндекс /g, 'Яндекс ');

  /* каталог 1:1 со старой страницы (gifts-data) */
  const S = ['42-44', '46-48', '50-52', '54-56'];
  const GIFTS = [
    ['velvet-shirt', 'Рубашка вельвет', 'merch', 200, S, 1], ['fleece-jacket', 'Флисовая кофта', 'merch', 200, S, 1],
    ['waffle-longsleeve', 'Лонгслив из вафельного трикотажа', 'merch', 100, S, 1], ['oversize-tshirt', 'Футболка oversize', 'merch', 100, S, 1],
    ['backpack', 'Рюкзак', 'merch', 200, null, 1], ['travelmug', 'Термостакан', 'merch', 100], ['powerbank', 'Пауэрбанк', 'merch', 100], ['sportbag', 'Сумка', 'merch', 100],
    ['rover', 'Ровер на радиоуправлении', 'tech', 300], ['station-max', 'Яндекс Станция Макс с Алисой', 'tech', 600], ['station-mini-3', 'Умная колонка Яндекс Станция Мини 3', 'tech', 200],
    ['wine-cabinet', 'Винный шкаф', 'tech', 600], ['iphone-air', 'iPhone Air', 'tech', 1600], ['iphone-duo', 'iPhone Duo', 'tech', 3000], ['iphone-18pro', 'iPhone 18 Pro Max', 'tech', 2000],
    ['tv', 'Телевизор', 'tech', 600], ['airpods-max', 'AirPods Max', 'tech', 1000], ['yandex-drops', 'Наушники Яндекс Дропс', 'tech', 200],
    ['promo-lavka', 'Промокод Яндекс Лавка', 'promocode', 100], ['promo-afisha', 'Промокод Яндекс Афиша', 'promocode', 100], ['promo-travel', 'Промокод Яндекс Путешествия', 'promocode', 100],
  ].map(([id, title, cat, price, sizes, cover]) => ({ id, title: nb(title), cat, price, sizes: sizes || [], cover: !!cover, img: `../assets/gifts/${id}.webp` }));
  const byId = Object.fromEntries(GIFTS.map(g => [g.id, g]));
  const CATS = { all: 'Все', merch: 'Мерч', promocode: 'Промокоды', tech: 'Техника' };
  const sizeOf = {};

  /* ---------- корзина ---------- */
  const cart = [];
  const key = (id, size) => size ? id + '__' + size : id;
  const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const qtyOf = (id, size) => (cart.find(i => i.key === key(id, size)) || {}).qty || 0;
  function add(id, size) {
    const k = key(id, size), it = cart.find(i => i.key === k);
    if (it) it.qty++; else { const g = byId[id]; cart.push({ key: k, id, size, title: g.title, price: g.price, img: g.img, cover: g.cover, cat: g.cat, qty: 1 }); }
    update(true);
  }
  function step(k, d) { const it = cart.find(i => i.key === k); if (!it) return; it.qty += d; if (it.qty <= 0) cart.splice(cart.indexOf(it), 1); update(); }
  function removeItem(k) { const i = cart.findIndex(x => x.key === k); if (i > -1) cart.splice(i, 1); update(); }

  function update(bump) {
    $$('[data-cart-count]').forEach(n => n.textContent = count());
    $$('[data-cart-total]').forEach(n => n.textContent = total());
    $('[data-cart-sum]').hidden = !count(); $('.v2-cartbtn').classList.toggle('has-sum', !!count());
    if (bump) { const b = $('.v2-cartbtn'); b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); }
    $$('[data-card]').forEach(renderAct);
    $('[data-cart-list]').innerHTML = cart.map(i => `
      <article class="ci${i.cover ? ' is-cover' : ''}" data-key="${i.key}">
        <img src="${i.img}" alt="">
        <div class="ci__t"><b>${i.title}</b>${i.size ? `<small>Размер ${i.size.replace('-', '–')}</small>` : ''}</div>
        <div class="ci__q"><button type="button" data-ci="-1" aria-label="Уменьшить количество">${icon('minus')}</button><b>${i.qty}</b><button type="button" data-ci="1" aria-label="Увеличить количество">${icon('plus')}</button></div>
        <span class="ci__sum">${coin()}${i.price * i.qty}</span>
        <button class="ci__rm" type="button" data-ci="rm" aria-label="Удалить товар">${icon('trash')}</button>
      </article>`).join('');
    const empty = !cart.length;
    $('[data-cart]').classList.toggle('is-empty', empty);
    $('[data-cart-empty]').hidden = !empty;
    $('[data-cart-foot]').hidden = empty;
    $('[data-cart-bar]').hidden = empty || cartV !== 'C';
  }
  $('[data-cart-list]').addEventListener('click', e => {
    const b = e.target.closest('[data-ci]'); if (!b) return;
    const k = b.closest('[data-key]').dataset.key;
    b.dataset.ci === 'rm' ? removeItem(k) : step(k, +b.dataset.ci);
  });

  /* открытие и закрытие оверлея */
  const root = $('[data-cart-root]');
  let lastFocus;
  function openCart() { lastFocus = document.activeElement; root.hidden = false; document.documentElement.style.overflow = 'hidden'; $('.cart__x').focus(); }
  function closeCart() { root.hidden = true; document.documentElement.style.overflow = ''; lastFocus && lastFocus.focus(); }
  $$('[data-cart-open]').forEach(b => b.addEventListener('click', openCart));
  $$('[data-cart-close]').forEach(b => b.addEventListener('click', closeCart));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden) closeCart(); });

  /* форма заказа: поля как в Яндекс Форме 13865974; отправку подключают разработчики */
  const form = $('[data-order-form]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('input,select', form).forEach(f => {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
      (f.closest('.field') || f.closest('.consent')).classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    if (!ok) return;
    /* состав заказа для поля формы — тем же текстом, что на старой странице */
    form.dataset.order = cart.map(i => `${i.title.replace(/ /g, ' ')}${i.size ? ', размер ' + i.size : ''}, количество ${i.qty}, сумма ${i.price * i.qty}`).concat(`Итого: ${total()}`).join('\n');
    cart.length = 0; form.reset(); update(); closeCart();
  });

  /* ---------- карточки ---------- */
  function renderAct(card) {
    const g = byId[card.dataset.card], size = g.sizes.length ? (sizeOf[g.id] || null) : null, q = size || !g.sizes.length ? qtyOf(g.id, size) : 0;
    card.classList.toggle('is-in', cart.some(i => i.id === g.id));
    const act = $('[data-act]', card);
    const html = q
      ? `<div class="gc__qty"><button type="button" data-q="-1" aria-label="Уменьшить количество">${icon('minus')}</button><b>${q}</b><button type="button" data-q="1" aria-label="Увеличить количество">${icon('plus')}</button></div>`
      : `<button class="gc__add" type="button" data-add aria-label="Добавить ${g.title.replace(/ /g, ' ')}">Добавить</button>`;
    if (act.dataset.state !== (q ? 'q' + q : 'add')) { act.innerHTML = html; act.dataset.state = q ? 'q' + q : 'add'; }
  }
  const card = (g, cls = '') => `
    <article class="gc${g.cover ? ' is-cover' : ''}${cls}" data-card="${g.id}">
      <div class="gc__media"><img src="${g.img}" alt="${g.title}" loading="lazy"></div>
      <div class="gc__body">
        <h3 class="gc__title">${g.title}</h3>
        <span class="gc__price">${coin()}${g.price}</span>
        ${g.sizes.length ? `<div class="gc__sizes" role="radiogroup" aria-label="Размер">${g.sizes.map(s => `<button class="gc__size" type="button" role="radio" aria-checked="${s === sizeOf[g.id]}" data-size="${s}">${s.replace('-', '–')}</button>`).join('')}</div>` : ''}
      </div>
      <div class="gc__act" data-act></div>
    </article>`;
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-card]'); if (!c) return;
    const g = byId[c.dataset.card], size = g.sizes.length ? (sizeOf[g.id] || null) : null;
    if (e.target.closest('[data-add]')) {
      if (g.sizes.length && !size) { $$('[data-card="' + g.id + '"]').forEach(x => { x.classList.remove('is-need-size'); void x.offsetWidth; x.classList.add('is-need-size'); setTimeout(() => x.classList.remove('is-need-size'), 1400); }); }
      else add(g.id, size);
    }
    const q = e.target.closest('[data-q]'); if (q) step(key(g.id, size), +q.dataset.q);
    const s = e.target.closest('[data-size]');
    if (s) { c.classList.remove('is-need-size'); sizeOf[g.id] = s.dataset.size; $$('[data-card="' + g.id + '"] [data-size]').forEach(b => b.setAttribute('aria-checked', b.dataset.size === s.dataset.size)); $$('[data-card="' + g.id + '"]').forEach(renderAct); }
  });

  /* сетки по вариантам */
  let cat = 'all';
  const list = () => cat === 'all' ? GIFTS : GIFTS.filter(g => g.cat === cat);
  function renderGrids(anim) {
    $$('.vb[data-vb=gifts] [data-v]').forEach(sec => {
      const v = sec.dataset.v, grid = $('[data-grid]', sec);
      if (v === 'C') {
        $('[data-shelves]', sec).innerHTML = ['merch', 'tech', 'promocode'].map(c => {
          const items = GIFTS.filter(g => g.cat === c);
          return `<div class="g-shelf" id="shelf-${c}"><div class="g-shelf__head"><h3>${CATS[c]}</h3><span>${items.length}</span><div class="g-shelf__nav"><button type="button" data-scroll="-1" aria-label="Назад">${icon('arrow-r')}</button><button type="button" data-scroll="1" aria-label="Вперёд">${icon('arrow-r')}</button></div></div><div class="g-shelf__track">${items.map(g => card(g)).join('')}</div></div>`;
        }).join('');
        return;
      }
      const draw = () => {
        if (v === 'D') { const seen = {}; grid.innerHTML = list().map(g => { const big = !seen[g.cat]; seen[g.cat] = 1; return card(g, big ? ' is-big' : ''); }).join(''); }
        else grid.innerHTML = list().map(g => card(g)).join('');
        $$('[data-card]', grid).forEach(renderAct);
      };
      if (anim) { grid.classList.add('is-swap'); setTimeout(() => { draw(); grid.classList.remove('is-swap'); }, 220); } else draw();
    });
    $$('[data-shelves] [data-card]').forEach(renderAct);
  }
  $$('[data-filters]').forEach(f => {
    f.innerHTML = Object.entries(CATS).map(([k, t]) => `<button class="g-filter" type="button" aria-pressed="${k === 'all'}" data-cat="${k}">${t}</button>`).join('');
    f.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      if (f.dataset.filterMode === 'jump') { $$('[data-cat]', f).forEach(x => x.setAttribute('aria-pressed', x === b)); const t = b.dataset.cat === 'all' ? f.closest('section') : $('#shelf-' + b.dataset.cat); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      setCat(b.dataset.cat, true);
    });
  });
  function setCat(c, anim) { cat = c; $$('[data-filters]:not([data-filter-mode]) [data-cat]').forEach(x => x.setAttribute('aria-pressed', x.dataset.cat === c)); renderGrids(anim); }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-scroll]'); if (!b) return;
    const t = $('.g-shelf__track', b.closest('.g-shelf')); t.scrollBy({ left: +b.dataset.scroll * t.clientWidth * .8, behavior: 'smooth' });
  });

  /* ---------- хиро A: карточки по Figma 2005:113 (кадр 1440×900); mx/my/mw — телефон ---------- */
  const CLOUD = [
    { id: 'iphone-air', cx: 219.6, cy: 447.6, w: 168, r: -7, i: [-1, 4, 102, 92], mx: '4%', my: '84px', mw: '96px' },
    { id: 'station-max', cx: 771.6, cy: 199.6, w: 140, r: -9.5, i: [0, 6, 100, 89], mx: '38%', my: '70px', mw: '84px' },
    { id: 'airpods-max', cx: 1181.7, cy: 529.7, w: 176, r: 6, i: [-3, 3, 108, 97], mx: '70%', my: '90px', mw: '92px' },
    { id: 'yandex-drops', cx: 299.5, cy: 556.5, w: 104, r: 9.5, i: [6, 10, 87, 78], mx: '6%', my: 'calc(100% - 120px)', mw: '84px' },
    { id: 'backpack', cx: 1253.3, cy: 372.3, w: 168, r: -6, i: [0, 0, 100, 100], cover: 1, mx: '38%', my: 'calc(100% - 108px)', mw: '80px' },
    { id: 'rover', cx: 1005.8, cy: 729.8, w: 103, r: 13.2, i: [-18, -24, 137, 123], mx: '70%', my: 'calc(100% - 124px)', mw: '88px' },
  ];
  $('[data-cloud=a]').innerHTML = CLOUD.map((c, k) => `<div class="h-a__gift" style="--cx:${c.cx};--cy:${c.cy};--w:${c.w};--mx:${c.mx};--my:${c.my};--mw:${c.mw}"><div class="h-a__card${c.cover ? ' is-cover' : ''}" style="--r:${c.r}deg;--d:${(.3 + k * .09).toFixed(2)}s;--t:${(7 + k % 3 * .8).toFixed(1)}s;--o:${-k * 1.3}s;--ix:${c.i[0]}%;--iy:${c.i[1]}%;--iw:${c.i[2]}%;--ih:${c.i[3]}%"><img src="../assets/gifts/${c.id}.webp" alt=""></div></div>`).join('');

  /* хиро A: подарки слегка реагируют на курсор — общий параллакс по глубине и мягкое отталкивание рядом с курсором */
  const heroA = $('.h-a');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const gifts = $$('.h-a__gift', heroA).map((el, k) => ({ el, d: [.6, .35, .8, .45, .7, .5][k] || .5 }));
    let raf = 0, mx = 0, my = 0, inside = false;
    const tick = () => {
      raf = 0;
      const r = heroA.getBoundingClientRect(), px = (mx - r.left) / r.width - .5, py = (my - r.top) / r.height - .5;
      gifts.forEach(g => {
        const b = g.el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        const dx = cx - mx, dy = cy - my, dist = Math.hypot(dx, dy) || 1, push = inside ? Math.max(0, 1 - dist / 320) * 22 : 0;
        const x = inside ? -px * 36 * g.d + dx / dist * push : 0, y = inside ? -py * 26 * g.d + dy / dist * push : 0;
        g.el.style.setProperty('--mx-px', x.toFixed(1) + 'px'); g.el.style.setProperty('--my-px', y.toFixed(1) + 'px');
        g.el.style.setProperty('--tilt', (inside ? px * 6 * g.d : 0).toFixed(2) + 'deg');
      });
    };
    heroA.addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; inside = true; raf ||= requestAnimationFrame(tick); });
    heroA.addEventListener('pointerleave', () => { inside = false; raf ||= requestAnimationFrame(tick); });
  }

  /* хиро D: полка категорий */
  const shelf = $('[data-shelf]');
  shelf.innerHTML = ['merch', 'tech', 'promocode'].map(c => {
    const items = GIFTS.filter(g => g.cat === c), pr = items.map(g => g.price);
    const pick = { merch: ['backpack', 'travelmug', 'powerbank'], tech: ['iphone-air', 'airpods-max', 'station-max'], promocode: ['promo-lavka', 'promo-afisha', 'promo-travel'] }[c];
    return `<a class="h-d__cat" href="#gifts" data-goto="${c}"><span><b>${CATS[c]}</b><small>${coin()}${Math.min(...pr) === Math.max(...pr) ? pr[0] : Math.min(...pr) + '–' + Math.max(...pr)}</small></span><span class="h-d__imgs" aria-hidden="true">${pick.map(id => `<img src="../assets/gifts/${id}.webp" alt="">`).join('')}</span><span class="h-d__go" aria-hidden="true">${icon('arrow-down')}</span></a>`;
  }).join('');
  shelf.addEventListener('click', e => { const a = e.target.closest('[data-goto]'); if (a) setCat(a.dataset.goto); });

  /* ---------- табы «Как получать монеты?» ---------- */
  $$('[data-tabs]').forEach(sec => {
    const tl = $('[data-tablist]', sec);
    tl.innerHTML = [['franchise', 'Для франчайзи'], ['directors', 'Для директоров дарксторов']].map(([k, t], i) => `<button class="c-tab" type="button" role="tab" aria-selected="${!i}" data-tab="${k}">${t}</button>`).join('');
    tl.addEventListener('click', e => {
      const b = e.target.closest('[data-tab]'); if (!b) return;
      $$('[data-tab]', tl).forEach(x => x.setAttribute('aria-selected', x === b));
      $$('[data-panel]', sec).forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
    });
  });
  /* стопка монет в перспективе: ребро-цилиндр, сверху эллипс с короной, сжатой по вертикали */
  const CROWN = $('#crown path').getAttribute('d');
  /* id градиентов уникальны: одинаковый id в скрытой панели гасит заливку у видимой стопки */
  let uid = 0;
  function tower(n, o = {}) {
    const w = o.w || 140, rx = w / 2, ry = Math.round(rx * .314), t = o.t || 18, cx = rx + 6, W = w + 12, H = ry * 2 + n * t + 18;
    const base = H - 10 - ry, id = ++uid, step = Math.round(Math.min(70, 1000 / n));
    let g = `<defs><linearGradient id="cs${id}" x1="0" x2="1"><stop offset="0" stop-color="#1f4f86"/><stop offset=".38" stop-color="#3e88c5"/><stop offset=".6" stop-color="#5aa3dd"/><stop offset="1" stop-color="#285f97"/></linearGradient>
      <radialGradient id="sh${id}"><stop offset="0" stop-color="#061630" stop-opacity=".45"/><stop offset="1" stop-color="#061630" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="${cx}" cy="${base + 4}" rx="${rx * 1.12}" ry="${ry * 1.15}" fill="url(#sh${id})"/>`;
    for (let k = 0; k < n; k++) {
      const y = base - t - k * t, top = k === n - 1;
      g += `<g class="coin-k" style="--k:${k};--step:${step}ms"><path d="M${cx - rx} ${y}V${y + t}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + t}V${y}Z" fill="url(#cs${id})"/>`;
      g += `<path d="M${cx - rx} ${y + t}A${rx} ${ry} 0 0 0 ${cx + rx} ${y + t}" fill="none" stroke="#1b3a6a" stroke-opacity=".35"/>`;
      g += top
        ? `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#4b93cf"/><ellipse cx="${cx}" cy="${y}" rx="${rx * .8}" ry="${ry * .8}" fill="#aad9fc" stroke="#3e88c5" stroke-width="1.2"/><path d="${CROWN}" fill="#3e88c5" transform="translate(${cx} ${y}) scale(${rx * .075} ${rx * .075 * ry / rx}) translate(-13.92 -14.06)"/>`
        : `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#4b93cf"/>`;
      g += '</g>';
    }
    return { svg: `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg>`, H, ry, t };
  }
  $$('[data-coins]').forEach(el => {
    const r = tower(+el.dataset.coins, { w: +el.dataset.coinW, t: +el.dataset.coinT });
    el.innerHTML = r.svg;
    /* шкала (вариант J): отметка — на уровне верха k-й монеты, в процентах высоты стопки */
    $$('[data-level]', el.parentElement).forEach(l => l.style.top = `${(r.H - 10 - r.ry - l.dataset.level * r.t) / r.H * 100}%`);
  });
  /* «Горизонт» (F): подпись появляется в момент, когда её стопка легла: последняя монета стартует через (n−1)×step,
     на мягкой кривой coin-in она визуально на месте примерно через 0,55 с; у соседних подписей шаг не меньше 0,15 с */
  $$('.c-sky').forEach(stage => {
    let prev = -1;
    $$('.c-fig', stage).forEach(fig => {
      const n = +($('[data-coins]', fig)?.dataset.coins || 1), step = Math.round(Math.min(70, 1000 / n));
      const d = Math.max((n - 1) * step / 1000 + .55, prev + .15);
      fig.style.setProperty('--cap-d', d.toFixed(2) + 's'); prev = d;
    });
  });

  /* ---------- футер: текст 1:1 со старой страницы ---------- */
  const LEGAL = `<p>*Условия индивидуальны и&nbsp;зависят от&nbsp;направления. Чтобы узнать детали, отправьте заявку. <a href="https://lavka.yandex/franchise/rules" target="_blank" rel="noreferrer">Правила акции.</a></p>
    <p>Яндекс Лавка&nbsp;— раздел информационного сервиса Яндекс Еда, подробнее: <a href="https://yandex.ru/legal/termsofuse_eda/ru/" target="_blank" rel="noreferrer">clck.ru/QgJpy</a>. Условия и&nbsp;результаты индивидуальны и&nbsp;могут отличаться от&nbsp;указанных. Чтобы узнать подробности, отправьте заявку через форму.</p>
    <p>© 2026 ООО «Яндекс Лавка»</p>`;
  $$('[data-legal]').forEach(n => n.innerHTML = LEGAL);

  /* ---------- варианты ---------- */
  const BLOCKS = [...$$('.vb').map(b => ({ id: b.dataset.vb, name: b.dataset.vbName, el: b })), { id: 'cart', name: 'Корзина и заказ' }];
  /* порядок в коде: хиро, лавка, монеты, корзина, футер */
  const ORDER = ['hero', 'gifts', 'get', 'cart', 'footer'];
  const CART_NAMES = { A: 'Модалка', B: 'Шторка справа', C: 'Полоса и лист снизу', D: 'Две колонки', E: 'Во весь экран' };
  let cartV = 'A';
  const state = {};
  /* буквы вариантов у каждого блока свои: у «Как получать монеты» A–J */
  const lettersOf = b => b.el ? $$(':scope>[data-v]', b.el).map(v => v.dataset.v) : Object.keys(CART_NAMES);
  /* сборка по умолчанию — открывается по чистой ссылке без #v=: хиро P «Пролёт», каталог A, монеты F, корзина A, футер A */
  const DEFAULT = 'PAFAA';
  function fromHash() {
    const m = location.hash.match(/v=([A-P]{5})/); const s = m ? m[1] : DEFAULT;
    ORDER.forEach((id, i) => { const ok = lettersOf(BLOCKS.find(x => x.id === id)); state[id] = ok.includes(s[i]) ? s[i] : 'A'; });
  }
  const code = () => ORDER.map(id => state[id]).join('');
  function apply() {
    BLOCKS.forEach(b => { if (b.el) $$(':scope>[data-v]', b.el).forEach(s => s.classList.toggle('is-v', s.dataset.v === state[b.id])); });
    cartV = state.cart; document.body.className = document.body.className.replace(/\bcart-[A-E]\b/g, '').trim() + ' cart-' + cartV;
    $('[data-vcode]').textContent = code();
    $$('[data-vbtn]').forEach(b => b.setAttribute('aria-pressed', state[b.dataset.vbtn] === b.dataset.l));
    history.replaceState(null, '', code() === DEFAULT ? location.pathname + location.search : '#v=' + code());
    syncHdr(); update();
    /* хиро, показанный переключателем, запускаем сразу (kit ждёт IntersectionObserver) */
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.vb[data-vb=hero]>.is-v').forEach(h => h.classList.add('is-live'))));
  }
  $$('.vb').forEach(b => $$(':scope>[data-v]', b).forEach(v => v.insertAdjacentHTML('beforebegin', `<div class="vlabel"><b>${v.dataset.v}</b>${b.dataset.vbName} — «${v.dataset.vName}»</div>`)));
  $('[data-vrows]').innerHTML = ORDER.map(id => {
    const b = BLOCKS.find(x => x.id === id);
    const names = b.el ? Object.fromEntries($$(':scope>[data-v]', b.el).map(v => [v.dataset.v, v.dataset.vName])) : CART_NAMES;
    return `<div class="vrow"><span>${b.name}<small data-vname="${id}"></small></span><div class="vrow__btns">${lettersOf(b).map(l => `<button type="button" data-vbtn="${id}" data-l="${l}" title="${names[l]}" aria-label="${b.name}: ${names[l]}">${l}</button>`).join('')}</div></div>`;
  }).join('');
  const nameOf = id => { const b = BLOCKS.find(x => x.id === id); return b.el ? $(`:scope>[data-v="${state[id]}"]`, b.el).dataset.vName : CART_NAMES[state[id]]; };
  const refreshNames = () => ORDER.forEach(id => $(`[data-vname="${id}"]`).textContent = nameOf(id));
  $('[data-vrows]').addEventListener('click', e => { const b = e.target.closest('[data-vbtn]'); if (!b) return; state[b.dataset.vbtn] = b.dataset.l; apply(); refreshNames(); if (b.dataset.vbtn === 'cart') openCart(); });
  const tgl = $('[data-vpanel-toggle]'), body = $('[data-vpanel-body]');
  tgl.addEventListener('click', () => { const o = body.hidden; body.hidden = !o; tgl.setAttribute('aria-expanded', o); });
  $('[data-vall]').addEventListener('change', e => { document.body.classList.toggle('is-all', e.target.checked); syncHdr(); });
  addEventListener('hashchange', () => { fromHash(); apply(); refreshNames(); });

  /* шапка тёмным текстом над светлым хиро (у секции data-light) */
  const hdr = $('[data-hdr]');
  function syncHdr() { const cur = $(`.vb[data-vb=hero]>[data-v="${state.hero}"]`); const light = !!cur && cur.hasAttribute('data-light') && !document.body.classList.contains('is-all') && !hdr.classList.contains('is-solid'); hdr.classList.toggle('hdr--onlight', light); }
  new MutationObserver(syncHdr).observe(hdr, { attributes: true, attributeFilter: ['class'] });

  fromHash(); renderGrids(); apply(); refreshNames();
})();
