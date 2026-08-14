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
    const cities = ['в Казани', 'в Самаре', 'в Уфе', 'в Тюмени', 'в Ижевске', 'в своём городе'];
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
    const setWidth = index => { cityRot.style.width = `${words[index].offsetWidth}px`; };
    words[current].classList.add('is-cur');
    setWidth(current);
    document.fonts?.ready?.then(() => setWidth(current));
    addEventListener('resize', () => setWidth(current), { passive: true });

    const nextCity = () => {
      const previous = current;
      current = (current + 1) % cities.length;
      words[previous].classList.remove('is-cur');
      words[previous].classList.add('is-out');
      const word = words[current];
      word.classList.remove('is-out');
      void word.offsetWidth;
      word.classList.add('is-cur');
      setWidth(current);
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

  const count = element => {
    if (element.dataset.done) return;
    element.dataset.done = 'true';
    const end = Number(element.dataset.count);
    if (reduced || !Number.isFinite(end)) return;
    const started = performance.now();
    const duration = 1300;
    const tick = now => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(end * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelectorAll?.('[data-count]').forEach(count);
      if (entry.target.matches('[data-count]')) count(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .16, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal,.number-card').forEach(node => revealObserver.observe(node));

  const businessCarousel = document.querySelector('[data-business-carousel]');
  if (businessCarousel) {
    const businessSlides = [...businessCarousel.querySelectorAll('[data-business-slide]')];
    const businessPrev = businessCarousel.querySelector('[data-business-prev]');
    const businessNext = businessCarousel.querySelector('[data-business-next]');
    const businessCounter = businessCarousel.querySelector('[data-business-counter]');
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
      if (businessCounter) businessCounter.textContent = `${String(businessCurrent + 1).padStart(2, '0')} / ${String(businessSlides.length).padStart(2, '0')}`;
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
    storage: ['01', 'Сухое хранение', 'Основной товарный запас. Ассортиментная матрица и автозаказ помогают поддерживать нужное наличие без ручных таблиц.'],
    cold: ['02', 'Холодильники', 'Зона для товаров, которым нужна температура +2…+4 °C. Стандарты хранения и контроль качества задаёт Яндекс Лавка.'],
    freezer: ['03', 'Морозильная камера', 'Температура −18 °C поддерживается круглосуточно. Команда партнёра отвечает за правильное размещение и ротацию товара.'],
    packing: ['04', 'Зона сборки', 'Здесь сборщики комплектуют заказы за несколько минут. WMS строит маршрут по даркстору и снижает число ошибок.'],
    kitchen: ['05', 'Кухня', 'Готовая еда и кофе производятся по технологическим картам с едиными требованиями к качеству.'],
    dispatch: ['06', 'Зона выдачи', 'Готовые заказы передаются курьерам. Партнёр организует команду, велопарковку и ежедневную операционную работу.'],
    middle: ['07', 'Средняя миля', 'Поставки от распределительного центра до даркстора и работу с поставщиками организует Яндекс Лавка.']
  };
  const mapStage = document.querySelector('[data-map-stage]');
  const zoneCard = document.querySelector('[data-zone-card]');
  const showZone = button => {
    const data = zones[button.dataset.zone];
    if (!data) return;
    document.querySelectorAll('[data-zone]').forEach(item => item.classList.toggle('is-active', item === button));
    zoneCard.querySelector('[data-zone-number]').textContent = data[0];
    zoneCard.querySelector('[data-zone-title]').textContent = data[1];
    zoneCard.querySelector('[data-zone-text]').textContent = data[2];
    zoneCard.classList.remove('is-hidden');
    if (!reduced && innerWidth > 820) {
      mapStage.style.setProperty('--pan-x', `${(50 - parseFloat(button.style.getPropertyValue('--x'))) * .09}%`);
      mapStage.style.setProperty('--pan-y', `${(50 - parseFloat(button.style.getPropertyValue('--y'))) * .06}%`);
      mapStage.classList.add('has-zoom');
    }
  };
  document.querySelectorAll('[data-zone]').forEach(button => button.addEventListener('click', () => showZone(button)));
  const closeZone = () => { zoneCard?.classList.add('is-hidden'); mapStage?.classList.remove('has-zoom'); document.querySelectorAll('[data-zone]').forEach(item => item.classList.remove('is-active')); };
  document.querySelector('[data-zone-close]')?.addEventListener('click', closeZone);
  addEventListener('keydown', event => { if (event.key === 'Escape' && mapStage?.classList.contains('has-zoom')) closeZone(); });

  const formatCards = [...document.querySelectorAll('[data-format-card]')];
  formatCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      formatCards.forEach(item => item.classList.toggle('format-card--featured', item === card));
    });
  });

  const stepsSection = document.querySelector('[data-pst]');
  if (stepsSection) {
    const STEPS = [
      { n: '01', t: 'Заявка на сайте', d: 'Заполните анкету — мы свяжемся с вами, обсудим формат сотрудничества и ответим на первые вопросы', e: '1 неделя', cta: 'Оставить заявку' },
      { n: '02', t: 'Собеседование и отбор', d: 'Обсуждаем ваш опыт, мотивацию и возможности. В каждом городе выбираем одного партнёра для открытия сети дарксторов', e: '2–3 недели' },
      { n: '03', t: 'Подготовка помещений', d: 'Подбираете помещение по стандартам сети, мы готовим планировку и помогаем с поставщиками оборудования. Ремонт и стройку ведёте вы, мы сопровождаем каждый этап', e: '2–4 месяца' },
      { n: '04', t: 'Подбор персонала', d: 'Параллельно набираете команду: кладовщиков, курьеров и директоров дарксторов. Помогаем привлекать персонал с помощью операционного маркетинга', e: '1–2 месяца' },
      { n: '05', t: 'Запуск сервиса', d: 'Дарксторы заполняются товарами, мы разворачиваем IT-инфраструктуру и запускаем рекламную кампанию в городе — вы начинаете принимать заказы', e: '1–2 недели' }
    ];
    const tick = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const panes = stepsSection.querySelector('[data-pst-panes]');
    const rail = stepsSection.querySelector('[data-pst-rail]');
    const bar = stepsSection.querySelector('[data-pst-bar]');
    const progressBox = stepsSection.querySelector('[data-pst-progress]');
    STEPS.forEach((step, i) => {
      panes.insertAdjacentHTML('beforeend',
        `<div class="pst-pane${i ? '' : ' is-active'}">
           <h3>${step.t}</h3><p>${step.d}</p>
           <div class="pst-foot"><em>${step.e}</em>${step.cta ? `<a class="pst-cta" href="#form">${step.cta}</a>` : ''}</div>
         </div>`);
      rail.insertAdjacentHTML('beforeend',
        `<button class="pst-mini${i ? '' : ' is-active'}" type="button" aria-label="Шаг ${step.n}: ${step.t}, ${step.e}">
           <span class="pst-fold">
             <span class="pst-num">${step.n}</span>
             <span class="pst-foldbot"><b>${step.t}<span class="pst-note">${step.d}</span></b><i class="pst-when">${step.e}</i></span>
           </span>
           <span class="pst-open"><strong>${step.n}</strong><b>${step.t.toLowerCase()}</b></span>
           <span class="pst-tick">${tick}</span>
         </button>`);
    });
    const paneNodes = [...panes.children];
    const miniNodes = [...rail.children];
    let stepState = '';
    const stepOnScroll = () => {
      const travel = stepsSection.offsetHeight - innerHeight;
      if (travel <= 0) return;
      const progress = Math.max(0, Math.min(1, -stepsSection.getBoundingClientRect().top / travel));
      bar.style.width = (progress * 100) + '%';
      progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      const index = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      // на излёте последнего шага закрывается и он сам — все пять плашек с галочками
      const allDone = progress >= 0.95;
      const state = index + (allDone ? ':done' : '');
      if (state === stepState) return;
      stepState = state;
      paneNodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
      miniNodes.forEach((node, i) => {
        node.classList.toggle('is-active', !allDone && i === index);
        node.classList.toggle('is-done', allDone || i < index);
      });
    };
    // клик по шагу прокручивает к его отрезку — состояние по-прежнему считается от скролла
    miniNodes.forEach((node, i) => {
      node.addEventListener('click', () => {
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
      status.textContent = 'Отправка будет доступна после подключения формы к CRM.';
      return;
    }
    const submit = form.querySelector('[data-submit]');
    submit.disabled = true;
    submit.classList.add('is-loading');
    status.textContent = '';
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!response.ok) throw new Error('Не удалось отправить заявку');
      status.textContent = 'Спасибо! Заявка отправлена.';
      status.style.color = '#198754';
      form.reset();
    } catch (error) {
      status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз.';
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
    }
  });
})();
