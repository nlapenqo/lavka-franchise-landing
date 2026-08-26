// Серия «Лента» — переработка variant-4 (полноширинная лента, активная карточка растёт).
// Проблема оригинала: flex-basis анимируется на 400px (layout-анимация, соседи «переезжают»),
// центр считается по мгновенным offsetLeft, а движение ленты идёт только в последних 40% шага —
// получается «стоп → рывок → стоп». Здесь три разные механики, все — только на transform,
// с одной непрерывной функцией положения от скролла.
// node _build.mjs → r1–r3.html + index.html. Шрифты — из ../timeline/v1.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fonts = readFileSync(join(here, '../timeline/v1.html'), 'utf8').split('\n').filter(l => l.startsWith('@font-face')).join('\n').trim();
if (!fonts.includes('font-weight:900')) throw new Error('не нашёл @font-face');

const BASE_CSS = String.raw`
:root{--navy:#1b3a6a;--navy-deep:#152f57;--blue:#00adff;--sky:#aad9fc;--light:#f2f7fc;--dim:#5a749b;--dim-dark:#a7bee0;--ease:cubic-bezier(.22,.61,.36,1);--ease-expo:cubic-bezier(.16,1,.3,1)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased;overflow-x:clip}
button{border:0;background:none;cursor:pointer;font:inherit;color:inherit}
a{color:inherit;text-decoration:none}
.bumper{min-height:72vh;display:grid;place-content:center;text-align:center;gap:14px;padding:40px}
.bumper h1{font-size:44px;font-weight:900;line-height:1;margin:0;letter-spacing:-.01em}
.bumper p{margin:0;color:var(--dim);font-size:18px;max-width:880px}
.bumper a{color:var(--blue);font-weight:500}

.steps{height:560vh}
.sticky{position:sticky;top:0;height:100vh;overflow:hidden;background:linear-gradient(160deg,#20477f 0%,var(--navy) 48%,var(--navy-deep) 100%);color:#fff;display:grid;align-items:center}
.glow{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(0,173,255,.5),transparent 72%);filter:blur(60px);pointer-events:none}
.glow-a{width:900px;height:900px;left:-320px;bottom:-380px}
.glow-b{width:640px;height:640px;right:-220px;top:-260px;opacity:.55}
.inner{position:relative;width:min(1164px,calc(100% - 48px));margin-inline:auto}
.head{display:flex;align-items:flex-end;justify-content:space-between;gap:48px;margin-bottom:36px}
.title{margin:0;font-size:72px;font-weight:900;line-height:.92;letter-spacing:-.01em}
.count{display:flex;align-items:baseline;gap:8px}
.count strong{color:var(--blue);font-size:44px;line-height:1.05;font-weight:800;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.count span{color:var(--dim-dark);font-size:22px;font-weight:500}
.bar{height:8px;border-radius:999px;background:rgba(167,190,224,.18);overflow:hidden;margin-bottom:40px}
.bar i{display:block;height:100%;width:0;border-radius:inherit;background:var(--blue)}

.viewport{position:relative;width:100%;overflow:hidden;padding-block:6px}
.track{display:flex;gap:22px;will-change:transform;width:max-content}
.card{position:relative;flex:0 0 340px;height:420px;border-radius:32px;overflow:hidden;color:var(--dim-dark);box-shadow:inset 0 0 0 1px rgba(167,190,224,.28);cursor:pointer;text-align:left;padding:0}
.card:focus-visible{outline:3px solid rgba(0,173,255,.5);outline-offset:3px}
.card .fold{position:absolute;inset:30px;display:flex;flex-direction:column;justify-content:space-between;transition:opacity .35s var(--ease)}
.card .fold span{font-size:16px;font-weight:500}
.card .fold b{font-size:19px;font-weight:500;line-height:1.25;opacity:.85}
.card .fold i{font-style:normal;font-size:15px;color:var(--blue);font-weight:500}
.card .full{position:absolute;inset:36px;display:flex;flex-direction:column;opacity:0;pointer-events:none;color:#fff;transition:opacity .25s var(--ease)}
.card .full span{font-size:16px;font-weight:500;opacity:.85}
.card .full h3{margin:14px 0 0;font-size:36px;font-weight:800;line-height:1.02;letter-spacing:-.01em}
.card .full p{margin:16px 0 0;font-size:18px;line-height:1.45;max-width:540px}
.card .full em{margin-top:auto;font-style:normal;font-size:18px;font-weight:500;opacity:.9}
.card .cta{position:relative;z-index:2;display:inline-flex;align-items:center;min-height:46px;padding:13px 26px;margin-top:18px;border-radius:999px;background:#fff;color:var(--navy);font-size:16px;font-weight:500;line-height:1;transition:transform .2s var(--ease),box-shadow .2s;align-self:flex-start}
.card .cta:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(9,40,80,.28)}
.tick{position:absolute;top:26px;right:26px;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.tick svg{width:12px;height:12px;opacity:0;transform:scale(.4);transition:opacity .3s,transform .45s cubic-bezier(.34,1.4,.64,1)}
.card.is-done .tick{background:var(--blue);box-shadow:none}
.card.is-done .tick svg{opacity:1;transform:none}
.card.is-done{background:rgba(9,32,66,.5);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.card.is-done .fold{opacity:.55}
.card.is-done.is-active{background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.4);color:#fff}
.card.is-done.is-active .fold{opacity:0}
.card.is-done.is-active .full{opacity:1;pointer-events:auto}
.card.is-done.is-active .tick{background:#fff;color:var(--blue)}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition-duration:.01ms!important}}
`;

