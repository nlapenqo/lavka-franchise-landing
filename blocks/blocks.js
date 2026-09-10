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

  /* вопросы и ответы: открыт один */
  $$('[data-faq]').forEach(faq => $$('.faq__item', faq).forEach(item => {
    const btn = $('button', item);
    btn?.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq__item', faq).forEach(o => { o.classList.remove('is-open'); $('button', o)?.setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  }));

  /* форма: демо-отправка; обработчик подключают разработчики */
  $$('[data-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const status = $('[data-status]', form);
    if (status) status.textContent = 'Спасибо! Свяжемся в течение двух рабочих дней';
    form.reset();
  }));
})();
