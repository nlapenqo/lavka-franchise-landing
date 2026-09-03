(()=>{
  const story=document.querySelector('[data-story]');
  if(!story)return;
  const data=[
    ['01','Заявка<br>на сайте','Заполните анкету — мы свяжемся с вами, обсудим формат сотрудничества и ответим на первые вопросы','1 неделя'],
    ['02','Собеседование<br>и отбор','Обсуждаем ваш опыт, мотивацию и возможности. В каждом городе выбираем одного партнёра для открытия сети дарксторов','2–3 недели'],
    ['03','Подготовка<br>помещений','Подбираете помещение по стандартам сети. Мы готовим планировку, помогаем с оборудованием и сопровождаем стройку','2–4 месяца'],
    ['04','Подбор<br>персонала','Параллельно набираете команду: кладовщиков, курьеров и директоров. Мы помогаем операционным маркетингом','1–2 месяца'],
    ['05','Запуск<br>сервиса','Заполняем дарксторы товарами, разворачиваем IT и запускаем рекламу — вы начинаете принимать первые заказы','1–2 недели']
  ];
  const variant=Number(document.body.dataset.variant||1);
  story.innerHTML=`<div class="story__sticky"><div class="scene"><header class="head"><div><p class="eyebrow">Маршрут партнёра · концепт ${String(variant).padStart(2,'0')}</p><h1 class="title">Как стать<br>партнёром?</h1></div><p class="count"><strong data-current>01</strong><span>из 05</span></p></header><div class="stage-area"><div class="detail">${data.map((item,i)=>`<article class="detail-panel${i===0?' is-active':''}" data-panel aria-hidden="${i!==0}"><div class="detail__top"><span class="detail__step">${item[0]}</span><span class="detail__tag">шаг ${i+1} из 5</span></div><h2>${item[1]}</h2><p>${item[2]}</p><time>${item[3]}</time></article>`).join('')}</div><div class="rail" aria-label="Этапы партнёрства">${data.map((item,i)=>`<button class="step${i===0?' is-active':''}" type="button" data-step aria-pressed="${i===0}"><span class="step__num">${item[0]}</span><strong class="step__title">${item[1]}</strong><span class="step__copy">${item[2]}</span><time class="step__time">${item[3]}</time></button>`).join('')}</div></div><footer class="foot"><span class="hint"><i class="mouse" aria-hidden="true"></i>Листайте вниз</span><span class="progress" role="progressbar" aria-label="Прогресс маршрута" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-progress><i></i></span><nav class="variant-switch" aria-label="Варианты концепции">${[1,2,3,4,5].map(i=>`<a href="v${i}.html"${i===variant?' aria-current="page"':''}>${i}</a>`).join('')}</nav></footer></div></div>`;
  const steps=[...story.querySelectorAll('[data-step]')];
  const panels=[...story.querySelectorAll('[data-panel]')];
  const current=story.querySelector('[data-current]');
  const progress=story.querySelector('[data-progress]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active=-1,frame=0,manualUntil=0;
  const apply=(index,p)=>{
    const safe=Math.max(0,Math.min(steps.length-1,index));
    story.style.setProperty('--p',Math.max(0,Math.min(1,p)).toFixed(4));
    story.style.setProperty('--stage',String(safe));
    if(safe===active)return;
    active=safe;
    current.textContent=String(safe+1).padStart(2,'0');
    steps.forEach((step,i)=>{step.classList.toggle('is-active',i===safe);step.setAttribute('aria-pressed',String(i===safe))});
    panels.forEach((panel,i)=>{panel.classList.toggle('is-active',i===safe);panel.setAttribute('aria-hidden',String(i!==safe))});
  };
  const update=()=>{
    frame=0;
    if(reduced||innerWidth<=900){apply(0,.2);return}
    if(performance.now()<manualUntil)return;
    const rect=story.getBoundingClientRect();
    const travel=Math.max(1,rect.height-innerHeight);
    const p=Math.max(0,Math.min(1,-rect.top/travel));
    apply(Math.min(steps.length-1,Math.floor(p*steps.length)),p);
    progress?.setAttribute('aria-valuenow',String(Math.round(p*100)));
  };
  const requestUpdate=()=>{if(!frame)frame=requestAnimationFrame(update)};
  steps.forEach((step,i)=>{
    const choose=()=>{manualUntil=performance.now()+850;apply(i,(i+.5)/steps.length)};
    step.addEventListener('click',choose);
    step.addEventListener('mouseenter',()=>{if(innerWidth>900)choose()});
  });
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  apply(0,.04);update();
})();