const TICK = `<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const coreJs = (variant) => String.raw`
const STEPS=[
 {n:'01',t:'Заявка\nна сайте',d:'Заполните анкету — мы свяжемся с вами, обсудим формат сотрудничества и ответим на первые вопросы',e:'1 неделя',cta:'Оставить заявку'},
 {n:'02',t:'Собеседование\nи отбор',d:'Обсуждаем ваш опыт, мотивацию и возможности. В каждом городе выбираем одного партнёра для открытия сети дарксторов',e:'2–3 недели'},
 {n:'03',t:'Подготовка\nпомещений',d:'Подбираете помещение по стандартам сети, мы готовим планировку и помогаем с поставщиками оборудования. Ремонт и стройку ведёте вы, мы сопровождаем каждый этап',e:'2–4 месяца'},
 {n:'04',t:'Подбор\nперсонала',d:'Параллельно набираете команду: кладовщиков, курьеров и директоров дарксторов. Помогаем привлекать персонал с помощью операционного маркетинга',e:'1–2 месяца'},
 {n:'05',t:'Запуск\nсервиса',d:'Дарксторы заполняются товарами, мы разворачиваем <span style="white-space:nowrap">IT-инфраструктуру</span> и запускаем рекламную кампанию в городе — вы начинаете принимать заказы',e:'1–2 недели'}
];
const N=STEPS.length, tick='${TICK}';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const br=s=>s.replace(/\n/g,'<br>');
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const ss=t=>t*t*(3-2*t);
const track=document.querySelector('[data-track]');
STEPS.forEach((s,i)=>{
  track.insertAdjacentHTML('beforeend',
    '<button class="card'+(i?'':' is-active')+'" type="button" aria-label="Шаг '+s.n+': '+s.t.replace('\n',' ')+', '+s.e+'">'+
       '<span class="fold"><span>'+s.n+'</span><span><b>'+br(s.t)+'</b><br><i>'+s.e+'</i></span></span>'+
       '<span class="full"><span>'+s.n+'</span><h3>'+br(s.t)+'</h3><p>'+s.d+'</p><em>'+s.e+'</em>'+(s.cta?'<a class="cta" href="#form">'+s.cta+'</a>':'')+'</span>'+
       '<span class="tick">'+tick+'</span>'+
     '</button>');
});
const section=document.querySelector('[data-steps]'),
      sticky=document.querySelector('.sticky'),
      count=document.querySelector('[data-count]'),
      bar=document.querySelector('[data-bar]'),
      cards=[...track.children];
