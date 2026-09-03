// Генератор концептов «Ход» — 8 подач блока «Как стать партнёром?».
// v1–v3 — внутри текущей концепции (слева крупный блок, справа таймлайн),
// v4–v8 — вольная композиция. node _build.mjs → перезаписывает v1–v8.html и index.html.
// Шрифты YS Geo (base64 @font-face) берёт из ../timeline/v1.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = here;
const fonts = readFileSync(join(here, '../timeline/v1.html'), 'utf8').split('\n').filter(l => l.startsWith('@font-face')).join('\n').trim();
if (!fonts.includes('font-weight:900')) throw new Error('не нашёл @font-face в ../timeline/v1.html');

/* ---------- общая база: токены, ambient и каркас секции — из site/styles.css ---------- */
const BASE_CSS = String.raw`
:root{--navy:#1b3a6a;--blue:#00adff;--sky:#aad9fc;--light:#f2f7fc;--card:#eaf3fc;--mid:#3e88c5;--dim:#5a749b;--dim-dark:#a7bee0;--white:#fff;--container:1164px;--ease:cubic-bezier(.22,.61,.36,1);--spring:cubic-bezier(.34,1.4,.64,1)}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:var(--navy);background:#fff;font-family:'YS Geo',Arial,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:clip}
button{border:0;background:none;cursor:pointer;font:inherit;color:inherit}
a{color:inherit;text-decoration:none}
p,h1,h2,h3{margin:0}
.container{width:min(var(--container),calc(100% - 48px));margin-inline:auto;position:relative}
.section-dark{position:relative;color:#fff;background:var(--navy);overflow:hidden}
.section-title{font-size:80px;font-weight:900;line-height:.92;letter-spacing:-.01em;color:#fff}

/* ambient — как на сайте */
.ambient-field{position:absolute;z-index:0;inset:0;overflow:hidden;pointer-events:none;user-select:none}
.ambient-glow{position:absolute;display:flex;align-items:center;justify-content:center;animation-duration:var(--drift-duration,11s);animation-timing-function:cubic-bezier(.45,.05,.55,.95);animation-iteration-count:infinite;animation-direction:alternate;will-change:transform}
.ambient-glow__axis{flex:none;transform:rotate(-32.9deg)}
.ambient-glow__core{position:relative;width:var(--core-w);height:var(--core-h)}
.ambient-glow__core::before{content:'';position:absolute;left:var(--asset-offset);top:var(--asset-offset);width:var(--asset-w);height:var(--asset-h);background:radial-gradient(ellipse closest-side at center,rgba(0,173,255,.78) 0%,rgba(0,173,255,.67) 18%,rgba(0,173,255,.43) 40%,rgba(0,173,255,.2) 62%,rgba(0,173,255,.075) 78%,rgba(0,173,255,.018) 90%,transparent 100%)}
.ambient-glow--medium{--core-w:364.487px;--core-h:626.052px;--asset-offset:-400px;--asset-w:1164.49px;--asset-h:1426.05px;width:646.093px;height:723.625px;animation-name:ambient-drift-a}
.ambient-glow--small{--core-w:316.897px;--core-h:544.31px;--asset-offset:-600px;--asset-w:1516.9px;--asset-h:1744.31px;width:561.735px;height:629.144px;animation-name:ambient-drift-b}
.ambient-glow--steps-left{left:calc(50% - 763px);top:-360.89px;--drift-duration:11s}
.ambient-glow--steps-low{left:calc(50% + 66px);top:490.24px;--drift-duration:9s;animation-delay:-2.6s}
.ambient-glow--steps-high{left:calc(50% + 362px);top:-227.76px;--drift-duration:13s;animation-name:ambient-drift-c;animation-delay:-5.4s}
@keyframes ambient-drift-a{0%{transform:translate3d(-20px,80px,0) scale(.92) rotate(-4deg)}52%{transform:translate3d(156px,-104px,0) scale(1.08) rotate(3deg)}100%{transform:translate3d(48px,44px,0) scale(.98) rotate(-1deg)}}
@keyframes ambient-drift-b{0%{transform:translate3d(68px,-56px,0) scale(.95)}58%{transform:translate3d(-172px,144px,0) scale(1.1)}100%{transform:translate3d(36px,40px,0) scale(1)}}
@keyframes ambient-drift-c{0%{transform:translate3d(84px,96px,0) scale(1.04)}46%{transform:translate3d(-144px,-124px,0) scale(.91)}100%{transform:translate3d(12px,-40px,0) scale(1.08)}}

/* каркас секции — как на сайте */
.steps{min-height:520vh;padding:0;overflow:visible}
.steps__sticky{position:sticky;top:0;min-height:100svh;height:100svh;padding:clamp(30px,5vh,58px) 0;display:grid;align-items:center;overflow:hidden}
.steps__inner{z-index:1}
.steps__header{margin-bottom:clamp(34px,4.4vw,64px)}

/* голубая плашка активного шага */
.pst-bigcard{position:relative;border-radius:32px;background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.35);overflow:hidden}
.pst-pane{position:absolute;inset:40px;display:flex;flex-direction:column;opacity:0;transform:translateY(22px);transition:opacity .3s var(--ease),transform .5s var(--ease);pointer-events:none}
.pst-pane.is-active{opacity:1;transform:none;pointer-events:auto;transition:opacity .45s var(--ease) .14s,transform .55s var(--ease) .14s}
.pst-pane h3{margin:0;font-weight:800;letter-spacing:-.018em}
.pst-foot{margin-top:auto;padding-top:22px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.pst-pane em{font-style:normal;font-weight:500;opacity:.9}
.pst-cta{position:relative;z-index:3;display:inline-flex;align-items:center;min-height:48px;padding:14px 28px;border-radius:999px;background:#fff;color:var(--navy);font-size:16px;font-weight:500;line-height:1;white-space:nowrap;transition:transform .2s var(--ease),box-shadow .2s}
.pst-cta:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(9,40,80,.28)}
.pst-cta:focus-visible{outline:3px solid rgba(255,255,255,.6);outline-offset:3px}

/* шаги таймлайна */
.pst-rail{display:flex;min-width:0}
.pst-mini{position:relative;min-width:0;padding:0;text-align:left;color:var(--dim-dark);background:none;cursor:pointer}
.pst-mini:focus-visible{outline:3px solid rgba(0,173,255,.5);outline-offset:3px}
.pst-mini b,.pst-mini i,.pst-when,.pst-num,.pst-vert{hyphens:none;overflow-wrap:normal;word-break:normal}
.pst-num{display:block;font-size:13px;font-weight:500;line-height:1;color:var(--dim-dark);transition:color .4s,opacity .4s}
.pst-when{display:block;font-style:normal;font-size:13px;font-weight:500;line-height:1.2;color:var(--blue);white-space:nowrap;transition:color .4s,opacity .4s}
/* прозрачная кнопка на всю плашку — чтобы внутри могла жить ссылка */
.pst-hit{position:absolute;inset:0;z-index:2;border-radius:inherit;background:none;cursor:pointer}
.pst-hit:focus-visible{outline:3px solid rgba(0,173,255,.5);outline-offset:3px}
.tickmark{width:11px;height:11px;opacity:0;transform:scale(.4);transition:opacity .3s var(--ease),transform .5s var(--spring)}
.is-done .tickmark{opacity:1;transform:none}

/* заглушки до/после — проверка пина */
.bumper{min-height:72vh;display:grid;place-content:center;text-align:center;gap:14px;padding:40px;background:var(--light)}
.bumper h1{font-size:44px;font-weight:900;line-height:1;margin:0;letter-spacing:-.01em}
.bumper p{margin:0;color:var(--dim);font-size:18px;max-width:860px}
.bumper a{color:var(--blue);font-weight:500}
.nb{white-space:nowrap}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ambient-glow{animation:none!important}*,*::before,*::after{transition-duration:.01ms!important}}
`;

