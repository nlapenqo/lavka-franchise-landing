#!/usr/bin/env node
// Собирает корень gh-pages в указанную папку:
//   /            — выбранный вариант «переключение»: ≥768px веб из site/, <768px мобильная сборка E (m.html)
//   /mobile/     — витрина + мобильная сборка E (пути переписываются под структуру gh-pages)
//   /switch/     — тот же вариант «переключение» отдельной страницей (для сравнения)
//   /fluid/      — вариант «плавный»: веб-документ + concepts/adaptive/fluid.css
// Использование: node tools/build-deploy-root.mjs <куда-собирать>
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = process.argv[2] && resolve(process.argv[2]);
if (!dest) { console.error('Использование: node tools/build-deploy-root.mjs <куда-собирать>'); process.exit(1); }

const read = p => readFileSync(join(root, p), 'utf8');
const write = (p, s) => { mkdirSync(dirname(join(dest, p)), { recursive: true }); writeFileSync(join(dest, p), s); };
const copy = (from, to) => { mkdirSync(dirname(join(dest, to)), { recursive: true }); cpSync(join(root, from), join(dest, to), { recursive: true }); };

/* Мобильная сборка E c путями под размещение в папке dir ('' — корень gh-pages).
   Широкий экран уводит на веб-версию рядом (./index.html), заголовок — продовый. */
const mobilePage = (assetsUp, sharedPath) => read('concepts/mobile/e-figma.html')
  .replaceAll('../../site/assets/', assetsUp)
  .replaceAll('./_shared/', sharedPath)
  .replace('<title>Мобилка E — Одна сущность · Франшиза Яндекс Лавки</title>',
           '<title>Франшиза Яндекс Лавки</title>')
  .replace("location.replace('./showcase.html' + location.hash)",
           "location.replace('./index.html' + location.hash)")
  .replace("wide.addEventListener ? wide.addEventListener('change', jump) : wide.addListener(jump);",
           "wide.addEventListener ? wide.addEventListener('change', jump) : wide.addListener(jump);\n  addEventListener('resize', jump);");

/* Редирект веб-страницы: узкое окно уводим на m.html рядом */
const switchScript = `<script>
/* <768px — мобильная сборка (m.html); она делает обратный редирект при расширении */
(() => {
  if (window.top !== window.self) return;
  const narrow = matchMedia('(max-width: 767px)');
  const jump = () => { if (narrow.matches) location.replace('./m.html' + location.hash); };
  jump();
  narrow.addEventListener ? narrow.addEventListener('change', jump) : narrow.addListener(jump);
  addEventListener('resize', jump);
})();
<\/script>`;

/* 1 · корень — выбранный вариант «переключение»: веб ≥768px, мобильная сборка E <768px */
const webRoot = read('site/index.html');
const rootCss = '<link rel="stylesheet" href="./styles.css">';
if (!webRoot.includes(rootCss)) { console.error('Не нашёл ссылку на styles.css в site/index.html'); process.exit(1); }
write('index.html', webRoot.replace(rootCss, switchScript + '\n  ' + rootCss));
write('m.html', mobilePage('./assets/', './mobile/_shared/'));
for (const f of ['styles.css', 'app.js']) copy(`site/${f}`, f);
copy('site/assets', 'assets');
copy('site/fonts', 'fonts');
write('.nojekyll', '');

/* 2 · /mobile/ — витрина с айфоном + концепт E */
copy('concepts/mobile/showcase.html', 'mobile/index.html');
copy('concepts/mobile/showcase.html', 'mobile/showcase.html');
write('mobile/e-figma.html', read('concepts/mobile/e-figma.html')
  .replaceAll('../../site/assets/', '../assets/'));
write('mobile/_shared/base.css', read('concepts/mobile/_shared/base.css')
  .replaceAll('../../../site/fonts/', '../../fonts/'));
copy('concepts/mobile/_shared/content.js', 'mobile/_shared/content.js');
copy('concepts/mobile/_shared/blocks.js', 'mobile/_shared/blocks.js');

/* 3 · веб-страница с путями из подпапки — общая заготовка для /switch/ и /fluid/ */
const webUp = read('site/index.html')
  .replaceAll('"./styles.css"', '"../styles.css"')
  .replaceAll('"./app.js"', '"../app.js"')
  .replaceAll('"./assets/', '"../assets/');
const cssLink = '<link rel="stylesheet" href="../styles.css">';
if (!webUp.includes(cssLink)) { console.error('Не нашёл ссылку на styles.css в site/index.html'); process.exit(1); }

/* 4 · /switch/ — та же связка, что в корне (оставлена как страница варианта) */
write('switch/index.html', webUp.replace(cssLink, switchScript + '\n  ' + cssLink));
write('switch/m.html', mobilePage('../assets/', '../mobile/_shared/'));

/* 5 · /fluid/ — один документ, styles.css + fluid.css */
write('fluid/index.html', webUp.replace(cssLink,
  cssLink + '\n  <link rel="stylesheet" href="./fluid.css">'));
copy('concepts/adaptive/fluid.css', 'fluid/fluid.css');

console.log('Собрано в', dest);
