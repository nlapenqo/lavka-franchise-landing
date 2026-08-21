/* Поведение блоков, одинаковое во всех трёх концептах.
   Различается только навигация и CTA — она пишется в каждом варианте отдельно. */
window.MB = (() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* бесшовная бегущая строка: контент дублируется n раз, трек едет на -50% */
  const marquee = (sel, e, copies = 2) => {
    const one = `<span class="evt__i"><b>${e.name}</b></span><span class="evt__i">${e.when}</span>` +
                `<span class="evt__i">${e.note}</span><span class="evt__i"><i></i>${e.status}</span>`;
    $(sel).innerHTML = Array.from({ length: copies * 2 }, (_, i) =>
      `<div class="evt__g"${i ? ' aria-hidden="true"' : ''}>${one}</div>`).join('');
  };

  /* 3D-барабан городов из хиро */
  const cities = (sel, list, off) => {
    const box = $(sel); if (!box) return;
    const home = list.length - 1;
    const words = list.map(t => { const s = document.createElement('span'); s.textContent = t; box.append(s); return s; });
    let cur = off ? home : 0;
    const setW = i => { box.style.width = words[i].offsetWidth + 'px'; };
    words[cur].classList.add('cur'); setW(cur);
    document.fonts?.ready?.then(() => setW(cur));
    addEventListener('resize', () => setW(cur), { passive: true });
    if (off) return;
    const next = () => {
      const prev = cur; cur = (cur + 1) % list.length;
      words[prev].classList.replace('cur', 'out');
      words[cur].classList.remove('out'); void words[cur].offsetWidth; words[cur].classList.add('cur');
      setW(cur);
      setTimeout(() => words[prev].classList.remove('out'), 1250);
      setTimeout(next, cur === home ? 4400 : 2400);
    };
    setTimeout(next, 1400);
  };

  const reveal = (sel = '.rv') => {
    const items = $$(sel);
    if (reduced) return items.forEach(i => i.classList.add('on'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    items.forEach(i => io.observe(i));
  };

  const counters = (sel = '[data-count]') => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const to = +e.target.dataset.count, t0 = performance.now(), dur = 1100;
      if (reduced) { e.target.textContent = to; return; }
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        e.target.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }), { rootMargin: '0px 0px -18% 0px' });
    $$(sel).forEach(n => io.observe(n));
  };

  /* точки-индикаторы для любой снап-ленты */
  const dots = (trackSel, dotsSel) => {
    const track = $(trackSel), box = $(dotsSel);
    if (!track || !box) return;
    const n = track.children.length;
    box.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
    const marks = [...box.children];
    /* шаг = расстояние между карточками; scrollWidth врал на величину padding-inline ленты */
    const step = () => (track.children[1] ? track.children[1].offsetLeft - track.children[0].offsetLeft : track.clientWidth) || 1;
    let f = 0;
    track.addEventListener('scroll', () => {
      if (f) return;
      f = requestAnimationFrame(() => {
        f = 0;
        const i = Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / step())));
        marks.forEach((m, j) => m.classList.toggle('on', j === i));
      });
    }, { passive: true });
  };

  const accordion = sel => {
    const box = $(sel); if (!box) return;
    box.addEventListener('click', ev => {
      const btn = ev.target.closest('button'); if (!btn) return;
      const art = btn.parentElement, open = art.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  };

  /* Даркстор на мобилке: хотспоты не нажать пальцем, поэтому зоны —
     горизонтальные таблетки, а карта подъезжает к выбранной зоне. */
  const zones = ({ tabs, card, world, data, zoom = 2.1 }) => {
    const tabsBox = $(tabs), cardBox = $(card), w = $(world);
    if (!tabsBox || !w) return;
    tabsBox.innerHTML = data.map(([n, t], i) =>
      `<button type="button" class="${i ? '' : 'on'}" data-i="${i}">${t}</button>`).join('');
    w.insertAdjacentHTML('beforeend', data.map(([n, t, d, x, y], i) =>
      `<span class="map__pin ${i ? '' : 'on'}" style="--x:${x}%;--y:${y}%"></span>`).join(''));
    const pins = [...w.querySelectorAll('.map__pin')];
    const btns = [...tabsBox.children];
    const go = (i, scroll) => {
      const [n, t, d, x, y] = data[i];
      btns.forEach((b, j) => b.classList.toggle('on', j === i));
      pins.forEach((p, j) => p.classList.toggle('on', j === i));
      w.style.transform = `scale(${zoom}) translate(${(50 - x)}%, ${(50 - y)}%)`;
      cardBox.innerHTML = `<b>${n} — зона даркстора</b><h3>${t}</h3><p>${d}</p>`;
      /* доводим таблетку в центр САМОЙ ленты: scrollIntoView утащил бы за собой весь документ */
      if (scroll) {
        const b = btns[i];
        tabsBox.scrollTo({ left: b.offsetLeft - (tabsBox.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
      }
    };
    tabsBox.addEventListener('click', e => {
      const b = e.target.closest('button'); if (b) go(+b.dataset.i, true);
    });
    go(0, false);
  };

  /* Вертикальный таймлайн шагов: полоса заполняется по мере прохождения экрана */
  const timeline = (boxSel, fillSel, stepSel) => {
    const box = $(boxSel), fill = $(fillSel);
    if (!box || !fill) return;
    const steps = [...box.querySelectorAll(stepSel)];
    let f = 0;
    const upd = () => {
      f = 0;
      const r = box.getBoundingClientRect(), line = innerHeight * .55;
      const h = Math.max(0, Math.min(r.height - 40, line - r.top));
      fill.style.setProperty('--fh', h + 'px');
      steps.forEach(s => s.classList.toggle('on', s.getBoundingClientRect().top < line));
    };
    addEventListener('scroll', () => { if (!f) f = requestAnimationFrame(upd); }, { passive: true });
    upd();
  };


  /* Типографика по-русски: короткие слова не висят в конце строки, число не отрывается
     от единицы, перед тире — неразрывный пробел. Идём по словам, поэтому «чем в половине»
     склеивается целиком, а не через одно. Ходим только по текстовым узлам. */
  const NB = '\u00A0';
  const GLUE = new Set(('а и к о с у в я бы во да до же за из ко ли на не ни но об от по со то уж ' +
    'без для над под при про как или чем что').split(' '));
  const UNIT = /^(млн|млрд|тыс|₽|%|м²|лет|год[ауы]?|месяц(а|ев)?|недел[яию]|недель|день|дн[яей]+|минут[аыу]?|город(а|ов|ах)?|даркстор(а|ов)?|рабочих|шт)$/i;
  const MONEY = /^(млн|млрд|тыс)$/i;

  const fix = raw => {
    let t = raw.replace(/(\S)\s+-\s+/g, '$1' + NB + '— ')
               .replace(/(\S)\s+([—–])(\s*)/g, (m, a, d, sp) => a + NB + d + (sp ? ' ' : ''));
    const p = t.split(/(\s+)/);                    /* слово, разделитель, слово… */
    for (let i = 1; i < p.length; i += 2) {
      const prev = p[i - 1].replace(/^[(«"„]+/, '').toLowerCase();
      const next = (p[i + 1] || '').replace(/[.,;:!?)»"]+$/, '');
      if (GLUE.has(prev) ||
          (/\d$/.test(p[i - 1]) && UNIT.test(next)) ||
          (MONEY.test(prev) && /^[₽$€]/.test(next))) p[i] = NB;
    }
    return p.join('');
  };

  /* Прогон по готовому DOM: вызывать после рендера блоков, до замеров ширины. */
  const typo = (rootSel = 'body') => {
    const root = $(rootSel); if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => /^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(n.parentNode.nodeName)
        ? NodeFilter.FILTER_REJECT
        : (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { const v = fix(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; });
  };

  const form = sel => {
    const f = $(sel); if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const btn = f.querySelector('[type=submit]');
      btn.textContent = 'Отправляем…';
      setTimeout(() => { btn.textContent = 'Заявка отправлена ✓'; }, 700);
    });
  };

  /* общий каркас меню: разметка и позиция — на стороне варианта */
  const menu = (btnSel, menuSel, after) => {
    const btn = $(btnSel), box = $(menuSel);
    if (!btn || !box) return;
    const close = () => {
      document.body.classList.remove('is-locked');
      box.classList.remove('open'); box.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false'); after?.();
    };
    btn.addEventListener('click', () => {
      const open = !box.classList.contains('open');
      document.body.classList.toggle('is-locked', open);
      box.classList.toggle('open', open); box.setAttribute('aria-hidden', String(!open));
      btn.setAttribute('aria-expanded', String(open)); after?.();
    });
    box.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return { close };
  };

  return { marquee, cities, reveal, counters, dots, accordion, zones, timeline, typo, form, menu };
})();