const TICK = `<svg class="tickmark" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- ядро: тексты, пин, скролл, клик, финальные галочки ---------- */
const coreJs = (variantJs) => String.raw`
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepsSection = document.querySelector('[data-pst]');
  const STEPS = [
    { n: '01', t: 'Заявка на сайте', d: 'Заполните анкету — мы свяжемся с вами, обсудим формат сотрудничества и ответим на первые вопросы', e: '1 неделя', cta: 'Оставить заявку' },
    { n: '02', t: 'Собеседование и отбор', d: 'Обсуждаем ваш опыт, мотивацию и возможности. В каждом городе выбираем одного партнёра для открытия сети дарксторов', e: '2–3 недели' },
    { n: '03', t: 'Подготовка помещений', d: 'Подбираете помещение по стандартам сети, мы готовим планировку и помогаем с поставщиками оборудования. Ремонт и стройку ведёте вы, мы сопровождаем каждый этап', e: '2–4 месяца' },
    { n: '04', t: 'Подбор персонала', d: 'Параллельно набираете команду: кладовщиков, курьеров и директоров дарксторов. Помогаем привлекать персонал с помощью операционного маркетинга', e: '1–2 месяца' },
    { n: '05', t: 'Запуск сервиса', d: 'Дарксторы заполняются товарами, мы разворачиваем <span class="nb">IT-инфраструктуру</span> и запускаем рекламную кампанию в городе — вы начинаете принимать заказы', e: '1–2 недели' }
  ];
  const tick = '${TICK}';
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const panes = stepsSection.querySelector('[data-pst-panes]');
  const rail = stepsSection.querySelector('[data-pst-rail]');
  const progressBox = stepsSection.querySelector('[data-pst-progress]');

  // — то, что меняется между вариантами —
