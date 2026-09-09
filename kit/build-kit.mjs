// Собирает страницу кита в один самодостаточный HTML: стили, скрипт, шрифты и картинки — внутри.
//   node kit/build-kit.mjs                          → kit/kit-preview.html (страница кита)
//   node kit/build-kit.mjs template.html out.html   → любая страница на kit.css
//   ... --artifact                                  → без <!doctype>/<html>/<head>/<body> (для claude.ai-артефакта, он оборачивает сам)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repo = join(root, '..');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const artifact = process.argv.includes('--artifact');
const srcName = args[0] || 'index.html';
const outName = args[1] || (artifact ? 'kit-artifact.html' : 'kit-preview.html');

const MIME = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', woff2: 'font/woff2' };
const cache = new Map();
const dataURI = abs => {
  if (!cache.has(abs)) cache.set(abs, `data:${MIME[abs.split('.').pop()]};base64,${readFileSync(abs).toString('base64')}`);
  return cache.get(abs);
};
/* пути в html/css заданы от kit/: ../site/…, ../events/… */
const inlineRefs = text => text
  .replace(/(src|href)="(\.\.\/(?:site|events)\/[^"]+\.(?:svg|png|webp|jpg))"/g, (_, a, p) => `${a}="${dataURI(join(root, p))}"`)
  .replace(/url\('?(\.\.\/(?:site|events)\/[^')]+\.(?:svg|png|webp|jpg|woff2))'?\)/g, (_, p) => `url(${dataURI(join(root, p))})`);

let page = readFileSync(join(root, srcName), 'utf8');
for (const css of ['kit.css', 'kit-chrome.css']) {
  page = page.replace(`<link rel="stylesheet" href="./${css}">`, () => `<style data-kit="${css}">\n${inlineRefs(readFileSync(join(root, css), 'utf8'))}\n</style>`);
}
page = page.replace('<script src="./kit.js"></script>', () => `<script>\n${readFileSync(join(root, 'kit.js'), 'utf8')}\n</script>`);
page = inlineRefs(page);

if (artifact) {
  /* артефакт оборачивает файл своим скелетом: оставляем только содержимое <head> (title/style) и <body> */
  const head = page.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta[^>]*>|<link[^>]*>/g, '').trim();
  const body = page.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].trim();
  page = `${head}\n${body}\n`;
}
writeFileSync(resolve(root, outName), page);
console.log(`${outName}: ${(Buffer.byteLength(page) / 1048576).toFixed(2)} МБ, ассетов зашито: ${cache.size}`);
