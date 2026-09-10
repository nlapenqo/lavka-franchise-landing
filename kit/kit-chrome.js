/* ============================================================
   МЕХАНИКА СТРАНИЦЫ КИТА · kit-chrome.js
   Паспорта свойств блоков, режим «Схема», превью 390, копирование чистого HTML,
   сборщик страницы и «Примерка». В лендинги НЕ копируется — только kit.css и kit.js.
   Подключать ДО kit.js: чистая разметка блоков снимается до того, как kit.js
   добавит is-visible, счётчики и обёрнутые слова.
   ============================================================ */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const flash = (btn, text) => { const t = btn.textContent; btn.classList.add('is-done'); btn.textContent = text; setTimeout(() => { btn.classList.remove('is-done'); btn.textContent = t; }, 1600); };

  /* --- словари --- */
  const SLOT_NAMES = {
    lead: 'Лид', cta: 'Кнопка', cta2: 'Вторая кнопка / ссылка', chips: 'Чипсы', caption: 'Подпись', arrows: 'Стрелки',
    glow: 'Свечение', note: 'Пояснение', tg: 'Telegram', years: 'Плашки годов', head: 'Заголовок секции', label: 'Надзаголовок',
    status: 'Статус «набор открыт»', term: 'Срок шага', counter: 'Счётчик шагов', bar: 'Прогресс', more: 'Ссылка «все фото»',
    cities: 'Города', info: 'Сноски «i»', role: 'Роль', city: 'Город и масштаб', avatar: 'Аватар', strip: 'CTA-полоса',
    args: 'Аргументы', comment: 'Поле «вопросы»', response: 'Срок ответа', nav: 'Меню', legal: 'Реквизиты', menu: 'Мобильное меню',
    ctam: 'CTA на телефоне', photo: 'Фото', subtitle: 'Подзаголовок'
  };
  const THEME_NAMES = { white: 'Белая', light: 'Светлая', dark: 'Тёмная' };
  const THEME_CLASSES = { white: '', light: 'section--light', dark: 'section--dark' };

  /* Медиа-слоты шаблона: код = имя файла для дизайнера. Размеры — из kit.css (десктоп / телефон 375). */
  const SLOTS = [
    { code: 'KV01_hero_1164×560', where: 'LB01 · B', w: 1164, h: 560, m: '335×300', note: 'Кадр под заголовком хиро, скруглён сверху. Главное — в центре: на телефоне кадр обрезается по бокам. Лица и надписи не ближе 80px к краям.' },
    { code: 'KV02_split_542×480', where: 'LB01 · C, LB04', w: 542, h: 480, m: '295×220', note: 'Кадр в паре с текстом: хиро-сплит и слайды «Текст + медиа». Главный объект по центру, без текста на фото.' },
    { code: 'KV03_gallery-wide_3:2', where: 'LB12', w: 1440, h: 960, m: '335×223', note: 'Широкий кадр галереи на две колонки. Пропорция 3:2, выгружать 1440 по ширине.' },
    { code: 'KV04_gallery-tall_3:4', where: 'LB12', w: 711, h: 948, m: '162×217', note: 'Узкий кадр галереи, стоят парами. Пропорция 3:4.' },
    { code: 'AV01_88', where: 'LB09 · A', w: 88, h: 88, note: 'Портрет спикера в круге. Квадрат, лицо в верхней трети: фото увеличивается на 30% с фокусом на лице.' },
    { code: 'AV02_120', where: 'LB09 · B', w: 120, h: 120, note: 'Портрет команды в круге. Те же правила, что AV01.' },
    { code: 'AV00_64', where: 'LB10', w: 64, h: 64, note: 'Аватар в отзыве. Нет фото — инициалы на голубом, кадр не нужен.' },
    { code: 'LG01_h42', where: 'LB11', w: 200, h: 42, note: 'Логотип прессы или партнёра: SVG, высота 42, ширина свободная. Серый до наведения — цвет в файле не важен.' },
    { code: 'IC01_24', where: 'LB06 · A', w: 24, h: 24, note: 'Иконка на плашке 56×56: аутлайн 1.8px тёмно-синим из набора брендбука. SVG 24×24.' },
    { code: 'OG_1200×630', where: 'мета страницы', w: 1200, h: 630, note: 'Превью для мессенджеров и соцсетей: лого-локап и заголовок на navy со свечением. Текст не ближе 100px к краям.' }
  ];

  /* Рецепты страниц: код блока и вариант */
  const RECIPES = {
    main: { name: 'Главный лендинг', blocks: ['LB00:A', 'LB01:A', 'LB02', 'LB03:A', 'LB04', 'LB07', 'LB08', 'LB10', 'LB11', 'LB13', 'LB15', 'LB16'] },
    event: { name: 'Мероприятие', blocks: ['LB00:A', 'LB01:B', 'LB05', 'LB03:B', 'LB09:A', 'LB12', 'LB14:B', 'LB16'] },
    product: { name: 'Спецпроект / продукт', blocks: ['LB00:A', 'LB01:C', 'LB06:A', 'LB04', 'LB09:B', 'LB13', 'LB14:A', 'LB15', 'LB16'] }
  };

  /* ============================================================
     1 · Блоки: чистая разметка, состояние, применение свойств
     ============================================================ */
  const blocks = $$('.kit-block[data-block]');
  const byCode = new Map(blocks.map(b => [b.dataset.block, b]));
  const pristine = new Map(); // block → {variant → outerHTML корня варианта}

  const variantsOf = block => $$(':scope > .kit-body > [data-variant]', block);
  const htmlRoot = root => root.matches('[data-html]') ? root : $('[data-html]', root);
  const themesOf = (block, root) => (root.dataset.themes || block.dataset.themes || '').split(/\s+/).filter(Boolean);
  const cardsRange = (block, root) => {
    const r = (root.dataset.cardsRange || block.dataset.cardsRange || '').split('-').map(Number);
    return r.length === 2 && r.every(Number.isFinite) ? r : null;
  };

  blocks.forEach(block => {
    const map = new Map();
    variantsOf(block).forEach(v => map.set(v.dataset.variant, v.outerHTML));
    pristine.set(block, map);
    const first = variantsOf(block)[0];
    const container = first && $('[data-cards]', first);
    block._kit = {
      variant: first?.dataset.variant || 'A',
      theme: htmlRoot(first)?.dataset.theme || 'white',
      off: new Set(),
      cards: container ? Number(container.dataset.cards) || container.children.length : null,
      scheme: false, phone: true
    };
  });

  /* применить состояние к корню варианта (живому или к клону). mode: 'live' | 'preview' | 'export' */
  const applyTo = (block, root, st, mode = 'live') => {
    const remove = mode === 'export';
    const target = htmlRoot(root);
    const themes = themesOf(block, root);
    if (target && themes.length) {
      const theme = themes.includes(st.theme) ? st.theme : themes[0];
      const classes = Object.assign({}, THEME_CLASSES, parseMap(root.dataset.themeClasses || block.dataset.themeClasses));
      Object.values(classes).forEach(c => c && target.classList.remove(...c.split(' ')));
      if (classes[theme]) target.classList.add(...classes[theme].split(' '));
      target.dataset.theme = theme;
    }
    $$('[data-slot]', root).forEach(el => {
      const off = st.off.has(el.dataset.slot);
      if (off && remove) el.remove(); else el.hidden = off;
    });
    const container = $('[data-cards]', root);
    const range = cardsRange(block, root);
    if (container && range && st.cards) {
      const n = Math.max(range[0], Math.min(range[1], st.cards));
      [...container.children].filter(c => !c.classList.contains('ambient-field')).forEach((it, i) => { if (i >= n) { if (remove) it.remove(); else it.hidden = true; } else it.hidden = false; });
      container.dataset.cards = n;
      container.style.setProperty('--n', n);
      container.closest('.split')?.classList.toggle('split--single', n === 1);
      const total = $('[data-steps-total]', root); if (total) total.textContent = 'из ' + pad(n);
    }
    if (remove) {
      $$('[data-html]', root).concat(root.matches('[data-html]') ? [root] : []).forEach(el => {
        ['data-html', 'data-vname', 'data-themes', 'data-theme-classes', 'data-cards-range'].forEach(a => el.removeAttribute(a));
        if (el.classList.contains('hdr--demo')) { el.classList.remove('hdr--demo', 'hdr--demo-m'); el.setAttribute('data-hdr', ''); }
      });
      $$('[hidden]', root).forEach(el => el.removeAttribute('hidden'));
      $$('.kit-only', root).forEach(el => el.remove());
    }
  };
  const parseMap = s => Object.fromEntries((s || '').split(';').filter(Boolean).map(p => { const [k, v = ''] = p.split(':'); return [k.trim(), v.trim()]; }));

  /* чистый HTML блока в текущем состоянии */
  const exportHTML = (block, mode = 'export') => {
    const st = block._kit, src = pristine.get(block).get(st.variant);
    if (!src) return '';
    const t = document.createElement('template'); t.innerHTML = src;
    const root = t.content.firstElementChild;
    const nodes = root.matches('[data-html]') ? [root] : $$('[data-html]', root);
    applyTo(block, root, st, mode);
    return nodes.filter(n => t.content.contains(n)).map(n => n.outerHTML).join('\n');
  };

  const currentRoot = block => variantsOf(block).find(v => v.dataset.variant === block._kit.variant);
  const summary = block => {
    const st = block._kit, root = currentRoot(block), themes = root ? themesOf(block, root) : [];
    const parts = [];
    if (variantsOf(block).length > 1) parts.push('вариант ' + st.variant);
    if (themes.length) parts.push((THEME_NAMES[st.theme] || st.theme).toLowerCase());
    if (root && cardsRange(block, root) && st.cards) parts.push(st.cards + ' карт.');
    if (st.off.size) parts.push('без: ' + [...st.off].map(s => (SLOT_NAMES[s] || s).toLowerCase()).join(', '));
    return parts.join(' · ');
  };

  /* ============================================================
     2 · Паспорт свойств (панель над блоком)
     ============================================================ */
  const seg = (items, cur, on) => {
    const d = document.createElement('div'); d.className = 'kit-seg';
    items.forEach(([v, name]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.dataset.v = v;
      b.classList.toggle('is-on', v === cur); b.addEventListener('click', () => on(v)); d.appendChild(b);
    });
    return d;
  };
  const prop = (title, ...nodes) => {
    const d = document.createElement('div'); d.className = 'kit-prop';
    const t = document.createElement('span'); t.className = 'kit-prop__t'; t.textContent = title; d.appendChild(t);
    nodes.forEach(n => d.appendChild(n));
    return d;
  };

  const renderProps = block => {
    const st = block._kit, panel = block._panel, root = currentRoot(block);
    panel.innerHTML = '';
    const vs = variantsOf(block);
    if (vs.length > 1) {
      const hint = document.createElement('span'); hint.className = 'kit-prop__hint'; hint.textContent = root?.dataset.vname || '';
      panel.appendChild(prop('Вариант', seg(vs.map(v => [v.dataset.variant, v.dataset.variant]), st.variant, v => { st.variant = v; update(block); }), hint));
    } else if (root?.dataset.vname) {
      const hint = document.createElement('span'); hint.className = 'kit-prop__hint'; hint.textContent = root.dataset.vname;
      panel.appendChild(prop('Вариант', hint));
    }
    const themes = root ? themesOf(block, root) : [];
    if (themes.length > 1) panel.appendChild(prop('Тема', seg(themes.map(t => [t, THEME_NAMES[t] || t]), st.theme, t => { st.theme = t; update(block); })));
    const range = root && cardsRange(block, root);
    if (range) {
      const box = document.createElement('div'); box.className = 'kit-stepper';
      const minus = document.createElement('button'); minus.type = 'button'; minus.textContent = '−'; minus.disabled = st.cards <= range[0];
      const plus = document.createElement('button'); plus.type = 'button'; plus.textContent = '+'; plus.disabled = st.cards >= range[1];
      const val = document.createElement('b'); val.textContent = st.cards;
      minus.addEventListener('click', () => { st.cards = Math.max(range[0], st.cards - 1); update(block); });
      plus.addEventListener('click', () => { st.cards = Math.min(range[1], st.cards + 1); update(block); });
      box.append(minus, val, plus);
      const hint = document.createElement('span'); hint.className = 'kit-prop__hint'; hint.textContent = `${range[0]}–${range[1]}`;
      panel.appendChild(prop(block.dataset.cardsName || 'Карточек', box, hint));
    }
    const slots = root ? [...new Set($$('[data-slot]', root).map(e => e.dataset.slot))] : [];
    if (slots.length) {
      const chips = document.createElement('div'); chips.className = 'kit-chips';
      slots.forEach(s => {
        const l = document.createElement('label'); l.className = 'kit-chip'; l.classList.toggle('is-on', !st.off.has(s));
        const c = document.createElement('input'); c.type = 'checkbox'; c.checked = !st.off.has(s);
        c.addEventListener('change', () => { c.checked ? st.off.delete(s) : st.off.add(s); update(block); });
        l.append(c, document.createTextNode(SLOT_NAMES[s] || s)); chips.appendChild(l);
      });
      panel.appendChild(prop('Части', chips));
    }
    const right = prop('Вид', seg([[0, 'Дизайн'], [1, 'Схема']], st.scheme ? 1 : 0, v => { st.scheme = !!v; update(block); }));
    right.classList.add('kit-prop--right');
    const ph = document.createElement('label'); ph.className = 'kit-chip'; ph.classList.toggle('is-on', st.phone);
    const pc = document.createElement('input'); pc.type = 'checkbox'; pc.checked = st.phone;
    pc.addEventListener('change', () => { st.phone = pc.checked; update(block); });
    ph.append(pc, document.createTextNode('Телефон 390')); right.appendChild(ph);
    panel.appendChild(right);
    /* строка свойств, как они уйдут в разметку и в Figma */
    const code = document.createElement('code'); code.className = 'kit-props__code';
    const attrs = [`data-block="${block.dataset.block}"`];
    if (vs.length > 1) attrs.push(`data-variant="${st.variant}"`);
    if (themes.length) attrs.push(`data-theme="${st.theme}"`);
    if (range) attrs.push(`data-cards="${st.cards}"`);
    if (st.off.size) attrs.push(`hidden: ${[...st.off].join(', ')}`);
    code.textContent = attrs.join(' ');
    panel.appendChild(code);
  };

  const update = block => {
    const st = block._kit;
    variantsOf(block).forEach(v => { v.hidden = v.dataset.variant !== st.variant; });
    const root = currentRoot(block);
    if (root) {
      const themes = themesOf(block, root);
      if (themes.length && !themes.includes(st.theme)) st.theme = htmlRoot(root)?.dataset.theme && themes.includes(htmlRoot(root).dataset.theme) ? htmlRoot(root).dataset.theme : themes[0];
      const range = cardsRange(block, root);
      if (range) { const c = $('[data-cards]', root); if (!st.cards) st.cards = Number(c?.dataset.cards) || c?.children.length || range[1]; st.cards = Math.max(range[0], Math.min(range[1], st.cards)); }
      applyTo(block, root, st, 'live');
    }
    block.classList.toggle('is-scheme', st.scheme);
    block.classList.toggle('has-phone', st.phone);
    renderProps(block);
    schedulePreview(block);
    renderBuilderRows();
  };

  /* ============================================================
     3 · Превью 390: iframe с тем же блоком в том же состоянии
     ============================================================ */
  const headAssets = () => {
    const out = [];
    $$('link[rel="stylesheet"]').forEach(l => out.push(`<link rel="stylesheet" href="${new URL(l.getAttribute('href'), location.href)}">`));
    $$('style[data-kit]').forEach(s => out.push(s.outerHTML));
    return out.join('\n');
  };
  const kitScript = () => {
    const ext = $$('script[src]').find(s => /kit\.js(\?|$)/.test(s.getAttribute('src')));
    if (ext) return `<script src="${new URL(ext.getAttribute('src'), location.href)}"><\/script>`;
    const inl = $('script[data-kit="kit.js"]');
    return inl ? inl.outerHTML : '';
  };
  const previewDoc = block => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${location.href.split('#')[0]}">${headAssets()}<style>html,body{overflow-x:hidden}</style></head><body class="is-solo"><div class="kit-block kit-block--solo is-target${block._kit.scheme ? ' is-scheme' : ''}" data-block="${block.dataset.block}"><div class="kit-body">${exportHTML(block, 'preview')}</div></div>${kitScript()}<script>(()=>{const send=()=>parent.postMessage({kit:'h',id:${JSON.stringify(block.dataset.block)},h:document.documentElement.scrollHeight},'*');new ResizeObserver(send).observe(document.body);addEventListener('load',send);setTimeout(send,700);})();<\/script></body></html>`;

  const previewTimers = new WeakMap();
  const buildPreview = block => {
    const f = block._iframe; if (!f || !block._kit.phone) return;
    f.srcdoc = previewDoc(block); block._previewBuilt = true;
  };
  const schedulePreview = block => {
    if (!block._previewBuilt && !block._previewNear) return;
    clearTimeout(previewTimers.get(block));
    previewTimers.set(block, setTimeout(() => buildPreview(block), 180));
  };
  addEventListener('message', e => {
    const d = e.data; if (!d || d.kit !== 'h') return;
    const block = byCode.get(d.id); if (block?._iframe) block._iframe.style.height = Math.max(240, d.h) + 'px';
  });

  /* ============================================================
     5 · Сборщик страницы + «Примерка»
     ============================================================ */
  const builder = $('[data-builder]');
  const pageHTML = selected => {
    const parts = [], main = [];
    let hdr = '', footer = '';
    selected.forEach(block => {
      const code = block.dataset.block, name = $('.kit-label__name', block)?.textContent || code;
      const html = `<!-- ${code} · ${name}${summary(block) ? ' · ' + summary(block) : ''} -->\n${exportHTML(block)}`;
      if (code === 'LB00') hdr = html; else if (code === 'LB16') footer = html; else main.push(html);
    });
    parts.push('<!doctype html>', '<html lang="ru">', '<head>', '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">',
      '<title>Новый лендинг Лавки</title>', '<meta name="description" content="">', '<link rel="icon" type="image/svg+xml" href="../site/assets/figma/favicon.svg">',
      '<link rel="stylesheet" href="./kit.css">', '<!-- Собрано из kit/index.html. Пути к картинкам — относительно kit/, замените на свои. Форма никуда не отправляет — обработчик подключают разработчики. -->', '</head>', '<body>');
    if (hdr) parts.push(hdr);
    parts.push('<main id="top">', main.join('\n\n'), '</main>');
    if (footer) parts.push(footer);
    parts.push('<script src="./kit.js"><\/script>', '</body>', '</html>');
    return parts.join('\n');
  };

  const renderBuilderRows = () => {
    if (!builder) return;
    const list = $('[data-builder-list]', builder);
    if (!list.children.length) {
      blocks.forEach(block => {
        const row = document.createElement('label'); row.className = 'kit-brow'; row.dataset.code = block.dataset.block;
        row.innerHTML = `<input type="checkbox" checked><b>${block.dataset.block}</b><span class="kit-brow__name">${$('.kit-label__name', block)?.textContent || ''}</span><span class="kit-brow__sum" data-sum></span><a class="kit-brow__go" href="#${block.id}">к блоку ↑</a>`;
        $('input', row).addEventListener('change', renderBuilderRows);
        list.appendChild(row);
      });
    }
    let n = 0;
    $$('.kit-brow', list).forEach(row => {
      const block = byCode.get(row.dataset.code), on = $('input', row).checked;
      row.classList.toggle('is-off', !on); if (on) n++;
      $('[data-sum]', row).textContent = summary(block);
    });
    const count = $('[data-builder-count]', builder); if (count) count.textContent = `${n} из ${blocks.length}`;
  };
  if (builder) {
    renderBuilderRows();
    $$('[data-recipe]', builder).forEach(btn => btn.addEventListener('click', () => {
      const r = RECIPES[btn.dataset.recipe];
      const want = new Map();
      if (r) r.blocks.forEach(s => { const [code, v] = s.split(':'); want.set(code, v); });
      $$('.kit-brow', builder).forEach(row => {
        const code = row.dataset.code, on = btn.dataset.recipe === 'all' ? true : btn.dataset.recipe === 'none' ? false : want.has(code);
        $('input', row).checked = on;
        if (on && want.get(code)) { const b = byCode.get(code); if (b._kit.variant !== want.get(code)) { b._kit.variant = want.get(code); update(b); } }
      });
      $$('[data-recipe]', builder).forEach(b => b.classList.toggle('is-on', b === btn));
      renderBuilderRows();
    }));
    $$('[data-builder-copy]', builder).forEach(btn => btn.addEventListener('click', async () => {
      const selected = $$('.kit-brow', builder).filter(r => $('input', r).checked).map(r => byCode.get(r.dataset.code));
      try { await navigator.clipboard.writeText(pageHTML(selected)); flash(btn, `Скопировано · ${selected.length} бл.`); } catch { flash(btn, 'Не удалось'); }
    }));
  }

  /* «Примерка»: карточки медиа-слотов */
  $$('[data-slots]').forEach(box => {
    box.innerHTML = SLOTS.map((s, i) => {
      const ratio = s.w / s.h, wide = ratio > 1.4, square = Math.abs(ratio - 1) < .05;
      return `<article class="kit-slot${square ? ' kit-slot--sq' : ''}">
        <div class="kit-slot__ph" style="aspect-ratio:${s.w}/${s.h}${wide ? '' : ';max-width:' + Math.round(220 * ratio) + 'px'}"><b>${s.code.split('_')[0]}</b><span>${s.w} × ${s.h}</span></div>
        <h4><i>${i + 1}.</i> ${s.code}</h4>
        <p class="kit-slot__where">${s.where}${s.m ? ` · телефон ${s.m}` : ''} · выгружать в&nbsp;2x</p>
        <p class="kit-slot__note">${s.note}</p>
      </article>`;
    }).join('');
  });

  /* ============================================================
     4 · Инициализация блоков: паспорт, копирование, превью
     ============================================================ */
  const solo = new URLSearchParams(location.search);
  const soloCode = solo.get('block');

  blocks.forEach(block => {
    const label = $('.kit-label', block);
    const panel = document.createElement('div'); panel.className = 'kit-props'; block._panel = panel;
    label.after(panel);
    /* превью 390 */
    const body = $(':scope > .kit-body', block);
    const pv = document.createElement('div'); pv.className = 'kit-preview';
    pv.innerHTML = '<div class="kit-preview__device"><iframe title="Превью блока на телефоне 390" loading="lazy"></iframe></div><span class="kit-preview__note">Телефон · 390 · тот же блок в том же состоянии</span>';
    block._iframe = $('iframe', pv);
    body.after(pv);
    /* копировать HTML текущего состояния */
    $$('[data-copy]', block).forEach(btn => btn.addEventListener('click', async () => {
      const html = exportHTML(block);
      try { await navigator.clipboard.writeText(html); flash(btn, 'Скопировано'); } catch { flash(btn, 'Не удалось'); }
    }));
    update(block);
  });

  if ('IntersectionObserver' in window && !soloCode) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const b = e.target.closest('.kit-block'); b._previewNear = true; buildPreview(b); io.unobserve(e.target); } }), { rootMargin: '600px 0px' });
    blocks.forEach(b => io.observe($('.kit-preview', b)));
  }

  /* режим одного блока без хрома: index.html?block=LB06&variant=B&theme=dark&cards=4&off=lead,head&scheme=1 */
  if (soloCode && byCode.has(soloCode)) {
    const block = byCode.get(soloCode), st = block._kit;
    if (solo.get('variant')) st.variant = solo.get('variant');
    if (solo.get('theme')) st.theme = solo.get('theme');
    if (solo.get('cards')) st.cards = Number(solo.get('cards'));
    if (solo.get('off')) st.off = new Set(solo.get('off').split(',').filter(Boolean));
    st.scheme = solo.get('scheme') === '1'; st.phone = false;
    document.body.classList.add('is-solo'); block.classList.add('is-target');
    update(block);
  }


  /* примерка: паспорта прямо в списке блоков */
  if ('fitting' in document.body.dataset && builder) {
    $$('.kit-brow', builder).forEach(row => { const b = byCode.get(row.dataset.code); if (b?._panel) row.after(b._panel); });
  }
  $('[data-recipe].is-on', builder || document)?.click();

  window.KIT = { blocks, exportHTML, pageHTML, SLOTS, RECIPES, update };
})();
