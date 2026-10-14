/* I, «Слова и вещи»: подарок в пилюле сменяется раз в 3,6 с; пауза, когда хиро скрыт или вне экрана */
(() => {
  const sec = document.querySelector('.h-i');
  if (!sec) return;
  const box = sec.querySelector('[data-i-gift]');
  /* id и цена в монетах — из каталога GIFTS (v2.js) */
  const LIST = [['airpods-max', 1000], ['rover', 300], ['iphone-air', 1600], ['travelmug', 100], ['station-max', 600], ['promo-lavka', 100], ['yandex-drops', 200], ['tv', 600]];
  box.innerHTML = LIST.map(([id, p], k) => `<span class="h-i__g${k ? '' : ' is-on'}"><img src="../assets/gifts/${id}.webp" alt="" decoding="async"${k ? ' loading="lazy"' : ''}><b><svg aria-hidden="true"><use href="#coin"/></svg>${p}</b></span>`).join('');
  const items = [...box.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, timer = 0, inView = false;

  function next() {
    const a = items[cur]; cur = (cur + 1) % items.length; const b = items[cur];
    a.classList.remove('is-on'); a.classList.add('is-off');
    b.classList.remove('is-off'); b.classList.add('is-on');
    /* уходящий возвращается в исходное положение невидимым, когда погас */
    setTimeout(() => a.classList.contains('is-on') || a.classList.remove('is-off'), 1300);
  }
  function sync() {
    const shown = sec.classList.contains('is-v') || document.body.classList.contains('is-all');
    const run = shown && inView && !document.hidden && !reduced;
    sec.classList.toggle('is-run', run);
    if (run && !timer) timer = setInterval(next, 3600);
    if (!run && timer) { clearInterval(timer); timer = 0; }
  }
  new IntersectionObserver(es => { inView = es[0].isIntersecting; sync(); }, { threshold: .15 }).observe(sec);
  new MutationObserver(sync).observe(sec, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', sync);
})();