let cur=-1;
${variant}
// клик по карточке — к её отрезку; состояние по-прежнему от скролла
cards.forEach((el,i)=>el.addEventListener('click',()=>{
  const total=section.offsetHeight-innerHeight; if(total<=0)return;
  scrollTo({top:section.getBoundingClientRect().top+scrollY+((i+0.5)/N)*total,behavior:reduced?'auto':'smooth'});
}));
let raf=0;
const tick_=()=>{raf=0;update();};
addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(tick_)},{passive:true});
addEventListener('resize',()=>{measure();update()},{passive:true});
document.fonts?.ready.then(()=>{measure();update()});
measure();update();
`;

/* r1 «Ход» — карточки не меняют ширину. Активная — та, что в центре, edет непрерывно.
   Активной карточке ширину не даём: у всех 340, но у активной внутри показывается полный текст,
   а сама она чуть выше (scale) — движение только на transform. Лента едет линейно с небольшим
   «магнитом» к центру карточки. */
const r1 = {
  id: 'r1', title: 'Ровный ход',
  desc: 'Карточки одной ширины (460px), ни одна не растёт — поэтому нечему дёргаться. Лента привязана к скроллу напрямую, но по одной гладкой кривой: карточка стоит в центре первые 62% шага, потом за оставшиеся 38% плавно (smoothstep, без рывка на старте и финише) переезжает к следующей. Активная поднимается на 6px и раскрывает полный текст. Всё движение — transform.',
  short: 'карточки одной ширины, ничего не растёт; лента едет непрерывно с мягким «магнитом» к центру',
  css: String.raw`
.card{flex-basis:460px;height:440px;transition:transform .5s var(--ease-expo),background .5s var(--ease),box-shadow .5s,color .5s}
.card .fold{inset:32px}
.card.is-active{background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.4);color:#fff;transform:translateY(-6px)}
.card.is-active .fold{opacity:0}
.card.is-active .full{opacity:1;pointer-events:auto;transition-delay:.15s}
.card.is-done .full{opacity:0;pointer-events:none}
.card .full p{max-width:400px;font-size:17px}
.card .full h3{font-size:34px}
`,
  js: String.raw`
let centers=[],half=0;
function measure(){centers=cards.map(el=>el.offsetLeft+el.offsetWidth/2);half=sticky.getBoundingClientRect().width/2;}
// положение ленты: непрерывная функция от p; «магнит» — плато в середине каждого шага
function pos(raw){
  const idx=Math.min(N-1,Math.floor(raw)), f=clamp(raw-idx,0,1);
  // карточка стоит в центре 0–62% шага, потом гладко (smoothstep) переезжает к следующей
  const t=f<.62?0:ss((f-.62)/.38);
  const a=centers[idx], b=centers[Math.min(N-1,idx+1)];
  return a+(b-a)*t;
}
function update(){
  const total=section.offsetHeight-innerHeight; if(total<=0)return;
  const p=clamp(-section.getBoundingClientRect().top/total,0,1);
  const raw=p*N, idx=Math.min(N-1,Math.floor(raw)), f=clamp(raw-idx,0,1);
  bar.style.width=(p*100)+'%';
  const allDone=p>=.95;
  // активная переключается ровно посередине перегона (f=.5 внутри плато-нет: на t=.5 → f=.5)
  const act=allDone?N-1:idx, key=act+(allDone?':d':'');
  if(key!==cur){cur=key;count.textContent=STEPS[idx].n;
    cards.forEach((el,i)=>{el.classList.toggle('is-active',i===act);el.classList.toggle('is-done',allDone||i<idx);});}
  track.style.transform='translate3d('+(half-pos(raw))+'px,0,0)';
}
`
};

/* r2 «Пружина» — лента не привязана к скроллу напрямую: скролл задаёт цель (индекс),
   а лента догоняет её пружиной. Нет никаких прыжков — любое изменение цели идёт через физику. */
const r2 = {
  id: 'r2', title: 'Пружина',
  desc: 'Скролл больше не двигает ленту напрямую — он только выбирает целевую карточку. Лента догоняет цель пружиной (stiffness 120, damping 22): быстрый разгон, мягкая посадка, любой рывок скролла сглаживается физикой. Все карточки одной ширины 460px — ничего не растёт, соседи не переезжают; активная поднимается и раскрывает текст.',
  short: 'скролл выбирает цель, лента догоняет её пружиной; карточки одной ширины, ничего не растёт',
  css: String.raw`
