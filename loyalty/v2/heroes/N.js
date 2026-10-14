/* N, Подарочная коробка: масштаб сцены под колонку, пауза покачивания вне экрана,
   курсор слегка поворачивает коробку (только мышь, без prefers-reduced-motion) */
(() => {
  const sec = document.querySelector('.h-n');
  if (!sec) return;
  const stage = sec.querySelector('.h-n__stage'), fitEl = sec.querySelector('.h-n__fit');
  /* кадр сцены 660×780 (на телефоне по CSS 700×660); вписываем в колонку, не крупнее 1,12 */
  const fit = () => {
    const r = stage.getBoundingClientRect(); if (!r.width || !r.height) return;
    const k = Math.min(1.12, r.width / fitEl.offsetWidth, r.height / fitEl.offsetHeight);
    stage.style.setProperty('--k', Math.max(.3, k).toFixed(3));
  };
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage); else addEventListener('resize', fit);
  fit();
  /* скрытая секция (display:none) и секция вне экрана не пересекаются с вьюпортом — покачивание стоит */
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { sec.classList.toggle('is-run', e.isIntersecting); if (e.isIntersecting) fit(); })).observe(sec);
  else sec.classList.add('is-run');

  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const RY0 = -32, RX0 = -23; // база — как --ry0/--rx0 в N.css
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const tick = () => {
    x += (tx - x) * .06; y += (ty - y) * .06;
    stage.style.setProperty('--ry', (RY0 + x * 10).toFixed(2) + 'deg');
    stage.style.setProperty('--rx', (RX0 - y * 6).toFixed(2) + 'deg');
    raf = Math.abs(tx - x) + Math.abs(ty - y) > .002 ? requestAnimationFrame(tick) : 0;
  };
  sec.addEventListener('pointermove', e => {
    if (!sec.classList.contains('is-run')) return;
    const r = sec.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2));
    ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2));
    raf ||= requestAnimationFrame(tick);
  });
  sec.addEventListener('pointerleave', () => { tx = 0; ty = 0; raf ||= requestAnimationFrame(tick); });
})();
