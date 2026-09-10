/* ============================================================
   ДИЗАЙН-СИСТЕМА ЛЕНДИНГОВ ЯНДЕКС ЛАВКИ · kit.js
   Вся интерактивность блоков. Каждый модуль включается по data-атрибуту,
   ничего не ломается, если блока на странице нет.
   Тайминги и физика — из site/app.js и events/prototype.html.
   ============================================================ */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* --- амбиент-свечение: дрейф только у видимых секций + импульс от скорости скролла --- */
  const ambient = $$('[data-ambient]');
  if (reduced) ambient.forEach(s => s.classList.add('is-ambient-active'));
  else if (ambient.length) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-ambient-active', e.isIntersecting)), { rootMargin: '20% 0px' });
    ambient.forEach(s => io.observe(s));
    let lastY = scrollY, lastT = performance.now(), vel = 0;
    const impulse = [[-80, 90], [72, -110], [96, 72]];
    const tick = now => {
      const dt = Math.max(16, now - lastT);
      const raw = Math.max(-1, Math.min(1, (scrollY - lastY) / dt / 1.15));
      vel += (raw - vel) * (Math.abs(raw) > Math.abs(vel) ? .22 : .08);
      lastY = scrollY; lastT = now;
      const stretch = Math.abs(vel);
      ambient.forEach(s => {
        if (!s.classList.contains('is-ambient-active')) return;
        const gain = parseFloat(s.dataset.ambientGain || '1');
        $$('.ambient-glow', s).forEach((g, i) => {
          const v = impulse[i] || impulse[0];
          g.style.setProperty('--ambient-ix', vel * v[0] * gain + 'px');
          g.style.setProperty('--ambient-iy', vel * v[1] * gain + 'px');
          g.style.setProperty('--ambient-sx', String(1 + stretch * .13 * gain));
          g.style.setProperty('--ambient-sy', String(1 - stretch * .07 * gain));
        });
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* --- шапка: стеклянная после 90px (два порога — без дребезга) --- */
  const hdr = $('[data-hdr]');
  if (hdr) {
    let solid = scrollY > 90, frame = 0;
    const apply = () => {
      frame = 0;
      if (!solid && scrollY > 110) solid = true; else if (solid && scrollY < 55) solid = false;
      hdr.classList.toggle('is-solid', solid);
    };
    addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(apply); }, { passive: true });
    apply();
  }
  /* мобильное меню */
  const menu = $('[data-menu]'), burger = $('[data-burger]');
  const closeMenu = () => { document.body.classList.remove('menu-open'); menu?.classList.remove('is-open'); burger?.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    document.body.classList.toggle('menu-open', open); menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* --- хиро: стаггер слов при появлении в кадре, вращающееся слово --- */
  $$('[data-hero]').forEach(hero => {
    const live = () => requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-live')));
    if (reduced || !('IntersectionObserver' in window)) live();
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { live(); io.disconnect(); } }), { threshold: .25 }); io.observe(hero); }
  });
  $$('[data-rot]').forEach(rot => {
    const words = (rot.dataset.rot || '').split('|').filter(Boolean);
    if (!words.length) return;
    rot.innerHTML = words.map((w, i) => `<span class="rot__w${i ? '' : ' is-cur'}">${w}</span>`).join('');
    const spans = $$('.rot__w', rot);
    const fit = () => { rot.style.width = Math.max(...spans.map(s => s.offsetWidth)) + 'px'; };
    document.fonts?.ready.then(fit); fit();
    if (reduced || words.length < 2) return;
    let cur = 0;
    const next = () => {
      spans[cur].classList.replace('is-cur', 'is-out');
      const prev = cur; cur = (cur + 1) % spans.length;
      spans[cur].classList.add('is-cur');
      setTimeout(() => spans[prev].classList.remove('is-out'), 1200);
      setTimeout(next, 2600);
    };
    setTimeout(next, 2400);
  });

  /* --- появление по скроллу + счётчики (стартуют, когда цифра на 60% в кадре) --- */
  const countUp = el => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const end = Number(el.dataset.count), suf = el.dataset.suffix || '';
    if (reduced || !Number.isFinite(end)) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 2000;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = $$('[data-count]');
  if (reduced || !('IntersectionObserver' in window)) {
    $$('.reveal').forEach(n => n.classList.add('is-visible'));
    counters.forEach(countUp);
  } else {
    const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); rio.unobserve(e.target); } }), { threshold: .16, rootMargin: '0px 0px -7% 0px' });
    $$('.reveal').forEach(n => rio.observe(n));
    counters.forEach(n => { n.textContent = '0'; });
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) countUp(e.target);
      else if (e.boundingClientRect.top < 0) { e.target.dataset.done = '1'; e.target.textContent = e.target.dataset.count + (e.target.dataset.suffix || ''); }
      else return;
      cio.unobserve(e.target);
    }), { threshold: .6 });
    counters.forEach(n => cio.observe(n));
  }

  /* --- заявление: слова проявляются по очереди --- */
  $$('[data-statement]').forEach(p => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          const w = document.createElement('span'); w.className = 'aw'; w.style.setProperty('--i', i++); w.textContent = tok; frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(p);
    if (reduced) { p.classList.add('is-in'); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { p.classList.add('is-in'); io.disconnect(); } }), { threshold: .4 });
    io.observe(p);
  });

  /* --- текст + медиа: карусель --- */
  $$('[data-split]').forEach(split => {
    const slides = () => $$('[data-slide]', split).filter(s => !s.hidden), prev = $('[data-prev]', split), next = $('[data-next]', split);
    let i = 0;
    const go = n => {
      const list = slides();
      i = Math.max(0, Math.min(list.length - 1, n));
      split.style.setProperty('--slide', i);
      list.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== i)));
      if (prev) prev.disabled = i === 0; if (next) next.disabled = i === list.length - 1;
    };
    prev?.addEventListener('click', () => go(i - 1)); next?.addEventListener('click', () => go(i + 1));
    split.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });
    go(0);
  });

  /* --- отзывы: лента со стрелками --- */
  $$('[data-reviews]').forEach(box => {
    const track = $('[data-track]', box), prev = $('[data-prev]', box), next = $('[data-next]', box);
    const amount = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 20;
    const update = () => { prev.disabled = track.scrollLeft < 4; next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4; };
    prev.addEventListener('click', () => track.scrollBy({ left: -amount(), behavior: reduced ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: amount(), behavior: reduced ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    track.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') prev.click(); if (e.key === 'ArrowRight') next.click(); });
    update();
  });

  /* --- FAQ: аккордеон, открыт один --- */
  $$('[data-accordion]').forEach(acc => $$('article', acc).forEach(item => {
    const btn = $('button', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('article', acc).forEach(o => { o.classList.remove('is-open'); $('button', o).setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  }));

  /* --- шаги: клик по створке раскрывает её, пройденные — с галочкой --- */
  $$('[data-steps]').forEach(box => {
    const steps = () => $$('.step', box).filter(s => !s.hidden), odo = $('[data-steps-cur]', box), total = $('[data-steps-total]', box), bar = $('[data-steps-bar]', box);
    const set = n => {
      const list = steps();
      list.forEach((s, k) => { s.classList.toggle('is-active', k === n); s.classList.toggle('is-done', k < n || (k === n && n === list.length - 1)); });
      if (odo) odo.textContent = String(n + 1).padStart(2, '0');
      if (total) total.textContent = 'из ' + String(list.length).padStart(2, '0');
      bar?.style.setProperty('--p', (n + 1) / list.length);
    };
    $$('.step', box).forEach(s => $('.step__hit', s)?.addEventListener('click', () => set(steps().indexOf(s))));
    set(0);
  });

  /* --- форматы: голубая обводка идёт за наведением --- */
  $$('[data-offers]').forEach(grid => $$('.ocard', grid).forEach(card => card.addEventListener('mouseenter', () => {
    $$('.ocard', grid).forEach(c => c.classList.remove('ocard--featured')); card.classList.add('ocard--featured');
  })));

  /* --- карточки со свечением: пятно тянется за курсором --- */
  if (!reduced) $$('.glow-card').forEach(card => {
    let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
    const step = () => {
      gx += (tx - gx) * .12; gy += (ty - gy) * .12;
      card.style.setProperty('--glow-x', gx.toFixed(1)); card.style.setProperty('--glow-y', gy.toFixed(1));
      raf = (Math.abs(tx - gx) > .08 || Math.abs(ty - gy) > .08) ? requestAnimationFrame(step) : 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(step); };
    card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); tx = (e.clientX - r.left - r.width / 2) * .22; ty = (e.clientY - r.top - r.height / 2) * .22; wake(); });
    card.addEventListener('mouseleave', () => { tx = 0; ty = 0; wake(); });
  });

  /* --- форма: демо-отправка (в проде — обработчик разработчиков) --- */
  $$('[data-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('[type=submit]', form), status = $('[data-status]', form);
    btn.classList.add('is-loading'); btn.disabled = true;
    setTimeout(() => { btn.classList.remove('is-loading'); btn.disabled = false; if (status) { status.textContent = 'Спасибо! Свяжемся в течение двух рабочих дней'; status.classList.add('is-ok'); } form.reset(); }, 900);
  }));

  /* «скопировать HTML» и остальная механика страницы кита живут в kit-chrome.js — в лендинг не копируются */
})();
