// Финальный сайт бизнес-завтрака без библиотеки блоков: node breakfast-meeting/final.mjs
//   export/breakfast-meeting-site/  — index.html, styles.css (только используемые правила), script.js (только нужные модули), fonts/, images/
//   export/breakfast-meeting.html   — то же одним файлом (всё внутри)
//   export/breakfast-meeting-<дата>.zip — обе версии + README.txt
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url)), repo = join(here, '..'), exp = join(repo, 'export');
const site = join(exp, 'breakfast-meeting-site');
rmSync(site, { recursive: true, force: true });
mkdirSync(join(site, 'fonts'), { recursive: true }); mkdirSync(join(site, 'images'), { recursive: true });
const src = readFileSync(join(here, 'index.html'), 'utf8');

// ---------- JS: blocks.js без модулей, которых нет на странице, + плеер видео ----------
let js = readFileSync(join(repo, 'blocks/blocks.js'), 'utf8');
const cut = (from, to, put = '') => { const a = js.indexOf(from), b = js.indexOf(to); if (a < 0 || b < a) throw new Error('JS: нет ' + from); js = js.slice(0, a) + put + js.slice(b); };
cut('  /* цифры: свечение', '  /* текст + кадр', `  /* появление по скроллу: блок видно на 16 % — opacity и сдвиг снизу (см. .reveal) */
  if (reduced || !('IntersectionObserver' in window)) $$('.reveal').forEach(n => n.classList.add('is-visible'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .16, rootMargin: '0px 0px -7% 0px' });
    $$('.reveal').forEach(n => io.observe(n));
  }

`);
cut('  /* текст + кадр', '  /* дропдаун');
js = js.replace(/const AUTO = '[^']+';/, "const AUTO = 'h2.t-h1,.card,.step,.lead__copy,.form-card';")
  .replace(/^\/\*[^\n]*\*\/\n/, '/* Бизнес-завтрак «Франшиза Яндекс Лавки»: интерактив страницы. Каждый модуль включается по data-атрибуту. */\n')
  .replace(/\}\)\(\);\s*$/, () => `
  /* видео: клик по постеру подменяет его плеером VH */
  $$('[data-video]').forEach(box => $('.video__play', box).addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = box.dataset.video; f.allow = 'autoplay; fullscreen'; f.allowFullscreen = true; f.title = 'Видео';
    box.replaceChildren(f);
  }));
})();
`);
writeFileSync(join(site, 'script.js'), js);

// ---------- HTML ----------
const pageCss = src.match(/<style>([\s\S]*?)<\/style>/)[1];
const IMG = { '../site/assets/figma/': '', './assets/': '' };
const copied = new Set();
let html = src
  .replace(/<!--[\s\S]*?-->\n?/g, '')
  .replace(/<link rel="stylesheet" href="\.\.\/blocks\/tokens\.css">\n<link rel="stylesheet" href="\.\.\/blocks\/base\.css">\n<link rel="stylesheet" href="\.\.\/blocks\/blocks\.css">\n<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="./styles.css">')
  .replace(/<script src="\.\.\/blocks\/blocks\.js"><\/script>\n<script>[\s\S]*?<\/script>/, '<script src="./script.js"></script>')
  .replace(/(src|href|content)="(\.\.\/site\/assets\/figma\/|\.\/assets\/)([^"]+)"/g, (m, a, dir, f) => {
    const from = dir === './assets/' ? join(here, 'assets', f) : join(repo, 'site/assets/figma', f);
    if (f === 'og-source.webp') { execFileSync('python3', ['-c', `from PIL import Image; Image.open(${JSON.stringify(from)}).convert('RGB').save(${JSON.stringify(join(site, 'images/og.png'))})`]); return `${a}="./images/og.png"`; }
    copyFileSync(from, join(site, 'images', f)); copied.add(f); return `${a}="./images/${f}"`;
  });
