/* Общий motion-слой: появления и одноразовые счётчики. */
(function () {
  const embedded = window.top !== window.self || /[?&]embed=1/.test(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('ru-RU');
  let activated = false;

  function count(el) {
    if (el.dataset.counted === 'true') return;
    el.dataset.counted = 'true';
    const target = parseFloat(el.dataset.count);
    const dur = parseInt(el.dataset.dur || '1300', 10);
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    if (reduced) { el.textContent = fmt.format(target) + suffix; return; }
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = fmt.format(decimals ? +value.toFixed(decimals) : Math.round(value)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  function activate() {
    if (activated) return;
    activated = true;
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
    document.querySelectorAll('[data-count]').forEach(count);
  }

  if (reduced) { activate(); return; }
  if (embedded) {
    addEventListener('message', event => { if (event.data === 'landing:enter') activate(); });
    try { window.parent.postMessage('landing:ready', '*'); } catch (_) {}
    return;
  }

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in'); revealObserver.unobserve(entry.target);
  }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    count(entry.target); countObserver.unobserve(entry.target);
  }), { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));
})();
