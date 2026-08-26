#!/usr/bin/env node
// Собирает корень gh-pages в указанную папку:
//   /            — веб-версия из site/
//   /mobile/     — витрина + мобильная сборка E (пути переписываются под структуру gh-pages)
//   /switch/     — вариант «переключение»: ≥768px веб, <768px мобильная сборка E (m.html)
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

/* 1 · корень — веб-версия */
for (const f of ['index.html', 'styles.css', 'app.js']) copy(`site/${f}`, f);
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

/* 4 · /switch/ — узкое окно уводим на m.html, широкое возвращаем на index.html */
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
</script>`;
write('switch/index.html', webUp.replace(cssLink, switchScript + '\n  ' + cssLink));
write('switch/m.html', read('concepts/mobile/e-figma.html')
  .replaceAll('../../site/assets/', '../assets/')
  .replaceAll('./_shared/', '../mobile/_shared/')
  .replace("location.replace('./showcase.html' + location.hash)",
           "location.replace('./index.html' + location.hash)")
  .replace("wide.addEventListener ? wide.addEventListener('change', jump) : wide.addListener(jump);",
           "wide.addEventListener ? wide.addEventListener('change', jump) : wide.addListener(jump);\n  addEventListener('resize', jump);"));

/* 5 · /fluid/ — один документ, styles.css + fluid.css */
write('fluid/index.html', webUp.replace(cssLink,
  cssLink + '\n  <link rel="stylesheet" href="./fluid.css">'));
copy('concepts/adaptive/fluid.css', 'fluid/fluid.css');

console.log('Собрано в', dest);
