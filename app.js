(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-mobile-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  /* Двигаем только видимые Figma-glow слои: мягко для глаза и дешевле для GPU. */
  const ambientSections = document.querySelectorAll('[data-ambient]');
  if (reduced) {
    ambientSections.forEach(section => section.classList.add('is-ambient-active'));
  } else {
    const ambientObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-ambient-active', entry.isIntersecting));
    }, { rootMargin: '20% 0px' });
    ambientSections.forEach(section => ambientObserver.observe(section));

    let ambientLastY = scrollY;
    let ambientLastTime = performance.now();
    let ambientVelocity = 0;
    const impulse = [[-80, 90], [72, -110], [96, 72]];
    const updateAmbientMotion = now => {
      const elapsed = Math.max(16, now - ambientLastTime);
      const raw = Math.max(-1, Math.min(1, (scrollY - ambientLastY) / elapsed / 1.15));
      ambientVelocity += (raw - ambientVelocity) * (Math.abs(raw) > Math.abs(ambientVelocity) ? .22 : .08);
      ambientLastY = scrollY;
      ambientLastTime = now;
      const stretch = Math.abs(ambientVelocity);
      ambientSections.forEach(section => {
        if (!section.classList.contains('is-ambient-active')) return;
        const motionGain = section.classList.contains('hero')
          ? 1.35
          : section.classList.contains('steps') ? .5 : 1;
        section.querySelectorAll('.ambient-glow').forEach((glow, index) => {
          const vector = impulse[index] || impulse[0];
          glow.style.setProperty('--ambient-ix', `${ambientVelocity * vector[0] * motionGain}px`);
          glow.style.setProperty('--ambient-iy', `${ambientVelocity * vector[1] * motionGain}px`);
          glow.style.setProperty('--ambient-sx', String(1 + stretch * .13 * motionGain));
          glow.style.setProperty('--ambient-sy', String(1 - stretch * .07 * motionGain));
        });
      });
      requestAnimationFrame(updateAmbientMotion);
    };
    requestAnimationFrame(updateAmbientMotion);
  }

  /* Hero: та же пословная подача и тот же 3D-барабан, что в center-4. */
  const heroTitle = document.querySelector('[data-hero-title]');
  requestAnimationFrame(() => requestAnimationFrame(() => heroTitle?.classList.add('is-live')));

  const cityRot = document.querySelector('[data-city-rot]');
  if (cityRot) {
    const cities = ['в\u00A0Казани', 'в\u00A0Самаре', 'в\u00A0Уфе', 'в\u00A0Тюмени', 'в\u00A0Ижевске', 'в\u00A0своём городе'];
    const home = cities.length - 1;
    const hold = 2400;
    const holdHome = 4400;
    const start = 1400;
    const words = cities.map(text => {
      const word = document.createElement('span');
      word.className = 'city-rot__word';
      word.textContent = text;
      cityRot.append(word);
      return word;
    });
    let current = reduced ? home : 0;
    /* Ширина барабана — по самому длинному городу и без анимации: слово стоит в центре строки,
       а плавно меняющаяся ширина контейнера двигала его слой субпиксельно — отсюда дрожь в конце смены */
    const setWidth = () => { cityRot.style.width = `${Math.max(...words.map(word => word.offsetWidth))}px`; };
    words[current].classList.add('is-cur');
    setWidth();
    document.fonts?.ready?.then(setWidth);
    addEventListener('resize', setWidth, { passive: true });

    const nextCity = () => {
      const previous = current;
      current = (current + 1) % cities.length;
      words[previous].classList.remove('is-cur');
      words[previous].classList.add('is-out');
      const word = words[current];
      word.classList.remove('is-out');
      void word.offsetWidth;
      word.classList.add('is-cur');
      setTimeout(() => words[previous].classList.remove('is-out'), 1250);
      setTimeout(nextCity, current === home ? holdHome : hold);
    };
    if (!reduced) setTimeout(nextCity, start);
  }

  /* Два порога не дают glass-состоянию дребезжать при скролле около точки включения. */
  let headerSolid = scrollY > 90;
  let headerFrame = 0;
  const applyHeader = () => {
    headerFrame = 0;
    if (!header) return;
    if (!headerSolid && scrollY > 110) headerSolid = true;
    else if (headerSolid && scrollY < 55) headerSolid = false;
    header.classList.toggle('is-solid', headerSolid);
  };
  const updateHeader = () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(applyHeader);
  };
  addEventListener('scroll', updateHeader, { passive: true });
  applyHeader();

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    menu?.classList.remove('is-open');
    menu?.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
  };
  menuToggle?.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    document.body.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const animateCounter = element => {
    if (element.dataset.done) return;
    element.dataset.done = 'true';
    const end = Number(element.dataset.count);
    if (reduced || !Number.isFinite(end)) return;
    const started = performance.now();
    const duration = 2000;
    const tick = now => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = String(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal').forEach(node => revealObserver.observe(node));

  // Счётчики стартуют, только когда карточка на 60% в кадре (не при загрузке)
  const counters = [...document.querySelectorAll('[data-count]')];
  if (!reduced) counters.forEach(node => { node.textContent = '0'; });
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
      } else if (entry.boundingClientRect.top < 0) {
        // карточку проскочили быстрым скроллом — показываем итог без анимации
        entry.target.dataset.done = 'true';
        entry.target.textContent = entry.target.dataset.count;
      } else return;
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: .6 });
  counters.forEach(node => counterObserver.observe(node));

  // Свечение карточек цифр: тянется к курсору с ленивым догоном
  if (!reduced && matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.number-card').forEach(card => {
      let targetX = 0, targetY = 0, glowX = 0, glowY = 0, raf = 0;
      const step = () => {
        glowX += (targetX - glowX) * .085;
        glowY += (targetY - glowY) * .085;
        card.style.setProperty('--glow-x', glowX.toFixed(2));
        card.style.setProperty('--glow-y', glowY.toFixed(2));
        raf = (Math.abs(targetX - glowX) > .08 || Math.abs(targetY - glowY) > .08) ? requestAnimationFrame(step) : 0;
      };
      const wake = () => { if (!raf) raf = requestAnimationFrame(step); };
      card.addEventListener('pointermove', event => {
        const box = card.getBoundingClientRect();
        targetX = ((event.clientX - box.left) / box.width - .5) * 44;
        targetY = ((event.clientY - box.top) / box.height - .5) * 26;
        wake();
      });
      card.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; wake(); });
    });
  }

  const businessCarousel = document.querySelector('[data-business-carousel]');
  if (businessCarousel) {
    const businessSlides = [...businessCarousel.querySelectorAll('[data-business-slide]')];
    const businessPrev = businessCarousel.querySelector('[data-business-prev]');
    const businessNext = businessCarousel.querySelector('[data-business-next]');
    let businessCurrent = 0;
    let businessPointerStart = null;

    const setBusinessSlide = index => {
      businessCurrent = Math.max(0, Math.min(businessSlides.length - 1, index));
      businessCarousel.style.setProperty('--business-slide', businessCurrent);
      businessSlides.forEach((slide, slideIndex) => {
        const hidden = slideIndex !== businessCurrent;
        slide.setAttribute('aria-hidden', String(hidden));
        slide.inert = hidden;
      });
      businessPrev.disabled = businessCurrent === 0;
      businessNext.disabled = businessCurrent === businessSlides.length - 1;
    };

    businessPrev.addEventListener('click', () => setBusinessSlide(businessCurrent - 1));
    businessNext.addEventListener('click', () => setBusinessSlide(businessCurrent + 1));
    businessCarousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); setBusinessSlide(businessCurrent - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); setBusinessSlide(businessCurrent + 1); }
      if (event.key === 'Home') { event.preventDefault(); setBusinessSlide(0); }
      if (event.key === 'End') { event.preventDefault(); setBusinessSlide(businessSlides.length - 1); }
    });
    businessCarousel.addEventListener('pointerdown', event => { businessPointerStart = event.clientX; }, { passive: true });
    businessCarousel.addEventListener('pointerup', event => {
      if (businessPointerStart === null) return;
      const delta = event.clientX - businessPointerStart;
      businessPointerStart = null;
      if (Math.abs(delta) > 55) setBusinessSlide(businessCurrent + (delta < 0 ? 1 : -1));
    }, { passive: true });
    businessCarousel.addEventListener('pointercancel', () => { businessPointerStart = null; }, { passive: true });
    setBusinessSlide(0);
  }

  const zones = {
    kitchen: ['01', 'Кухня', 'Здесь повара готовят горячую еду из\u00A0полуфабрикатов\u00A0— на\u00A0одно блюдо уходит около 7\u00A0минут. Готовую еду повара передают кладовщикам, которые собирают весь заказ'],
    storage: ['02', 'Склад с\u00A0продуктами', 'Полки с\u00A0тысячами товаров\u00A0— с\u00A0помощью наших технологий кладовщики собирают любой заказ за\u00A0несколько минут'],
    dispatch: ['03', 'Зона выдачи заказа', 'Здесь кладовщик передаёт курьеру собранные заказы для\u00A0клиентов'],
    loading: ['04', 'Зона погрузки', 'Благодаря автозаказу в\u00A0Лавку регулярно привозят необходимые товары от\u00A0проверенных поставщиков'],
    cold: ['05', 'Холодильные камеры', 'Температурный режим под\u00A0постоянным контролем, что гарантирует минимальный уровень списаний и\u00A0свежий товар'],
    waiting: ['06', 'Зона ожидания заказа', 'Здесь курьеры ожидают заказы. Они получают их сразу после сборки и\u00A0отвозят клиенту за\u00A0установленное в\u00A0приложении время'],
    freezer: ['07', 'Морозильная камера', 'Отдельный температурный режим для\u00A0заморозки. Кладовщик собирает такие товары последними, чтобы заказ доехал без\u00A0потери качества']
  };
  const mapStage = document.querySelector('[data-map-stage]');
  const mapWorld = document.querySelector('[data-map-world]');
  const zoneCard = document.querySelector('[data-zone-card]');
  const hotspots = [...document.querySelectorAll('[data-zone]')];
  const ZOOM = 2.2;
  let activeZone = 'kitchen';
  let swapTimer = 0;
  const fillZone = data => {
    zoneCard.querySelector('[data-zone-number]').textContent = data[0];
    zoneCard.querySelector('[data-zone-title]').textContent = data[1];
    zoneCard.querySelector('[data-zone-text]').textContent = data[2];
  };
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const view = { x: 0, y: 0 };
  // Пределы сдвига: картинка не отрывается от краёв сцены, справа всегда остаётся
  // видимой хотя бы часть под карточкой зоны — дальше утащить нельзя.
  const panLimits = () => {
    const w = mapStage.clientWidth;
    const h = mapStage.clientHeight;
    const pic = { l: .061 * w, r: .9476 * w, t: .1818 * h, b: .8883 * h };
    return {
      minX: w * .63 - pic.r * ZOOM, maxX: -pic.l * ZOOM,
      minY: h - pic.b * ZOOM, maxY: -pic.t * ZOOM
    };
  };
  const applyView = () => {
    mapWorld.style.transform = `translate(${view.x}px, ${view.y}px) scale(${ZOOM})`;
  };
  const zoomTo = button => {
    if (!mapWorld || !mapStage) return;
    if (reduced || innerWidth <= 820) { mapWorld.style.transform = ''; mapStage.style.setProperty('--z', 1); return; }
    const w = mapStage.clientWidth;
    const h = mapStage.clientHeight;
    const px = parseFloat(button.style.getPropertyValue('--x')) / 100 * w;
    const py = parseFloat(button.style.getPropertyValue('--y')) / 100 * h;
    // Точка зоны едет в центр свободной от карточки области (левые ~63% сцены),
    // но картинку стараемся не отрывать от краёв сцены и от карточки.
    const lim = panLimits();
    let tx = clamp(w * .315 - px * ZOOM, lim.minX, lim.maxX);
    let ty = clamp(h * .5 - py * ZOOM, lim.minY, lim.maxY);
    // Сама точка при этом должна остаться в безопасной зоне (не под карточкой, не у края)
    tx = clamp(tx, w * .12 - px * ZOOM, w * .55 - px * ZOOM);
    ty = clamp(ty, h * .18 - py * ZOOM, h * .82 - py * ZOOM);
    view.x = tx;
    view.y = ty;
    mapStage.style.setProperty('--z', ZOOM);
    applyView();
    mapStage.classList.add('has-zoom');
  };
  const resetZoom = () => {
    if (!mapWorld || !mapStage) return;
    view.x = 0;
    view.y = 0;
    mapWorld.style.transform = '';
    mapStage.style.setProperty('--z', 1);
    mapStage.classList.remove('has-zoom');
  };

  // Перетаскивание приближённой карты мышью. Указатель захватываем не сразу,
  // а только когда пошло реальное движение: иначе capture подменяет цель клика
  // и хотспот перестаёт нажиматься.
  let dragArmed = false;
  let dragging = false;
  let dragMoved = 0;
  let dragFrom = { x: 0, y: 0, vx: 0, vy: 0 };
  if (mapStage) {
    mapStage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      if (!mapStage.classList.contains('has-zoom')) return;
      dragArmed = true;
      dragging = false;
      dragMoved = 0;
      dragFrom = { x: event.clientX, y: event.clientY, vx: view.x, vy: view.y };
    });
    mapStage.addEventListener('pointermove', event => {
      if (!dragArmed) return;
      const dx = event.clientX - dragFrom.x;
      const dy = event.clientY - dragFrom.y;
      dragMoved = Math.max(dragMoved, Math.abs(dx) + Math.abs(dy));
      if (!dragging) {
        if (dragMoved < 4) return;
        dragging = true;
        mapStage.setPointerCapture(event.pointerId);
        mapStage.classList.add('is-dragging');
      }
      const lim = panLimits();
      view.x = clamp(dragFrom.vx + dx, lim.minX, lim.maxX);
      view.y = clamp(dragFrom.vy + dy, lim.minY, lim.maxY);
      applyView();
    });
    const endDrag = () => {
      dragArmed = false;
      if (!dragging) return;
      dragging = false;
      mapStage.classList.remove('is-dragging');
    };
    mapStage.addEventListener('pointerup', endDrag);
    mapStage.addEventListener('pointercancel', endDrag);
  }
  const showZone = button => {
    const data = zones[button.dataset.zone];
    if (!data || !zoneCard) return;
    hotspots.forEach(item => item.classList.toggle('is-active', item === button));
    const cardVisible = !zoneCard.classList.contains('is-hidden');
    clearTimeout(swapTimer);
    if (cardVisible && button.dataset.zone !== activeZone && !reduced) {
      // Кроссфейд: старая карточка уходит в прозрачность, новая появляется
      zoneCard.classList.add('is-swapping');
      swapTimer = setTimeout(() => { fillZone(data); zoneCard.classList.remove('is-swapping'); }, 260);
    } else {
      fillZone(data);
      zoneCard.classList.remove('is-hidden', 'is-swapping');
    }
    activeZone = button.dataset.zone;
    zoomTo(button);
  };
  hotspots.forEach(button => button.addEventListener('click', () => {
    if (dragMoved > 5) return;
    button.classList.contains('is-active') ? closeZone() : showZone(button);
  }));
  const closeZone = () => {
    clearTimeout(swapTimer);
    zoneCard?.classList.add('is-hidden');
    zoneCard?.classList.remove('is-swapping');
    hotspots.forEach(item => item.classList.remove('is-active'));
    resetZoom();
  };
  document.querySelector('[data-zone-close]')?.addEventListener('click', closeZone);
  addEventListener('keydown', event => { if (event.key === 'Escape' && mapStage?.classList.contains('has-zoom')) closeZone(); });
  addEventListener('resize', () => { if (mapStage?.classList.contains('has-zoom')) { const active = hotspots.find(item => item.classList.contains('is-active')); active ? zoomTo(active) : resetZoom(); } }, { passive: true });

  const formatCards = [...document.querySelectorAll('[data-format-card]')];
  formatCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      formatCards.forEach(item => item.classList.toggle('format-card--featured', item === card));
    });
  });

  const stepsSection = document.querySelector('[data-pst]');
  if (stepsSection) {
    const STEPS = [
      { n: '01', t: 'Заявка на\u00A0сайте', d: 'Заполните анкету\u00A0— мы свяжемся с\u00A0вами, обсудим формат сотрудничества и\u00A0ответим на\u00A0первые вопросы', e: '', cta: 'Оставить заявку' },
      { n: '02', t: 'Собеседование и\u00A0отбор', d: 'Обсуждаем ваш опыт, мотивацию и\u00A0возможности. В\u00A0каждом городе выбираем одного партнёра для\u00A0открытия сети дарксторов', e: '2–3\u00A0недели' },
      { n: '03', t: 'Подготовка помещений', d: 'Подбираете помещение по\u00A0стандартам сети, мы готовим планировку и\u00A0помогаем с\u00A0поставщиками оборудования. Ремонт и\u00A0стройку ведёте вы, мы сопровождаем каждый этап', e: '2–4\u00A0месяца' },
      { n: '04', t: 'Подбор персонала', d: 'Параллельно набираете команду: кладовщиков, курьеров и\u00A0директоров дарксторов. Помогаем привлекать персонал с\u00A0помощью операционного маркетинга', e: '1–2\u00A0месяца' },
      { n: '05', t: 'Запуск сервиса', d: 'Дарксторы заполняются товарами, мы разворачиваем <span style="white-space:nowrap">IT-инфраструктуру</span> и\u00A0запускаем рекламную кампанию в\u00A0городе\u00A0— вы начинаете принимать заказы', e: '1–2\u00A0недели' }
    ];
    const tickIcon = '<svg class="pst-tickmark" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const clockIcon = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6V8l2.4 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const rail = stepsSection.querySelector('[data-pst-rail]');
    const bar = stepsSection.querySelector('[data-pst-bar]');
    const progressBox = stepsSection.querySelector('[data-pst-progress]');
    const odo = stepsSection.querySelector('[data-pst-odo]');
    STEPS.forEach((step, i) => {
      rail.insertAdjacentHTML('beforeend',
        `<div class="pst-mini${i ? '' : ' is-active'}">
           <button class="pst-hit" type="button" aria-label="Шаг ${step.n}: ${step.t}${step.e ? `, ${step.e}` : ''}"></button>
           <span class="pst-strip"><span class="pst-num">${step.n}</span><span class="pst-vert">${step.t}</span><span class="pst-node">${tickIcon}</span></span>
           <div class="pst-full"><h3>${step.t}</h3><p>${step.d}</p>
             <div class="pst-foot">${step.e ? `<span class="pst-term">${clockIcon}${step.e}</span>` : ''}${step.cta ? `<a class="pst-cta" href="#form">${step.cta}</a>` : ''}</div>
           </div>
           <span class="pst-big" aria-hidden="true">${step.n}</span>
           <span class="pst-tickcorner" aria-hidden="true">${tickIcon}</span>
           <span class="pst-fold"><span class="pst-num">${step.n}</span><b>${step.t}</b><span class="pst-note">${step.d}</span>${step.e ? `<i class="pst-when">${step.e}</i>` : ''}${step.cta ? `<a class="pst-cta" href="#form">${step.cta}</a>` : ''}</span>
         </div>`);
    });
    const miniNodes = [...rail.children];
    let stepState = '';
    const stepOnScroll = () => {
      const travel = stepsSection.offsetHeight - innerHeight;
      if (travel <= 0) return;
      const progress = Math.max(0, Math.min(1, -stepsSection.getBoundingClientRect().top / travel));
      const raw = progress * STEPS.length;
      const index = Math.min(STEPS.length - 1, Math.floor(raw));
      const local = Math.max(0, Math.min(1, raw - index));
      // на излёте последнего шага путь пройден: все пять с галочками, полоса до конца, последняя створка остаётся раскрытой
      const allDone = progress >= 0.95;
      bar.style.setProperty('--p', (allDone ? 1 : (index + local) / STEPS.length).toFixed(4));
      progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      const state = index + (allDone ? ':done' : '');
      if (state === stepState) return;
      stepState = state;
      const last = STEPS.length - 1;
      miniNodes.forEach((node, i) => {
        const active = allDone ? i === last : i === index;
        node.classList.toggle('is-active', active);
        node.classList.toggle('is-done', allDone || i < index);
        node.setAttribute('aria-current', active ? 'step' : 'false');
      });
      if (odo) odo.style.transform = `translateY(-${index}em)`;
    };
    // клик по створке прокручивает к её отрезку — состояние по-прежнему считается от скролла
    miniNodes.forEach((node, i) => {
      node.querySelector('.pst-hit').addEventListener('click', () => {
        const travel = stepsSection.offsetHeight - innerHeight;
        if (travel <= 0) return;
        const top = stepsSection.getBoundingClientRect().top + scrollY + ((i + 0.5) / STEPS.length) * travel;
        scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    addEventListener('scroll', stepOnScroll, { passive: true });
    addEventListener('resize', stepOnScroll, { passive: true });
    stepOnScroll();
  }

  const reviewTrack = document.querySelector('[data-review-track]');
  const reviewPrev = document.querySelector('[data-reviews-prev]');
  const reviewNext = document.querySelector('[data-reviews-next]');
  const reviewAmount = () => (reviewTrack?.firstElementChild?.getBoundingClientRect().width || 300) + 20;
  const updateReviewButtons = () => {
    if (!reviewTrack) return;
    reviewPrev.disabled = reviewTrack.scrollLeft < 4;
    reviewNext.disabled = reviewTrack.scrollLeft > reviewTrack.scrollWidth - reviewTrack.clientWidth - 4;
  };
  reviewPrev?.addEventListener('click', () => reviewTrack.scrollBy({ left: -reviewAmount(), behavior: reduced ? 'auto' : 'smooth' }));
  reviewNext?.addEventListener('click', () => reviewTrack.scrollBy({ left: reviewAmount(), behavior: reduced ? 'auto' : 'smooth' }));
  reviewTrack?.addEventListener('scroll', updateReviewButtons, { passive: true });
  reviewTrack?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') reviewPrev.click();
    if (event.key === 'ArrowRight') reviewNext.click();
  });
  updateReviewButtons();

  document.querySelectorAll('[data-accordion] article').forEach(item => {
    const button = item.querySelector('button');
    button.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      document.querySelectorAll('[data-accordion] article').forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('button').setAttribute('aria-expanded', 'false');
      });
      if (open) { item.classList.add('is-open'); button.setAttribute('aria-expanded', 'true'); }
    });
  });

  const form = document.querySelector('[data-form]');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    if (!form.reportValidity()) return;
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      status.textContent = 'Отправка будет доступна после подключения формы к\u00A0CRM.';
      return;
    }
    const submit = form.querySelector('[data-submit]');
    submit.disabled = true;
    submit.classList.add('is-loading');
    status.textContent = '';
    status.classList.remove('is-ok');
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!response.ok) throw new Error('Не\u00A0удалось отправить заявку');
      status.textContent = 'Спасибо! Заявка отправлена.';
      status.classList.add('is-ok');
      form.reset();
    } catch (error) {
      status.textContent = 'Не\u00A0удалось отправить заявку. Попробуйте ещё раз.';
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
    }
  });
})();