if (/\.\.\/|blocks\//.test(html)) throw new Error('HTML: остались пути в blocks/ или site/');
writeFileSync(join(site, 'index.html'), html);

// ---------- CSS: tokens + base + blocks + правила страницы, только используемое ----------
let css = ['tokens', 'base', 'blocks'].map(f => readFileSync(join(repo, 'blocks', f + '.css'), 'utf8')).join('\n') + '\n' + pageCss;
css = css.replace(/\/\*[\s\S]*?\*\//g, '').replaceAll('../site/fonts/', './fonts/');
const used = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
for (const m of js.matchAll(/'([^'\n]*)'|`([^`]*)`/g)) for (const t of (m[1] ?? m[2]).split(/[^\w-]+/)) if (t) used.add(t);
const attrs = new Set([...html.matchAll(/\s(data-[\w-]+)/g)].map(m => m[1]));
const keepSel = s => {
  const bare = s.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');
  return [...bare.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].every(m => used.has(m[1])) && [...bare.matchAll(/\[(data-[\w-]+)/g)].every(m => attrs.has(m[1]));
};
const blocks = text => { // верхний уровень: [prelude, body|null]
  const out = []; let i = 0;
  while (i < text.length) {
    const open = text.indexOf('{', i), semi = text.indexOf(';', i);
    if (open < 0) break;
    if (semi > -1 && semi < open && text.slice(i, semi).trim().startsWith('@')) { out.push([text.slice(i, semi + 1).trim(), null]); i = semi + 1; continue; }
    let d = 0, j = open;
    for (; j < text.length; j++) { if (text[j] === '{') d++; else if (text[j] === '}' && --d === 0) break; }
    out.push([text.slice(i, open).trim(), text.slice(open + 1, j)]); i = j + 1;
  }
  return out;
};
const purge = text => blocks(text).map(([pre, body]) => {
  if (body === null) return pre;
  if (/^@(media|supports)/.test(pre)) { const inner = purge(body); return inner ? `${pre}{\n${inner}\n}` : ''; }
  if (/^@(font-face|keyframes)|^:root/.test(pre)) return `${pre}{${body.trim()}}`;
  const sels = pre.split(/,(?![^()]*\))/).map(s => s.trim()).filter(keepSel);
  return sels.length ? `${sels.join(',')}{${body.trim()}}` : '';
}).filter(Boolean).join('\n');
let outCss = purge(css);
// keyframes без ссылок — убрать
outCss = outCss.replace(/@keyframes ([\w-]+)\{(?:[^{}]|\{[^{}]*\})*\}\n?/g, (m, n) => new RegExp(`animation[^;}]*\\b${n}\\b`).test(outCss.replace(m, '')) ? m : '');
outCss = `/* Бизнес-завтрак «Франшиза Яндекс Лавки». Токены, база и стили страницы. Брейкпоинты: 1100, 1023, 767, 399. */\n` + outCss + '\n';
writeFileSync(join(site, 'styles.css'), outCss);
for (const f of [...outCss.matchAll(/\.\/fonts\/([^')]+)/g)].map(m => m[1])) copyFileSync(join(repo, 'site/fonts', f), join(site, 'fonts', f));

// ---------- один файл ----------
execFileSync('node', [join(repo, 'blocks/build.mjs'), '--in', join(site, 'index.html'), join(exp, 'breakfast-meeting.html')], { stdio: 'inherit' });
const kb = f => (readFileSync(f).length / 1024).toFixed(0) + ' КБ';
console.log(`styles.css ${kb(join(site, 'styles.css'))} (было ${['tokens', 'base', 'blocks'].map(f => readFileSync(join(repo, 'blocks', f + '.css')).length).reduce((a, b) => a + b) / 1024 | 0} КБ), script.js ${kb(join(site, 'script.js'))}, картинок ${copied.size}`);

// ---------- архив ----------
const date = new Date().toISOString().slice(0, 10), name = `breakfast-meeting-${date}`, pack = join(exp, name);
rmSync(pack, { recursive: true, force: true }); rmSync(pack + '.zip', { force: true });
cpSync(site, join(pack, 'site'), { recursive: true });
copyFileSync(join(exp, 'breakfast-meeting.html'), join(pack, 'breakfast-meeting.html'));
writeFileSync(join(pack, 'README.txt'), readFileSync(join(here, 'final-readme.txt'), 'utf8').replaceAll('{date}', date));
execFileSync('zip', ['-rqX', name + '.zip', name], { cwd: exp });
console.log(`export/${name}.zip`);