${variantJs}

  const paneItemDefault = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<h3>' + step.t + '</h3><p>' + step.d + '</p>' +
      '<div class="pst-foot"><em>' + step.e + '</em>' + (step.cta ? '<a class="pst-cta" href="#form">' + step.cta + '</a>' : '') + '</div>' +
    '</div>';
  const makePane = typeof paneItem === 'function' ? paneItem : paneItemDefault;

  STEPS.forEach((step, i) => {
    if (panes) panes.insertAdjacentHTML('beforeend', makePane(step, i));
    rail.insertAdjacentHTML('beforeend', railItem(step, i));
  });
  const paneNodes = panes ? [...panes.children] : [];
  const miniNodes = [...rail.querySelectorAll('.pst-mini')];
  const measure = () => { if (typeof onMeasure === 'function') onMeasure(); };
  measure();

  let stepState = '';
  let lastIndex = 0;
  const stepOnScroll = () => {
    const travel = stepsSection.offsetHeight - innerHeight;
    if (travel <= 0) return;
    const progress = clamp01(-stepsSection.getBoundingClientRect().top / travel);
    const raw = progress * STEPS.length;
    const index = Math.min(STEPS.length - 1, Math.floor(raw));
    const local = clamp01(raw - index);            // прогресс внутри шага — для непрерывных заливок
    setProgress(progress, index, local);
    progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    // на излёте последнего шага закрывается и он сам — все пять с галочками
    const allDone = progress >= 0.95;
    const state = index + (allDone ? ':done' : '');
    if (state === stepState) return;
    stepState = state;
    paneNodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
    miniNodes.forEach((node, i) => {
      node.classList.toggle('is-active', !allDone && i === index);
      node.classList.toggle('is-done', allDone || i < index);
      node.setAttribute('aria-current', !allDone && i === index ? 'step' : 'false');
    });
    setState(index, allDone, lastIndex);
    lastIndex = index;
  };
  // клик по шагу прокручивает к его отрезку — состояние по-прежнему считается от скролла
  miniNodes.forEach((node, i) => {
    (node.querySelector('.pst-hit') || node).addEventListener('click', () => {
      const travel = stepsSection.offsetHeight - innerHeight;
      if (travel <= 0) return;
      const top = stepsSection.getBoundingClientRect().top + scrollY + ((i + 0.5) / STEPS.length) * travel;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
  const refresh = () => { measure(); stepState = ''; stepOnScroll(); };
  addEventListener('scroll', stepOnScroll, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  document.fonts?.ready.then(refresh);
  stepOnScroll();
})();
`;

/* =========================================================================
   v1 «Шкала» — правая колонка стала настоящей осью времени
   ========================================================================= */
const v1 = {
  id: 'v1', title: 'Шкала', group: 'a',
  desc: 'Правая колонка — настоящая ось времени: высота отрезка равна длительности шага, поэтому «2–4 месяца» видно физически. По оси непрерывно едет метка «сейчас», узлы пройденных шагов закрываются галочками. Сетка 1164 = 736 + 28 + 400.',
  short: 'ось времени вместо рейки: высота отрезка = длительность шага, по линии непрерывно едет метка «сейчас»',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:736px minmax(0,1fr);gap:28px;align-items:stretch;height:clamp(420px,52vh,500px)}
.pst-bigcard{align-self:center;height:clamp(300px,38vh,346px)}
.pst-pane h3{font-size:44px;line-height:1.03}
.pst-pane p{margin:18px 0 0;font-size:20px;line-height:1.42;max-width:620px}
.pst-pane em{font-size:17px}

.pst-rail{position:relative;flex-direction:column;height:100%}
.pst-rail::before{content:'';position:absolute;left:11px;top:14px;height:calc(100% - 14px);width:2px;border-radius:2px;background:rgba(167,190,224,.22)}
.pst-mark{position:absolute;left:11px;top:14px;width:2px;height:0;border-radius:2px;background:var(--blue);box-shadow:0 0 0 4px rgba(0,173,255,.1)}
.pst-mark::after{content:'';position:absolute;left:-5px;bottom:-1px;width:12px;height:2px;border-radius:2px;background:var(--blue)}
.pst-mini{z-index:1;display:flex;gap:16px;align-items:flex-start;flex:var(--w) 1 0;min-height:0}
.pst-dot{flex:none;position:relative;width:24px;align-self:stretch}
.pst-dot i{position:absolute;left:12px;top:14px;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--navy);box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.45);display:grid;place-items:center;color:#fff;transition:width .45s var(--spring),height .45s var(--spring),margin .45s var(--spring),background .4s,box-shadow .4s}
.pst-lab{display:flex;flex-direction:column;gap:5px;min-width:0;padding-top:4px}
.pst-lab b{display:block;font-size:15px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,font-weight .2s}
.pst-mini:hover .pst-lab b{color:#fff}
.pst-mini.is-active .pst-lab b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-dot i{width:22px;height:22px;margin:-11px 0 0 -11px;background:var(--blue);box-shadow:0 0 0 5px rgba(0,173,255,.16)}
.pst-mini.is-done .pst-dot i{width:18px;height:18px;margin:-9px 0 0 -9px;background:var(--blue);box-shadow:none}
.pst-mini.is-done .pst-lab b{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="pst-bigcard" data-pst-panes></div>
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-mark" data-pst-mark aria-hidden="true"></i></div>
      </div>
    </div>`,
  js: String.raw`
  // недели по серединам сроков: 1 / 2–3 нед / 2–4 мес / 1–2 мес / 1–2 нед
  const WEEKS = [1, 2.5, 12, 6, 1.5];
  const railItem = (step, i) => '<button class="pst-mini" type="button" style="--w:' + Math.round((54 + 8.6 * WEEKS[i]) * 10) + '" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-dot"><i>' + tick + '</i></span>' +
      '<span class="pst-lab"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span>' +
    '</button>';
  const mark = stepsSection.querySelector('[data-pst-mark]');
  const setProgress = (p, index, local) => {
    const row = miniNodes[index];
    if (!row) return;
    const max = rail.clientHeight - 14;
    mark.style.height = Math.min(max, row.offsetTop + row.offsetHeight * local) + 'px';
  };
  const setState = () => {};
`
};

/* =========================================================================
   v2 «Полки» — рейка стала аккордеоном
   ========================================================================= */
const v2 = {
  id: 'v2', title: 'Полки', group: 'a',
  desc: 'Пять полок: активная раскрывается на всю свободную высоту и показывает срок крупно, пройденные складываются в navy-строку с галочкой, будущие остаются контуром. Внизу активной полки — тонкая линия, которая заполняется внутри шага, поэтому движение не прерывается между шагами. Сетка 1164 = 700 + 28 + 436.',
  short: 'рейка стала аккордеоном: активная полка раскрывается и показывает срок крупно, пройденные складываются в строку с галочкой',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:700px minmax(0,1fr);gap:28px;align-items:stretch;height:clamp(420px,52vh,500px)}
.pst-bigcard{align-self:center;height:clamp(300px,38vh,346px)}
.pst-pane h3{font-size:40px;line-height:1.04}
.pst-pane p{margin:18px 0 0;font-size:19px;line-height:1.44;max-width:560px}
.pst-pane em{font-size:17px}

.pst-rail{flex-direction:column;gap:8px;height:100%}
.pst-mini{flex:0 0 auto;height:60px;border-radius:16px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(167,190,224,.24);transition:flex-grow .55s var(--ease),height .55s var(--ease),background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-mini:hover{box-shadow:inset 0 0 0 1px rgba(167,190,224,.5)}
.pst-shelf{position:absolute;inset:0;display:flex;align-items:center;gap:12px;padding:0 16px 0 18px;transition:opacity .3s var(--ease)}
.pst-shelf b{font-size:14px;font-weight:500;line-height:1.2;white-space:nowrap;flex:1;transition:color .4s}
.pst-shelf .pst-num{flex:none;width:22px}
.pst-shelf .pst-tick{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.32);transition:background .4s var(--ease),box-shadow .4s}
.pst-open{position:absolute;inset:20px 18px 28px;display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .3s var(--ease)}
.pst-open b{display:block;font-size:20px;font-weight:800;line-height:1.15;color:#fff;letter-spacing:-.01em}
.pst-open .pst-num{margin-bottom:12px;color:#fff;opacity:.75}
.pst-open .pst-when{margin-top:auto;font-size:26px;font-weight:800;line-height:1;letter-spacing:-.02em}
.pst-sub{position:absolute;left:18px;right:18px;bottom:14px;height:2px;border-radius:2px;background:rgba(255,255,255,.16);opacity:0;transition:opacity .3s}
.pst-sub i{display:block;height:100%;width:calc(var(--local,0) * 100%);border-radius:2px;background:#fff}

.pst-mini.is-active{flex-grow:1;height:auto;background:rgba(0,173,255,.13);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.7)}
.pst-mini.is-active .pst-shelf{opacity:0}
.pst-mini.is-active .pst-open{opacity:1;pointer-events:auto;transition-delay:.18s}
.pst-mini.is-active .pst-sub{opacity:1;transition-delay:.18s}
.pst-mini.is-done{background:rgba(9,32,66,.55);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-shelf b{opacity:.5}
.pst-mini.is-done .pst-num{opacity:.45}
.pst-mini.is-done .pst-tick{background:var(--blue);box-shadow:none}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="pst-bigcard" data-pst-panes></div>
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-shelf"><span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i><span class="pst-tick">' + tick + '</span></span>' +
      '<span class="pst-open"><span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span>' +
      '<span class="pst-sub"><i></i></span>' +
    '</button>';
  const setProgress = (p, index, local) => { rail.style.setProperty('--local', local.toFixed(3)); };
  const setState = () => {};
`
};

/* =========================================================================
   v3 «Метка» — крайняя перепропорция, справа только указатель и срок
   ========================================================================= */
const v3 = {
  id: 'v3', title: 'Метка', group: 'a',
  desc: 'Самая жёсткая перепропорция: 836 слева, 300 справа. В правой колонке нет плашек вообще — компактный список из пяти строк, по которому ползёт синяя метка (непрерывно, внутри шага тоже), и срок активного шага крупно под списком. Срок ушёл из карточки, чтобы правая колонка получила собственную работу. Сетка 1164 = 836 + 28 + 300.',
  short: 'крайняя перепропорция 836/300: справа список из пяти строк с ползущей меткой и крупный срок активного шага',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:836px minmax(0,1fr);gap:28px;align-items:stretch;height:clamp(420px,52vh,500px)}
.pst-bigcard{align-self:center;height:clamp(300px,36vh,326px)}
.pst-pane{justify-content:center}
.pst-pane h3{font-size:44px;line-height:1.03}
.pst-pane p{margin:20px 0 0;font-size:20px;line-height:1.45;max-width:660px}
.pst-pane .pst-foot{margin-top:22px;padding-top:0}

.pst-right{display:flex;flex-direction:column;justify-content:center;gap:30px;min-width:0}
.pst-rail{position:relative;flex-direction:column;padding-left:22px}
.pst-rail::before{content:'';position:absolute;left:0;top:3px;bottom:3px;width:2px;border-radius:2px;background:rgba(167,190,224,.2)}
.pst-caret{position:absolute;left:-1.5px;top:4px;width:5px;height:26px;border-radius:2px;background:var(--blue);box-shadow:0 0 0 4px rgba(0,173,255,.1);transition:opacity .4s}
.pst-rail.is-done .pst-caret{opacity:0}
.pst-mini{display:flex;align-items:center;gap:10px;height:34px}
.pst-mini b{font-size:15px;font-weight:500;line-height:1.2;white-space:nowrap;transition:color .4s,font-weight .2s}
.pst-mini .pst-num{flex:none;width:20px;font-size:12px}
.pst-mini .pst-tick{margin-left:auto;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;color:#fff;transition:background .4s var(--ease)}
.pst-mini:hover b{color:#fff}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-num{color:#fff;opacity:.8}
.pst-mini.is-done b,.pst-mini.is-done .pst-num{opacity:.45}
.pst-mini.is-done .pst-tick{background:var(--blue)}
.pst-term{padding-top:22px;border-top:1px solid rgba(167,190,224,.2)}
.pst-term span{display:block;font-size:13px;font-weight:500;color:var(--dim-dark);opacity:.75}
.pst-term strong{display:block;margin-top:8px;font-size:34px;font-weight:800;line-height:1.05;letter-spacing:-.02em;color:var(--blue);white-space:nowrap}
.pst-term.is-swap strong{animation:term-in .5s var(--ease)}
@keyframes term-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="pst-bigcard" data-pst-panes></div>
        <div class="pst-right">
          <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-caret" data-pst-caret aria-hidden="true"></i></div>
          <p class="pst-term" data-pst-term><span>срок этапа</span><strong data-pst-termval>1 неделя</strong></p>
        </div>
      </div>
    </div>`,
  js: String.raw`
  const paneItem = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<h3>' + step.t + '</h3><p>' + step.d + '</p>' +
      (step.cta ? '<div class="pst-foot"><a class="pst-cta" href="#form">' + step.cta + '</a></div>' : '') +
    '</div>';
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><span class="pst-tick">' + tick + '</span>' +
    '</button>';
  const caret = stepsSection.querySelector('[data-pst-caret]');
  const term = stepsSection.querySelector('[data-pst-term]');
  const termVal = stepsSection.querySelector('[data-pst-termval]');
  let stride = 34;
  const onMeasure = () => { stride = miniNodes[1] ? miniNodes[1].offsetTop - miniNodes[0].offsetTop : 34; };
  const setProgress = (p, index, local) => {
    const y = Math.min((STEPS.length - 1) * stride, (index + local) * stride);
    caret.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
  };
  const setState = (index, allDone) => {
    rail.classList.toggle('is-done', allDone);
    if (termVal.textContent === STEPS[index].e) return;
    termVal.textContent = STEPS[index].e;
    term.classList.remove('is-swap');
    void term.offsetWidth;
    term.classList.add('is-swap');
  };
`
};

/* =========================================================================
   v4 «Створки» — горизонтальный аккордеон на всю ширину
   ========================================================================= */
const v4 = {
  id: 'v4', title: 'Створки', group: 'b',
  desc: 'Пять створок в ряд: активная разъезжается до 644px и становится голубой плашкой с полным текстом, остальные стоят вертикальными корешками с номером, названием вдоль и узлом. Над створками — тонкая нить прогресса. В финале створки выравниваются в пять равных закрытых панелей с галочками. Сетка: 644 + 4×118 + 4×12 = 1164.',
  short: 'горизонтальный аккордеон: активная створка разъезжается до 644px, остальные стоят корешками; в финале пять равных панелей с галочками',
  css: String.raw`
.pst-bar{height:2px;margin-bottom:22px;border-radius:2px;background:rgba(167,190,224,.2);overflow:hidden}
.pst-bar i{display:block;height:100%;width:calc(var(--p,0) * 100%);border-radius:2px;background:var(--blue)}
.pst-rail{gap:12px;height:clamp(360px,44vh,400px)}
.pst-mini{flex:0 0 118px;border-radius:22px;overflow:hidden;background:rgba(255,255,255,.045);box-shadow:inset 0 0 0 1px rgba(167,190,224,.22);transition:flex-basis .62s var(--ease),background .5s var(--ease),box-shadow .5s var(--ease)}
.pst-mini:hover{background:rgba(255,255,255,.08)}
.pst-strip{position:absolute;inset:0;padding:22px 0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:14px;transition:opacity .3s var(--ease)}
.pst-vert{flex:1;min-height:0;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;font-size:15px;font-weight:500;line-height:1.2;color:var(--dim-dark);overflow:hidden;transition:color .4s,opacity .4s}
.pst-node{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.38);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-full{position:absolute;inset:36px;width:572px;display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .28s var(--ease)}
.pst-full h3{margin:0;font-size:42px;font-weight:800;line-height:1.03;letter-spacing:-.018em;color:#fff}
.pst-full p{margin:18px 0 0;font-size:20px;line-height:1.44;color:#fff}
.pst-full em{font-style:normal;font-size:17px;font-weight:500;color:#fff;opacity:.9}
.pst-mini.is-active{flex-basis:644px;background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.35)}
.pst-mini.is-active .pst-strip{opacity:0}
.pst-mini.is-active .pst-full{opacity:1;pointer-events:auto;transition-delay:.24s}
.pst-mini.is-done{background:rgba(9,32,66,.5);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-vert{opacity:.5}
.pst-mini.is-done .pst-num{opacity:.45}
.pst-mini.is-done .pst-node{background:var(--blue);box-shadow:none}
.pst-rail.is-done .pst-mini{flex:1 1 0}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-bar" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><i data-pst-bar></i></div>
      <div class="pst-rail" data-pst-rail></div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="pst-strip"><span class="pst-num">' + step.n + '</span><span class="pst-vert">' + step.t + '</span><span class="pst-node">' + tick + '</span></span>' +
      '<div class="pst-full"><h3>' + step.t + '</h3><p>' + step.d + '</p>' +
        '<div class="pst-foot"><em>' + step.e + '</em>' + (step.cta ? '<a class="pst-cta" href="#form">' + step.cta + '</a>' : '') + '</div>' +
      '</div>' +
    '</div>';
  const bar = stepsSection.querySelector('[data-pst-bar]');
  const setProgress = (p) => { bar.style.setProperty('--p', p.toFixed(4)); };
  const setState = (index, allDone) => { rail.classList.toggle('is-done', allDone); };
`
};

/* =========================================================================
   v5 «Строки» — заголовок ушёл в левую колонку, справа вертикальный аккордеон
   ========================================================================= */
const v5 = {
  id: 'v5', title: 'Строки', group: 'b',
  desc: 'Заголовок секции уходит в левую колонку — освободившиеся 210px по высоте забирает список шагов, поэтому активная строка раскрывается на 264px и держит полный текст с кнопкой. В зазоре между колонками стоит линия пути: она заполняется непрерывно и ведёт вниз к активной строке. Сетка 1164 = 372 + 28 + 764.',
  short: 'заголовок в левой колонке, справа вертикальный аккордеон из пяти строк; линия пути стоит в зазоре между колонками',
  css: String.raw`
.pst-layout{position:relative;display:grid;grid-template-columns:372px minmax(0,1fr);gap:28px;align-items:stretch}
.pst-side{display:flex;flex-direction:column;justify-content:space-between;gap:28px;min-width:0}
.pst-side .section-title{font-size:64px}
.pst-count{font-size:15px;font-weight:500;color:var(--dim-dark)}
.pst-count b{color:#fff;font-weight:800}
.pst-spine{position:absolute;left:385px;top:6px;bottom:6px;width:2px;border-radius:2px;background:rgba(167,190,224,.2);z-index:1}
.pst-spine i{display:block;width:100%;height:0;border-radius:2px;background:var(--blue);box-shadow:0 0 0 4px rgba(0,173,255,.1)}

.pst-rail{flex-direction:column;gap:12px}
.pst-mini{flex:0 0 auto;height:76px;border-radius:20px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(167,190,224,.22);transition:height .55s var(--ease),background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-mini:hover{box-shadow:inset 0 0 0 1px rgba(167,190,224,.48)}
.pst-head{position:absolute;left:28px;right:28px;top:0;height:76px;display:flex;align-items:center;gap:18px}
.pst-head .pst-num{flex:none;width:24px}
.pst-head b{flex:1;font-size:19px;font-weight:500;line-height:1.2;transition:color .4s,font-weight .25s}
.pst-head .pst-when{flex:none}
.pst-head .pst-tick{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:#fff;transition:background .45s var(--ease)}
.pst-body{position:absolute;left:28px;right:28px;top:70px;bottom:24px;display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .3s var(--ease)}
.pst-body p{margin:0;font-size:18px;line-height:1.45;color:#fff;max-width:640px}
.pst-body .pst-foot{padding-top:18px}
.pst-mini.is-active{height:234px;background:var(--blue);box-shadow:0 20px 60px rgba(0,90,140,.32)}
.pst-mini.is-active .pst-head b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-head .pst-num{color:#fff;opacity:.75}
.pst-mini.is-active .pst-head .pst-when{color:#fff}
.pst-mini.is-active .pst-body{opacity:1;pointer-events:auto;transition-delay:.2s}
.pst-mini.is-done{background:rgba(9,32,66,.5);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-head b,.pst-mini.is-done .pst-head .pst-num{opacity:.5}
.pst-mini.is-done .pst-head .pst-when{color:var(--dim-dark);opacity:.5}
.pst-mini.is-done .pst-tick{background:var(--blue)}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="pst-layout">
        <div class="pst-side">
          <h2 class="section-title">Как стать<br>партнёром?</h2>
          <p class="pst-count">шаг <b data-pst-count>01</b> из 05</p>
        </div>
        <i class="pst-spine" aria-hidden="true"><i data-pst-fill></i></i>
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="pst-head"><span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i><span class="pst-tick">' + tick + '</span></span>' +
      '<div class="pst-body"><p>' + step.d + '</p>' + (step.cta ? '<div class="pst-foot"><a class="pst-cta" href="#form">' + step.cta + '</a></div>' : '') + '</div>' +
    '</div>';
  const fill = stepsSection.querySelector('[data-pst-fill]');
  const spine = fill.parentElement;
  const count = stepsSection.querySelector('[data-pst-count]');
  let lastAt = [0, 0];
  // строки меняют высоту анимацией — заливку линии пересчитываем и после её окончания
  const applyFill = () => {
    const row = miniNodes[lastAt[0]];
    if (!row) return;
    fill.style.height = Math.min(spine.clientHeight, row.offsetTop + row.offsetHeight * lastAt[1]) + 'px';
  };
  rail.addEventListener('transitionend', (e) => { if (e.propertyName === 'height') applyFill(); });
  const setProgress = (p, index, local) => { lastAt = [index, local]; applyFill(); };
  const setState = (index) => { count.textContent = STEPS[index].n; };
`
};

/* =========================================================================
   v6 «Ползун» — пять строк во всю ширину, по ним ездит голубое выделение
   ========================================================================= */
const v6 = {
  id: 'v6', title: 'Ползун', group: 'b',
  desc: 'Список из пяти строк во всю ширину контейнера — и одно голубое выделение, которое переезжает со строки на строку. Высоты не пляшут: описание активного шага уже стоит в строке и просто проявляется на голубом. У выделения снизу своя полоска — она заполняется внутри шага и показывает, когда ползун поедет дальше.',
  short: 'пять строк во всю ширину и одно голубое выделение, которое переезжает со строки на строку; высоты не меняются',
  css: String.raw`
.pst-rail{position:relative;flex-direction:column;gap:6px}
.pst-slide{position:absolute;left:0;right:0;top:0;height:0;border-radius:22px;background:var(--blue);box-shadow:0 18px 50px rgba(0,90,140,.34);transform:translateY(0);transition:transform .6s var(--spring),height .4s var(--ease),opacity .3s}
.pst-slide i{position:absolute;left:22px;bottom:0;width:calc((100% - 44px) * var(--local,0));height:3px;border-radius:3px 3px 0 0;background:rgba(255,255,255,.6)}
.pst-mini{z-index:1;display:flex;align-items:center;gap:22px;height:88px;padding:0 28px;border-radius:22px;background:rgba(255,255,255,.035);transition:background .45s var(--ease)}
.pst-mini .pst-num{flex:none;width:26px}
.pst-mini b{flex:none;width:200px;font-size:17px;font-weight:500;line-height:1.2;transition:color .4s,font-weight .25s}
.pst-mini p{flex:1;min-width:0;margin:0;font-size:16px;line-height:1.4;color:#fff;opacity:0;transition:opacity .3s var(--ease)}
.pst-mini .pst-foot{flex:none;margin:0;padding:0;gap:16px}
.pst-mini .pst-cta{min-height:40px;padding:12px 22px;font-size:15px;opacity:0;pointer-events:none;transition:opacity .3s var(--ease)}
.pst-mini .pst-when{flex:none;width:100px;text-align:right}
.pst-mini .pst-tick{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:#fff;transition:background .45s var(--ease)}
.pst-mini:hover b{color:#fff}
.pst-mini.is-active{background:transparent}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-num{color:#fff;opacity:.75}
.pst-mini.is-active .pst-when{color:#fff}
.pst-mini.is-active p{opacity:1;transition-delay:.24s}
.pst-mini.is-active .pst-cta{opacity:1;pointer-events:auto;transition-delay:.24s}
.pst-mini.is-done{background:rgba(9,32,66,.42)}
.pst-mini.is-done b,.pst-mini.is-done .pst-num{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.5}
.pst-mini.is-done .pst-tick{background:var(--blue)}
.pst-rail.is-done .pst-slide{opacity:0}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-slide" data-pst-slide aria-hidden="true"><i></i></i></div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b>' +
      '<p>' + step.d + '</p>' +
      (step.cta ? '<span class="pst-foot"><a class="pst-cta" href="#form">' + step.cta + '</a></span>' : '') +
      '<i class="pst-when">' + step.e + '</i><span class="pst-tick">' + tick + '</span>' +
    '</div>';
  const slide = stepsSection.querySelector('[data-pst-slide]');
  const onMeasure = () => { if (miniNodes[0]) slide.style.height = miniNodes[0].offsetHeight + 'px'; };
  const setProgress = (p, index, local) => { slide.style.setProperty('--local', local.toFixed(3)); };
  const setState = (index, allDone) => {
    const row = miniNodes[index];
    if (row) slide.style.transform = 'translateY(' + row.offsetTop + 'px)';
    rail.classList.toggle('is-done', allDone);
  };
`
};

/* =========================================================================
   v7 «Чтение» — весь путь виден текстом, подсветка едет по абзацам
   ========================================================================= */
const v7 = {
  id: 'v7', title: 'Чтение', group: 'b',
  desc: 'Все пять шагов открыты текстом сразу — путь читается целиком, а скролл ведёт по нему подсветку: активный абзац белый и с синей засечкой слева, будущие приглушены, пройденные получают галочку. Ни одна высота не меняется, поэтому блок абсолютно спокойный; движется только свет и заливка линии слева. Сетка 1164 = 372 + 28 + 764.',
  short: 'все пять шагов открыты текстом, скролл ведёт по ним подсветку — активный абзац белый, пройденные с галочкой',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:372px minmax(0,1fr);gap:28px;align-items:stretch;height:clamp(520px,68vh,650px)}
.pst-side{display:flex;flex-direction:column;justify-content:space-between;gap:26px;min-width:0}
.pst-side .section-title{font-size:64px}
.pst-count{font-size:15px;font-weight:500;color:var(--dim-dark)}
.pst-count b{color:#fff;font-weight:800}
.pst-ctaslot{min-height:48px}
.pst-ctaslot .pst-cta{background:var(--blue);color:#fff;opacity:0;pointer-events:none;transition:opacity .35s var(--ease),transform .2s var(--ease),box-shadow .2s}
.pst-ctaslot .pst-cta:hover{box-shadow:0 12px 26px rgba(0,173,255,.34)}
.pst-ctaslot.is-on .pst-cta{opacity:1;pointer-events:auto}

.pst-rail{position:relative;flex-direction:column;justify-content:space-between;padding-left:26px;height:100%}
.pst-rail::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:2px;border-radius:2px;background:rgba(167,190,224,.18)}
.pst-lead{position:absolute;left:0;top:8px;width:2px;height:0;border-radius:2px;background:var(--blue);box-shadow:0 0 0 4px rgba(0,173,255,.1)}
.pst-mini{display:block;padding:2px 0;opacity:.38;transition:opacity .45s var(--ease)}
.pst-mini::before{content:'';position:absolute;left:-26px;top:6px;width:2px;height:0;border-radius:2px;background:#fff;transition:height .45s var(--ease)}
.pst-mini .pst-top{display:flex;align-items:baseline;gap:12px}
.pst-mini .pst-num{flex:none;width:22px}
.pst-mini b{font-size:18px;font-weight:500;line-height:1.2;transition:color .4s,font-weight .25s}
.pst-mini .pst-when{margin-left:auto}
.pst-mini .pst-tick{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;color:#fff;transition:background .45s var(--ease)}
.pst-mini .pst-text{display:block;margin:7px 0 0;font-size:16px;line-height:1.5;color:var(--dim-dark);max-width:700px;transition:color .4s}
.pst-mini:hover{opacity:.62}
.pst-mini.is-active{opacity:1}
.pst-mini.is-active::before{height:calc(100% - 12px)}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-text{color:#fff}
.pst-mini.is-done{opacity:.46}
.pst-mini.is-done .pst-when{color:var(--dim-dark)}
.pst-mini.is-done .pst-tick{background:var(--blue)}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="pst-layout">
        <div class="pst-side">
          <h2 class="section-title">Как стать<br>партнёром?</h2>
          <div>
            <p class="pst-count">шаг <b data-pst-count>01</b> из 05</p>
            <p class="pst-ctaslot is-on" data-pst-ctaslot><a class="pst-cta" href="#form">Оставить заявку</a></p>
          </div>
        </div>
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-lead" data-pst-lead aria-hidden="true"></i></div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-top"><span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i><span class="pst-tick">' + tick + '</span></span>' +
      '<span class="pst-text">' + step.d + '</span>' +
    '</button>';
  const lead = stepsSection.querySelector('[data-pst-lead]');
  const count = stepsSection.querySelector('[data-pst-count]');
  const slot = stepsSection.querySelector('[data-pst-ctaslot]');
  const setProgress = (p, index, local) => {
    const row = miniNodes[index];
    if (!row) return;
    const next = miniNodes[index + 1];
    const from = row.offsetTop + 6;
    const to = next ? next.offsetTop + 6 : rail.clientHeight - 8;
    lead.style.height = Math.max(0, from - 8 + (to - from) * local) + 'px';
  };
  const setState = (index, allDone) => {
    count.textContent = STEPS[index].n;
    slot.classList.toggle('is-on', index === 0 && !allDone);
  };
`
};

/* =========================================================================
   v8 «Спуск» — плашка шагает вниз по левой оси
   ========================================================================= */
const v8 = {
  id: 'v8', title: 'Спуск', group: 'b',
  desc: 'Путь стал вертикальной осью в левой колонке: пять станций с названием и сроком стоят на своих высотах, а голубая плашка физически спускается от станции к станции — на каждом шаге ниже. Заливка оси едет непрерывно и всегда чуть впереди плашки. Сетка 1164 = 300 + 28 + 836.',
  short: 'ось слева, голубая плашка физически спускается от станции к станции; заливка оси идёт чуть впереди плашки',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:28px;align-items:stretch;height:clamp(430px,58vh,540px)}
.pst-rail{position:relative;flex-direction:column;height:100%}
.pst-rail::before{content:'';position:absolute;left:11px;top:8px;bottom:8px;width:2px;border-radius:2px;background:rgba(167,190,224,.2)}
.pst-lead{position:absolute;left:11px;top:8px;width:2px;height:0;border-radius:2px;background:var(--blue);box-shadow:0 0 0 4px rgba(0,173,255,.1)}
.pst-lead::after{content:'';position:absolute;left:-5px;bottom:-1px;width:12px;height:2px;border-radius:2px;background:var(--blue)}
.pst-mini{z-index:1;flex:1 1 0;display:flex;gap:16px;align-items:center;min-height:0}
.pst-dot{flex:none;position:relative;width:24px;height:24px}
.pst-dot i{position:absolute;left:12px;top:12px;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--navy);box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.45);display:grid;place-items:center;color:#fff;transition:width .45s var(--spring),height .45s var(--spring),margin .45s var(--spring),background .4s,box-shadow .4s}
.pst-lab{display:flex;flex-direction:column;gap:5px;min-width:0}
.pst-lab b{display:block;font-size:15px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,font-weight .2s}
.pst-mini:hover .pst-lab b{color:#fff}
.pst-mini.is-active .pst-lab b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-dot i{width:22px;height:22px;margin:-11px 0 0 -11px;background:var(--blue);box-shadow:0 0 0 5px rgba(0,173,255,.16)}
.pst-mini.is-done .pst-dot i{background:var(--blue);box-shadow:none}
.pst-mini.is-done .pst-lab b{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}

.pst-stage{position:relative;min-width:0}
.pst-bigcard{position:absolute;left:0;right:0;top:0;height:246px;transition:transform .62s var(--ease)}
.pst-pane{inset:32px}
.pst-pane h3{font-size:32px;line-height:1.06}
.pst-pane p{margin:14px 0 0;font-size:18px;line-height:1.42;max-width:700px}
.pst-pane em{font-size:16px}
.pst-pane .pst-foot{padding-top:16px}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-lead" data-pst-lead aria-hidden="true"></i></div>
        <div class="pst-stage">
          <div class="pst-bigcard" data-pst-card data-pst-panes></div>
        </div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-dot"><i>' + tick + '</i></span>' +
      '<span class="pst-lab"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span>' +
    '</button>';
  const lead = stepsSection.querySelector('[data-pst-lead]');
  const card = stepsSection.querySelector('[data-pst-card]');
  let stride = 78;
  const onMeasure = () => {
    const stage = card.parentElement;
    stride = (stage.clientHeight - card.offsetHeight) / (STEPS.length - 1);
  };
  const setProgress = (p, index, local) => {
    const row = miniNodes[index];
    if (!row) return;
    const next = miniNodes[index + 1];
    const from = row.offsetTop + row.offsetHeight / 2;
    const to = next ? next.offsetTop + next.offsetHeight / 2 : rail.clientHeight - 8;
    lead.style.height = Math.max(0, from - 8 + (to - from) * local) + 'px';
  };
  const setState = (index) => { card.style.transform = 'translateY(' + (index * stride).toFixed(1) + 'px)'; };
`
};

const VARIANTS = [v1, v2, v3, v4, v5, v6, v7, v8];

/* ---------- страница варианта ---------- */
const page = (v) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.id} — ${v.title}</title>
<style>
${fonts}
${BASE_CSS}
/* ===== ${v.id}: ${v.title} ===== */
${v.css.trim()}
</style>
</head>
<body>

<div class="bumper">
  <h1>${v.id} — ${v.title}</h1>
  <p>${v.desc}</p>
  <p>Скрольте вниз ↓ &nbsp;·&nbsp; <a href="index.html">все варианты</a></p>
</div>

<section class="steps section-dark" id="steps" data-pst>
  <div class="steps__sticky">
    <div class="ambient-field" aria-hidden="true">
      <div class="ambient-glow ambient-glow--steps-left ambient-glow--medium"><div class="ambient-glow__axis"><div class="ambient-glow__core"></div></div></div>
      <div class="ambient-glow ambient-glow--steps-low ambient-glow--small"><div class="ambient-glow__axis"><div class="ambient-glow__core"></div></div></div>
      <div class="ambient-glow ambient-glow--steps-high ambient-glow--small"><div class="ambient-glow__axis"><div class="ambient-glow__core"></div></div></div>
    </div>
${v.body.trim()}
  </div>
</section>

<div class="bumper">
  <h1>Секция открепилась</h1>
  <p>Дальше идёт обычный скролл. <a href="index.html">← Все варианты</a></p>
</div>

<script>
${coreJs(v.js).trim()}
</script>
</body>
</html>
`;

VARIANTS.forEach(v => writeFileSync(join(OUT, v.id + '.html'), page(v)));

/* ---------- галерея серии ---------- */
const item = (v) => `  <a class="item" href="${v.id}.html"><span class="num">${v.id}</span><b>${v.title}</b><span>${v.short}</span></a>`;
const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ход — 8 вариантов блока</title>
<style>
:root{--navy:#1b3a6a;--blue:#00adff;--light:#f2f7fc;--dim:#5a749b}
*{box-sizing:border-box}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:72px 24px}
h1{font-size:52px;font-weight:900;line-height:.96;letter-spacing:-.01em;margin:0 0 12px}
h2{font-size:22px;font-weight:800;margin:38px 0 6px}
.sub{color:var(--dim);font-size:18px;margin:0 0 32px;line-height:1.45}
.hint{color:var(--dim);font-size:15px;margin:0 0 16px;line-height:1.5}
a.item{display:flex;align-items:baseline;gap:18px;padding:22px 26px;margin-bottom:14px;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(27,58,106,.08);text-decoration:none;color:var(--navy);transition:transform .2s,box-shadow .2s}
a.item:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(27,58,106,.14)}
a.item b{font-size:20px;font-weight:800;white-space:nowrap}
a.item span{color:var(--dim);font-size:16px;line-height:1.45}
.num{color:var(--blue);font-weight:800;font-size:20px}
.note{margin-top:40px;color:var(--dim);font-size:14px;line-height:1.6}
.note b{color:var(--navy)}
</style>
</head>
<body>
<div class="wrap">
  <h1>Ход</h1>
  <p class="sub">Восемь подач блока «Как стать партнёром?». Механика везде прежняя: секция пинится, скролл ведёт по пяти шагам, клик по шагу скроллит к нему, кнопка на первом шаге, в финале все пять закрываются галочками. Во всех вариантах появилось то, чего на сайте нет: движение внутри шага (не только между шагами) и ховер. Desktop 1440.</p>

  <h2>v1–v3 — внутри текущей концепции</h2>
  <p class="hint">Слева крупный активный блок, справа таймлайн; отличаются решением таймлайна и пропорцией.</p>
${VARIANTS.filter(v => v.group === 'a').map(item).join('\n')}

  <h2>v4–v8 — вольная композиция</h2>
  <p class="hint">Сохранены только обязательные вещи: пять шагов с текстами и сроками, ощущение пути, завязка на скролл, состояния и кнопка на первом шаге.</p>
${VARIANTS.filter(v => v.group === 'b').map(item).join('\n')}

  <p class="note">
    Тексты шагов, палитра, типографика и радиусы — из сайтовых исходников (<b>site/styles.css</b>, <b>site/app.js</b>). Прошлые серии — <b>active-chip/</b>, <b>big-card/</b>, <b>timeline/</b>, <b>route/</b>, <b>stage/</b>.<br>
    Файлы самодостаточны: инлайн CSS/JS, шрифты YS Geo в base64, без CDN; открываются и по file://, и по http. Пересобрать все восемь — <b>node _build.mjs</b> в этой папке.
  </p>
</div>
</body>
</html>
`;
writeFileSync(join(OUT, 'index.html'), index);
console.log('written:', VARIANTS.map(v => v.id + '.html').join(', '), '+ index.html →', OUT);
