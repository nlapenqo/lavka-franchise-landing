// Комплект для верстальщиков: node breakfast-meeting/pack.mjs → export/breakfast-meeting-<дата>.zip
//   breakfast-meeting.html      — всё внутри (стили, скрипт, шрифты, картинки), открывается двойным кликом
//   breakfast-meeting-lpc.html  — для конструктора LPC: шрифты ссылками на yastatic.net (зашитые LPC вырезает)
//   source/                     — исходники с плоскими путями: index.html, css/, js/, fonts/, assets/
//   og.png, favicon.svg, README.txt
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url)), repo = join(here, '..');
const date = new Date().toISOString().slice(0, 10);
const name = `breakfast-meeting-${date}`;
const out = join(repo, 'export', name);
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'source/css'), { recursive: true });
for (const d of ['js', 'fonts', 'assets']) mkdirSync(join(out, 'source', d), { recursive: true });

// 1 · полная сборка
execFileSync('node', [join(repo, 'blocks/build.mjs'), '--in', join(here, 'index.html'), join(out, 'breakfast-meeting.html')], { stdio: 'inherit' });
const full = readFileSync(join(out, 'breakfast-meeting.html'), 'utf8');

// 2 · LPC: YS Geo с yastatic (400/500, 800 и 900 → black), YS Text Cond → локальный YS Text, каскад защищён
const YS = 'https://yastatic.net/s3/home/fonts/ys/4/';
const geo = { 400: 'text-geo-regular.woff2', 500: 'text-geo-medium.woff2', 800: 'text-geo-black.woff2', 900: 'text-geo-black.woff2' };
let lpc = full
  .replace(/@font-face\{font-family:'YS Geo';src:url\(data:font\/woff2;base64,[^)]+\) format\('woff2'\);font-weight:(\d+);font-display:swap\}/g,
    (m, w) => `@font-face{font-family:'YS Geo';src:url('${YS}${geo[w]}') format('woff2');font-weight:${w};font-display:swap}`)
  .replace(/@font-face\{font-family:'YS Text Cond';src:url\(data:font\/woff2;base64,[^)]+\) format\('woff2'\);font-weight:300;font-display:swap\}/,
    "@font-face{font-family:'YS Text Cond';src:local('YS Text');font-weight:300;font-display:swap}")
  .replace('</head>', `<style data-file="lpc.css">
/* LPC: платформа перебивает font-family — возвращаем фирменный шрифт */
body, body :where(*):not(.t-legal):not(.t-legal *){font-family:'YS Geo','YS Text',Arial,sans-serif !important}
.t-legal, .t-legal *{font-family:'YS Text','YS Geo',Arial,sans-serif !important}
</style>
</head>`);
if (/data:font\/woff2/.test(lpc)) throw new Error('LPC: остался зашитый шрифт');
writeFileSync(join(out, 'breakfast-meeting-lpc.html'), lpc);

// 3 · исходники с плоскими путями
const flat = p => p.replace('../blocks/', 'css/').replace('css/blocks.js', 'js/blocks.js').replace('../site/assets/figma/', 'assets/').replace('./assets/', 'assets/');
let html = readFileSync(join(here, 'index.html'), 'utf8')
  .replace(/(src|href|content)="((?:\.\.?\/)[^"]+)"/g, (m, a, p) => `${a}="${flat(p)}"`);
writeFileSync(join(out, 'source/index.html'), html);
for (const f of ['tokens.css', 'base.css', 'blocks.css'])
  writeFileSync(join(out, 'source/css', f), readFileSync(join(repo, 'blocks', f), 'utf8').replaceAll('../site/fonts/', '../fonts/'));
copyFileSync(join(repo, 'blocks/blocks.js'), join(out, 'source/js/blocks.js'));
for (const f of ['YS Geo-Regular', 'YS Geo-Medium', 'YS Geo-Heavy', 'YS Geo-Black', 'YS Text Cond-Light']) copyFileSync(join(repo, 'site/fonts', f + '.woff2'), join(out, 'source/fonts', f + '.woff2'));
for (const f of html.match(/assets\/[^"')\s]+/g).filter((v, i, a) => a.indexOf(v) === i)) {
  const from = [join(here, f), join(repo, 'site/assets/figma', f.slice(7))].find(p => { try { readFileSync(p); return true; } catch { return false; } });
  if (!from) throw new Error('нет файла ' + f);
  copyFileSync(from, join(out, 'source', f));
}
copyFileSync(join(repo, 'site/assets/figma/favicon.svg'), join(out, 'favicon.svg'));
execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(join(here, 'assets/og-source.webp'))}).convert('RGB').save(${JSON.stringify(join(out, 'og.png'))})`]);
writeFileSync(join(out, 'README.txt'), readFileSync(join(here, 'pack-readme.txt'), 'utf8').replaceAll('{date}', date));

// 4 · архив
rmSync(join(repo, 'export', name + '.zip'), { force: true });
execFileSync('zip', ['-rqX', name + '.zip', name], { cwd: join(repo, 'export') });
console.log(`export/${name}.zip`); for (const f of readdirSync(out)) console.log('  ' + f);