.card{flex-basis:460px;height:440px;transition:transform .5s var(--ease-expo),background .5s var(--ease),box-shadow .5s,color .5s}
.card .fold{inset:32px}
.card.is-active{background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.4);color:#fff;transform:translateY(-6px)}
.card.is-active .fold{opacity:0}
.card.is-active .full{opacity:1;pointer-events:auto;transition-delay:.15s}
.card.is-done .full{opacity:0;pointer-events:none}
.card .full p{max-width:400px;font-size:17px}
.card .full h3{font-size:34px}
`,
  js: String.raw`
let centers=[],half=0;
function measure(){centers=cards.map(el=>el.offsetLeft+el.offsetWidth/2);half=sticky.getBoundingClientRect().width/2;}
let x=0,v=0,last=0,animating=false,goal=0;
function step(now){
  const dt=Math.min(.05,(now-last)/1000||.016); last=now;
  const k=120,d=22; v+=(-k*(x-goal)-d*v)*dt; x+=v*dt;
  track.style.transform='translate3d('+(half-x)+'px,0,0)';
  if(Math.abs(x-goal)>.2||Math.abs(v)>.2)requestAnimationFrame(step); else {x=goal;v=0;animating=false;track.style.transform='translate3d('+(half-x)+'px,0,0)';}
}
function kick(){if(!animating){animating=true;last=performance.now();requestAnimationFrame(step);}}
function update(){
  const total=section.offsetHeight-innerHeight; if(total<=0)return;
  const p=clamp(-section.getBoundingClientRect().top/total,0,1);
  const idx=Math.min(N-1,Math.floor(p*N));
  bar.style.width=(p*100)+'%';
  const allDone=p>=.95, act=allDone?N-1:idx, key=act+(allDone?':d':'');
  if(key!==cur){
    const first=cur===-1&&!animating&&x===0;
    cur=key;count.textContent=STEPS[idx].n;
    cards.forEach((el,i)=>{el.classList.toggle('is-active',i===act);el.classList.toggle('is-done',allDone||i<idx);});
    goal=centers[idx];
    if(reduced||first){x=goal;v=0;track.style.transform='translate3d('+(half-x)+'px,0,0)';}
    else kick();
  }
}
`
};

const r3 = {
  id: 'r3', title: 'Веер',
  desc: 'Лента вообще не едет — нечему дёргаться. Пять карточек стоят веером в центре: активная выходит вперёд в полный размер (740px), пройденные уходят влево и назад, будущие — вправо и назад, каждая следующая на 44px дальше и на 5% меньше. Смена шага — одно движение всех пяти карточек по transform с одной кривой (.7s expo). Скролл только переключает шаг.',
  short: 'лента не едет: карточки стоят веером, активная выходит вперёд, остальные отступают назад со scale',
  css: String.raw`
