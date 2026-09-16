/* Интерактивность блоков конструктора. Каждый модуль включается по data-атрибуту и ничего не ломает, если блока нет. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* шапка: стеклянная после 90px (два порога — без дребезга) */
  const header = $('[data-header]');
  if (header) {
    let solid = scrollY > 90, frame = 0;
    const apply = () => { frame = 0; if (!solid && scrollY > 110) solid = true; else if (solid && scrollY < 55) solid = false; header.classList.toggle('is-solid', solid); };
    addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(apply); }, { passive: true });
    apply();
  }

  /* хиро: слова заголовка появляются по очереди, потом лид и кнопки (как на главной) */
  $$('.hero').forEach(hero => {
    let i = 0;
    const wrap = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          const w = document.createElement('i'); w.className = 'hero__word'; w.style.setProperty('--i', i++); w.textContent = tok; frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrap(n);
    });
    $$('.hero__title', hero).forEach(wrap);
    const live = () => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-live')));
    if (reduced || !('IntersectionObserver' in window)) live();
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { live(); io.disconnect(); } }), { threshold: .25 }); io.observe(hero); }
  });

  /* авто-появление: карточки, плашки, заголовки — снизу на 28px, соседи со стаггером 70 мс */
  const AUTO = 'h2.t-h1,.section__head,.statement__text,.number,.feature,.card,.tile,.quote,.checklist li,.timeline__item,.step,.gallery__cell,.logos,.faq__item,.plate,.form-strip,.lead__copy,.form-card';
  $$(AUTO).forEach(el => { const outer = el.parentElement?.closest('.reveal'); if (outer) return; el.classList.add('reveal'); });
  $$('.reveal').forEach(el => {
    if (el.style.getPropertyValue('--delay')) return;
    const sibs = [...el.parentElement.children].filter(s => s.classList.contains('reveal'));
    if (sibs.length > 1) el.style.setProperty('--delay', (sibs.indexOf(el) * 70) + 'ms');
  });

  /* цифры: свечение тянется за курсором */
  if (!reduced) $$('.number').forEach(card => {
    let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
    const step = () => { gx += (tx - gx) * .12; gy += (ty - gy) * .12; card.style.setProperty('--glow-x', gx.toFixed(1)); card.style.setProperty('--glow-y', gy.toFixed(1)); raf = (Math.abs(tx - gx) > .08 || Math.abs(ty - gy) > .08) ? requestAnimationFrame(step) : 0; };
    const wake = () => { if (!raf) raf = requestAnimationFrame(step); };
    card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); tx = (e.clientX - r.left - r.width / 2) * .22; ty = (e.clientY - r.top - r.height / 2) * .22; wake(); });
    card.addEventListener('mouseleave', () => { tx = 0; ty = 0; wake(); });
  });

  /* появление по скроллу + счётчики */
  const countUp = el => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (reduced || !Number.isFinite(end)) { el.textContent = end + suffix; return; }
    const t0 = performance.now(), dur = 2000;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(end * e) + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (reduced || !('IntersectionObserver' in window)) {
    $$('.reveal').forEach(n => n.classList.add('is-visible'));
    $$('[data-count]').forEach(countUp);
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .16, rootMargin: '0px 0px -7% 0px' });
    $$('.reveal').forEach(n => io.observe(n));
    $$('[data-count]').forEach(n => { n.textContent = '0'; });
    const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting || e.boundingClientRect.top < 0) { countUp(e.target); cio.unobserve(e.target); } }), { threshold: .6 });
    $$('[data-count]').forEach(n => cio.observe(n));
  }

  /* текст + кадр: карусель слайдов */
  $$('[data-feature]').forEach(box => {
    const slides = $$('[data-slide]', box), prev = $('[data-prev]', box), next = $('[data-next]', box);
    let i = 0;
    const go = n => {
      i = Math.max(0, Math.min(slides.length - 1, n));
      box.style.setProperty('--slide', i);
      slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
      if (prev) prev.disabled = i === 0; if (next) next.disabled = i === slides.length - 1;
    };
    prev?.addEventListener('click', () => go(i - 1)); next?.addEventListener('click', () => go(i + 1));
    box.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });
    go(0);
  });

  /* лента с прокруткой: стрелки в заголовке секции */
  $$('[data-feed]').forEach(box => {
    const track = $('[data-track]', box), prev = $('[data-prev]', box), next = $('[data-next]', box);
    if (!track) return;
    const amount = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 24;
    const update = () => { if (prev) prev.disabled = track.scrollLeft < 4; if (next) next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4; };
    prev?.addEventListener('click', () => track.scrollBy({ left: -amount(), behavior: reduced ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: amount(), behavior: reduced ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  /* табы: [data-tabs] > [data-tab=id] и [data-tab-panel=id] */
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[data-tab]', box), panels = $$('[data-tab-panel]', box);
    const show = id => { tabs.forEach(t => t.classList.toggle('is-on', t.dataset.tab === id)); panels.forEach(p => { p.hidden = p.dataset.tabPanel !== id; }); };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
    show((tabs.find(t => t.classList.contains('is-on')) || tabs[0])?.dataset.tab);
  });

  /* вопросы и ответы: открыт один */
  $$('[data-faq]').forEach(faq => $$('.faq__item', faq).forEach(item => {
    const btn = $('button', item);
    btn?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq__item', faq).forEach(o => { o.classList.remove('is-open'); $('button', o)?.setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  }));

  /* дропдаун: [data-dropdown] > select — кнопка со значением и список вариантов, select скрыт и хранит значение; select[multiple] — несколько ответов, список не закрывается, галочки в aria-selected */
  $$('[data-dropdown]').forEach(box => {
    const sel = $('select', box); if (!sel) return;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dropdown__button'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    const list = document.createElement('ul'); list.className = 'dropdown__list'; list.setAttribute('role', 'listbox'); list.hidden = true;
    const multi = sel.multiple; if (multi) list.setAttribute('aria-multiselectable', 'true');
    const opts = [...sel.options].filter(o => o.value !== '');
    const placeholder = sel.dataset.placeholder || (sel.querySelector('option[value=""]') || {}).textContent || 'Не выбрано';
    const render = () => { const chosen = [...sel.selectedOptions].filter(o => o.value !== ''); const empty = !chosen.length; btn.textContent = empty ? placeholder : chosen.map(o => o.textContent).join(', '); btn.classList.toggle('is-empty', empty); $$('li', list).forEach(li => li.setAttribute('aria-selected', String(chosen.some(o => o.value === li.dataset.value)))); };
    opts.forEach(o => { const li = document.createElement('li'); li.setAttribute('role', 'option'); li.dataset.value = o.value; li.textContent = o.textContent; li.addEventListener('click', () => { if (multi) o.selected = !o.selected; else sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); if (!multi) { close(); btn.focus(); } }); list.appendChild(li); });
    const open = () => { box.classList.add('is-open'); list.hidden = false; btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { box.classList.remove('is-open'); list.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => list.hidden ? open() : close());
    box.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); btn.focus(); } });
    document.addEventListener('click', e => { if (!box.contains(e.target)) close(); });
    sel.addEventListener('change', render);
    box.append(btn, list); render();
  });

  /* подсказки ⓘ: на тач-экранах открываются тапом, закрываются тапом мимо */
  $$('.info').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const on = !b.classList.contains('is-on'); $$('.info.is-on').forEach(o => o.classList.remove('is-on')); if (on) b.classList.add('is-on'); }));
  document.addEventListener('click', e => { if (!e.target.closest('.info')) $$('.info.is-on').forEach(o => o.classList.remove('is-on')); });

  /* тарифы: голубая обводка переходит на карточку под курсором (как форматы на главной) */
  $$('[data-offers]').forEach(box => { const cards = $$('.offer', box); cards.forEach(c => c.addEventListener('mouseenter', () => cards.forEach(o => o.classList.toggle('offer--featured', o === c)))); });

  /* карта: [data-ymap="lat,lng"] — Яндекс Карта 2.1; data-pin — фирменная метка с подписью data-label; ключ — data-apikey (без ключа API работает с ограничениями) */
  $$('[data-ymap]').forEach(el => {
    const [lat, lng] = el.dataset.ymap.split(',').map(Number), zoom = Number(el.dataset.zoom || 15);
    const init = () => ymaps.ready(() => {
      const map = new ymaps.Map(el, { center: [lat, lng], zoom, controls: [] }, { suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true });
      map.controls.add('zoomControl', { position: { right: 16, top: 16 }, size: 'small' });
      map.behaviors.disable('scrollZoom');
      if (el.dataset.pin === undefined) return; /* фирменная метка — только с data-pin */
      const pin = ymaps.templateLayoutFactory.createClass('<div class="map__pin map__pin--live"><i></i>' + (el.dataset.label || '') + '</div>');
      map.geoObjects.add(new ymaps.Placemark([lat, lng], {}, { iconLayout: pin, iconOffset: [0, 0], iconShape: { type: 'Circle', coordinates: [0, 0], radius: 20 } }));
    });
    if (window.ymaps) return init();
    const s = document.createElement('script');
    s.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU' + (el.dataset.apikey ? '&apikey=' + el.dataset.apikey : '');
    s.onload = init; document.head.appendChild(s);
  });

  /* форма: демо-отправка; обработчик подключают разработчики */
  $$('[data-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const status = $('[data-status]', form);
    if (status) status.textContent = 'Спасибо! Свяжемся в течение двух рабочих дней';
    form.reset();
  }));
})();
