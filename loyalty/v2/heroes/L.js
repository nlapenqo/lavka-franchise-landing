/* L, «Город из стопок»: очередь появления стопок и карточек, параллакс по глубине от курсора, пауза вне экрана */
(() => {
  const sec = document.querySelector('.h-l');
  if (!sec) return;
  const city = sec.querySelector('[data-l-city]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* стопки строятся от дальнего ряда к ближнему и от центра к краям; карточка встаёт, когда легла последняя монета */
  city.querySelectorAll('.h-l__s').forEach(s => {
    const z = parseFloat(s.style.getPropertyValue('--z')), x = parseFloat(s.style.getPropertyValue('--x')), n = +s.style.getPropertyValue('--n');
    const d0 = .3 + (z - .4) * .9 + Math.abs(x - 50) / 50 * .3;
    const step = Math.round(Math.min(70, 1000 / n)) / 1000;
    s.style.setProperty('--d0', d0.toFixed(2) + 's');
    s.style.setProperty('--cd', (d0 + n * step + .7).toFixed(2) + 's');
  });

  /* параллакс: ближние стопки смещаются сильнее дальних (CSS: сдвиг ∝ z²) */
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let raf = 0, px = 0, py = 0;
    const put = () => { raf = 0; city.style.setProperty('--px', px.toFixed(3)); city.style.setProperty('--py', py.toFixed(3)); };
    sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5; raf ||= requestAnimationFrame(put); });
    sec.addEventListener('pointerleave', () => { px = py = 0; raf ||= requestAnimationFrame(put); });
  }

  /* покачивание карточек — только когда хиро показан и на экране */
  let inView = false;
  const sync = () => sec.classList.toggle('is-run', (sec.classList.contains('is-v') || document.body.classList.contains('is-all')) && inView && !document.hidden && !reduced);
  new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: .15 }).observe(sec);
  new MutationObserver(sync).observe(sec, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
})();
