(function () {
  /* EMBED: блок открыт внутри iframe собранного лендинга (landing/) или с ?embed=1 —
     превью-обвязку (соседи-скелетоны, кнопка «назад», menu-scroll) не создаём. */
  const EMBED = window.top !== window.self || /[?&]embed=1/.test(location.search);

  const style = document.createElement('style');
  style.textContent = `
    .preview-neighbor {
      position: relative;
      z-index: 0;
      padding-block: clamp(34px, 5vw, 64px);
      background: var(--bg);
      color: var(--navy);
    }
    .preview-neighbor__container {
      width: 100%;
      max-width: var(--container);
      margin-inline: auto;
      padding-inline: var(--container-pad);
    }
    .preview-neighbor__frame {
      position: relative;
      min-height: clamp(190px, 22vw, 280px);
      display: grid;
      grid-template-rows: auto 1fr;
      gap: clamp(22px, 3vw, 36px);
      padding: clamp(24px, 4vw, 48px);
      overflow: hidden;
      border: 1.5px solid rgba(0, 173, 255, .24);
      border-radius: var(--r-card);
      background: rgba(170, 217, 252, .13);
    }
    .preview-neighbor__frame::after {
      content: "";
      position: absolute;
      width: clamp(90px, 13vw, 180px);
      aspect-ratio: 1;
      right: clamp(-50px, -3vw, -22px);
      top: clamp(-62px, -4vw, -28px);
      border: 1.5px solid rgba(0, 173, 255, .18);
      border-radius: 34%;
      rotate: 18deg;
    }
    .preview-neighbor--bottom .preview-neighbor__frame::after {
      inset: auto auto clamp(-62px, -4vw, -28px) clamp(-50px, -3vw, -22px);
      rotate: -18deg;
    }
    .preview-neighbor__head {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .preview-neighbor__label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font: 500 13px/1 var(--font-geo);
      letter-spacing: .07em;
      text-transform: uppercase;
      color: var(--text-dim);
    }
    .preview-neighbor__label::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--blue);
      box-shadow: 0 0 0 6px rgba(0, 173, 255, .11);
    }
    .preview-neighbor__direction {
      padding: 7px 11px;
      border: 1px solid rgba(0, 173, 255, .2);
      border-radius: var(--r-pill);
      font: 500 12px/1 var(--font-text);
      color: var(--text-dim);
      background: rgba(255, 255, 255, .48);
    }
    .preview-neighbor__skeleton {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(180px, .8fr);
      gap: clamp(16px, 2.5vw, 30px);
      align-items: stretch;
      opacity: .8;
    }
    .preview-neighbor__copy,
    .preview-neighbor__cards span {
      border: 1.5px solid rgba(62, 136, 197, .18);
      background: rgba(255, 255, 255, .42);
    }
    .preview-neighbor__copy {
      min-height: 92px;
      display: grid;
      align-content: center;
      gap: 12px;
      padding: 20px;
      border-radius: var(--r-card-sm);
    }
    .preview-neighbor__copy::before,
    .preview-neighbor__copy::after {
      content: "";
      display: block;
      height: 10px;
      border-radius: var(--r-pill);
      background: rgba(62, 136, 197, .15);
    }
    .preview-neighbor__copy::before { width: min(72%, 420px); }
    .preview-neighbor__copy::after { width: min(46%, 250px); }
    .preview-neighbor__cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .preview-neighbor__cards span {
      min-height: 92px;
      border-radius: var(--r-card-sm);
    }
    .preview-neighbor__cards span:last-child {
      background: rgba(170, 217, 252, .24);
    }
    .preview-back {
      position: fixed;
      z-index: 5000;
      top: 16px;
      left: 16px;
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(27, 58, 106, .1);
      border-radius: 50%;
      color: var(--navy);
      background: rgba(255, 255, 255, .94);
      box-shadow: 0 8px 28px rgba(27, 58, 106, .16);
      backdrop-filter: blur(10px);
      transition: transform var(--dur-fast) var(--ease-out), background var(--dur-fast), box-shadow var(--dur-fast);
    }
    .preview-back:hover {
      transform: translateX(-3px);
      background: var(--bg);
      box-shadow: 0 12px 34px rgba(27, 58, 106, .22);
    }
    .preview-back:focus-visible {
      outline: 3px solid rgba(0, 173, 255, .45);
      outline-offset: 3px;
    }
    .preview-back svg { width: 24px; height: 24px; }
    .preview-shell--menu .preview-back { top: 100px; }
    @media (max-width: 640px) {
      .preview-neighbor { padding-block: 24px; }
      .preview-neighbor__frame { min-height: 210px; padding: 22px; gap: 18px; border-radius: 24px; }
      .preview-neighbor__direction { display: none; }
      .preview-neighbor--top .preview-neighbor__head { padding-left: 44px; }
      .preview-neighbor__skeleton { grid-template-columns: 1fr; }
      .preview-neighbor__copy { min-height: 72px; }
      .preview-neighbor__cards span { min-height: 54px; }
      .preview-back { top: 12px; left: 12px; width: 48px; height: 48px; }
      .preview-shell--menu .preview-neighbor--top { padding-top: 92px; }
      .preview-shell--menu .preview-back { top: 94px; }
    }
  `;
  document.head.append(style);

  Array.from(document.body.children).forEach((node) => {
    const isLegacyPlaceholder = node.matches('.ghost, .context, .before') && /соседний\s+блок/i.test(node.textContent);
    if (isLegacyPlaceholder) node.remove();
  });

  function createNeighbor(position) {
    const isTop = position === 'top';
    const section = document.createElement('section');
    section.className = `preview-neighbor preview-neighbor--${position}`;
    section.setAttribute('aria-label', isTop ? 'Контекст предыдущего блока' : 'Контекст следующего блока');
    section.innerHTML = `
      <div class="preview-neighbor__container">
        <div class="preview-neighbor__frame">
          <div class="preview-neighbor__head">
            <span class="preview-neighbor__label">Другой блок страницы</span>
            <span class="preview-neighbor__direction">${isTop ? 'выше текущего' : 'ниже текущего'}</span>
          </div>
          <div class="preview-neighbor__skeleton" aria-hidden="true">
            <span class="preview-neighbor__copy"></span>
            <span class="preview-neighbor__cards"><span></span><span></span></span>
          </div>
        </div>
      </div>`;
    return section;
  }

  const back = document.createElement('a');
  back.className = 'preview-back';
  back.href = '../index.html?preview-return=1';
  back.setAttribute('aria-label', 'Вернуться к вариантам блоков');
  back.title = 'Назад к вариантам';
  back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/><path d="M9 12h10"/></svg>';

  if (!EMBED) {
    const topNeighbor = createNeighbor('top');
    document.body.prepend(topNeighbor);
    document.body.append(createNeighbor('bottom'));
    document.body.append(back);

    if (document.title.startsWith('01 ·')) {
      document.body.classList.add('preview-shell--menu');
      const menuHead = document.querySelector('[data-head]');
      const syncMenuPreview = () => {
        const contextHeight = topNeighbor.offsetHeight;
        const beforeMenu = scrollY < contextHeight - 20;
        document.body.classList.toggle('preview-shell--before-menu', beforeMenu);
        if (menuHead) menuHead.classList.toggle('is-solid', beforeMenu || scrollY > contextHeight + 90);
      };
      addEventListener('scroll', syncMenuPreview, { passive: true });
      addEventListener('resize', syncMenuPreview, { passive: true });
      syncMenuPreview();
    }
  }
})();