.viewport{overflow:visible;padding-block:12px}
.fan{position:relative;width:min(1164px,calc(100% - 48px));margin-inline:auto;height:440px}
.card{position:absolute;left:50%;top:0;width:740px;height:440px;margin-left:-370px;transform-origin:50% 100%;transition:transform .7s var(--ease-expo),opacity .5s var(--ease),background .5s var(--ease),box-shadow .5s,color .5s;background:rgba(27,58,106,.92)}
.card .fold{inset:32px}
.card .fold b{font-size:24px}
.card.is-active{background:var(--blue);box-shadow:0 30px 80px rgba(0,60,120,.5);color:#fff}
.card.is-active .fold{opacity:0}
.card.is-active .full{opacity:1;pointer-events:auto;transition-delay:.25s}
.card .full h3{font-size:38px}
.card .full p{max-width:560px}
.card.is-done{background:rgba(9,32,66,.85)}
`,
  js: String.raw`
function measure(){}
function place(act){
  cards.forEach((el,i)=>{
    const d=i-act;                         // <0 пройдено, >0 впереди
    const dir=Math.sign(d), k=Math.abs(d);
    const dx=dir*(k*470), s=1-k*.1, dy=k*16;
    el.style.transform='translate3d('+dx+'px,'+dy+'px,0) scale('+s.toFixed(3)+')';
    el.style.zIndex=String(10-k);
    el.style.opacity=k>2?'0':'1';
  });
}
function update(){
  const total=section.offsetHeight-innerHeight; if(total<=0)return;
  const p=clamp(-section.getBoundingClientRect().top/total,0,1);
  const idx=Math.min(N-1,Math.floor(p*N));
  bar.style.width=(p*100)+'%';
  const allDone=p>=.95, act=allDone?N-1:idx, key=act+(allDone?':d':'');
  if(key!==cur){cur=key;count.textContent=STEPS[idx].n;
    cards.forEach((el,i)=>{el.classList.toggle('is-active',i===act);el.classList.toggle('is-done',allDone||i<idx);});
    place(act);
  }
}
`
};

const VARIANTS = [r1, r2, r3];

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

<section class="steps" data-steps>
  <div class="sticky">
    <div class="glow glow-a"></div>
    <div class="glow glow-b"></div>
    <div class="inner">
      <div class="head">
        <h2 class="title">Как стать<br>партнёром?</h2>
        <div class="count"><strong data-count>01</strong><span>из 05</span></div>
      </div>
      <div class="bar" role="progressbar" aria-label="Прогресс шагов"><i data-bar></i></div>
    </div>
    ${v.id === 'r3' ? '<div class="viewport"><div class="fan" data-track></div></div>' : '<div class="viewport"><div class="track" data-track></div></div>'}
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

VARIANTS.forEach(v => writeFileSync(join(here, v.id + '.html'), page(v)));

const item = (v) => `  <a class="item" href="${v.id}.html"><span class="num">${v.id}</span><b>${v.title}</b><span>${v.short}</span></a>`;
writeFileSync(join(here, 'index.html'), `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Лента — 3 механики</title>
<style>
:root{--navy:#1b3a6a;--blue:#00adff;--light:#f2f7fc;--dim:#5a749b}
*{box-sizing:border-box}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:72px 24px}
h1{font-size:52px;font-weight:900;line-height:.96;letter-spacing:-.01em;margin:0 0 12px}
.sub{color:var(--dim);font-size:18px;margin:0 0 32px;line-height:1.45}
a.item{display:flex;align-items:baseline;gap:18px;padding:22px 26px;margin-bottom:14px;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(27,58,106,.08);text-decoration:none;color:var(--navy);transition:transform .2s,box-shadow .2s}
a.item:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(27,58,106,.14)}
a.item b{font-size:20px;font-weight:800;white-space:nowrap}
a.item span{color:var(--dim);font-size:16px;line-height:1.45}
.num{color:var(--blue);font-weight:800;font-size:20px}
.note{margin-top:40px;color:var(--dim);font-size:14px;line-height:1.6}
.note b{color:var(--navy)}
</style></head><body><div class="wrap">
<h1>Лента</h1>
<p class="sub">Три механики поверх композиции <b>variant-4</b> (полноширинная лента, активная карточка растёт). В оригинале дёргалось из-за трёх вещей сразу: flex-basis анимировался на 400px (соседи «переезжают»), центр считался по мгновенным offsetLeft, а лента ехала только в последних 40% шага — «стоп → рывок → стоп». Здесь всё движение только через transform, положение — одна непрерывная функция от скролла.</p>
${VARIANTS.map(item).join('\n')}
<p class="note">Пересобрать — <b>node _build.mjs</b> в этой папке. Оригинал — <b>../variant-4.html</b>.</p>
</div></body></html>
`);
console.log('written:', VARIANTS.map(v => v.id + '.html').join(', '), '+ index.html');
