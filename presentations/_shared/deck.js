/* Runtime презентации: клавиатура, обзор, полный экран, ссылка на слайд.
   Разметка: .stage > section.slide-item > .slide  */
(function () {
  const stage = document.querySelector('.stage');
  if (!stage) return;
  const slides = [...stage.querySelectorAll('.slide-item')];
  const total = slides.length;
  let cur = 0;

  document.body.classList.add('deck-body');

  // --- HUD ---
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <span class="hud__title">${document.title}</span>
    <span class="hud__spacer"></span>
    <button data-act="prev" aria-label="Назад">←</button>
    <span class="hud__count"><b>1</b> / ${total}</span>
    <button data-act="next" aria-label="Вперёд">→</button>
    <button data-act="overview">Все слайды</button>
    <button data-act="full">Во весь экран</button>`;
  document.body.appendChild(hud);

  const bar = document.createElement('div');
  bar.className = 'progress';
  bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);

  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.innerHTML = '<b>←</b> <b>→</b> листать · <b>O</b> все слайды · <b>F</b> во весь экран';
  document.body.appendChild(hint);
  setTimeout(() => hint.classList.add('is-gone'), 4200);

  const countEl = hud.querySelector('.hud__count b');
  const prevBtn = hud.querySelector('[data-act="prev"]');
  const nextBtn = hud.querySelector('[data-act="next"]');

  // --- Масштаб слайда под окно ---
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty('--scale', s);
    document.querySelectorAll('.ov-cell').forEach(c =>
      c.style.setProperty('--ov-scale', c.clientWidth / 1920));
  }

  function show(i, push) {
    cur = Math.max(0, Math.min(total - 1, i));
    slides.forEach((s, n) => s.classList.toggle('is-current', n === cur));
    countEl.textContent = cur + 1;
    bar.style.setProperty('--p', total > 1 ? cur / (total - 1) : 1);
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === total - 1;
    document.querySelectorAll('.ov-cell').forEach((c, n) =>
      c.classList.toggle('is-current', n === cur));
    if (push !== false) history.replaceState(null, '', '#' + (cur + 1));
  }

  // --- Обзор ---
  const ov = document.createElement('div');
  ov.className = 'overview';
  ov.innerHTML = `<div class="overview__head"><b>${document.title}</b><span>${total} слайдов · кликните, чтобы перейти</span></div><div class="overview__grid"></div>`;
  document.body.appendChild(ov);
  const grid = ov.querySelector('.overview__grid');
  slides.forEach((s, n) => {
    const cell = document.createElement('div');
    cell.className = 'ov-cell';
    cell.innerHTML = `<span class="ov-cell__num">${n + 1}</span>`;
    cell.appendChild(s.querySelector('.slide').cloneNode(true));
    cell.addEventListener('click', () => { toggleOverview(false); show(n); });
    grid.appendChild(cell);
  });

  function toggleOverview(force) {
    const open = force !== undefined ? force : !ov.classList.contains('is-open');
    ov.classList.toggle('is-open', open);
    document.body.classList.toggle('is-overview', open);
    if (open) fit();
  }

  // --- Управление ---
  hud.addEventListener('click', e => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'prev') show(cur - 1);
    if (act === 'next') show(cur + 1);
    if (act === 'overview') toggleOverview();
    if (act === 'full') toggleFull();
  });

  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); show(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); show(cur - 1); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(total - 1);
    else if (k === 'Escape') toggleOverview(false);
    else if (k === 'o' || k === 'O' || k === 'щ' || k === 'Щ') toggleOverview();
    else if (k === 'f' || k === 'F' || k === 'а' || k === 'А') toggleFull();
  });

  // Показывать HUD при движении мыши
  let hideTimer;
  document.addEventListener('mousemove', () => {
    hud.classList.add('is-shown');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hud.classList.remove('is-shown'), 2600);
  });

  window.addEventListener('resize', fit);
  fit();
  show(Math.max(0, (parseInt(location.hash.slice(1), 10) || 1) - 1), false);
})();
