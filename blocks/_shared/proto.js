/* Общий скрипт песочницы: reveal-анимации + каунтеры */

/* .reveal → .is-in при входе во вьюпорт */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Каунтер: <span data-count="600" data-suffix="+" data-dur="1400">0</span> */
const fmt = new Intl.NumberFormat('ru-RU');
const cio = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; cio.unobserve(el);
    const target = parseFloat(el.dataset.count);
    const dur = parseInt(el.dataset.dur || '1400', 10);
    const suffix = el.dataset.suffix || '';
    const dec = (el.dataset.count.split('.')[1] || '').length;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = fmt.format(target) + suffix; return;
    }
    const t0 = performance.now();
    (function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      const val = target * eased;
      el.textContent = fmt.format(dec ? +val.toFixed(dec) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));
