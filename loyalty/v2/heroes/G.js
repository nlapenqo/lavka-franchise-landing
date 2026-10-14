/* G, Бегущие витрины: второй набор карточек для бесшовного цикла, длительность по ширине набора,
   лента едет только когда хиро видно (выбран вариант и секция в кадре) */
(() => {
  const sec = document.querySelector('.h-g');
  if (!sec) return;
  const SPEED = 24; // px/с — очень медленно
  const tracks = [...sec.querySelectorAll('.h-g__track')];
  tracks.forEach(t => [...t.children].forEach(c => t.appendChild(c.cloneNode(true))));
  const fit = () => tracks.forEach(t => { const half = t.scrollWidth / 2; if (half) t.style.setProperty('--dur', (half / SPEED).toFixed(1) + 's'); });
  fit();
  addEventListener('resize', fit);
  document.fonts && document.fonts.ready.then(fit);
  /* скрытая секция (display:none) и секция вне экрана не пересекаются с вьюпортом — лента стоит */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { sec.classList.toggle('is-run', e.isIntersecting); if (e.isIntersecting) fit(); })).observe(sec);
  } else sec.classList.add('is-run');
})();
