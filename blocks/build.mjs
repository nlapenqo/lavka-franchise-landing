// Собирает витрину блоков в один файл: стили, скрипт, шрифты и картинки внутри.
//   node blocks/build.mjs                → blocks/preview.html
//   node blocks/build.mjs out.html --artifact  → без html/head/body для claude.ai
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const artifact = process.argv.includes('--artifact');
const out = args[0] || (artifact ? 'artifact.html' : 'preview.html');
const MIME = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', woff2: 'font/woff2' };
const cache = new Map();
const data = abs => { if (!cache.has(abs)) cache.set(abs, `data:${MIME[abs.split('.').pop()]};base64,${readFileSync(abs).toString('base64')}`); return cache.get(abs); };
const inline = t => t
  .replace(/(src|href)="(\.\.\/(?:site|events)\/[^"]+\.(?:svg|png|webp|jpg))"/g, (_, a, p) => `${a}="${data(join(root, p))}"`)
  .replace(/url\('?(\.\.\/(?:site|events)\/[^')]+\.(?:svg|png|webp|jpg|woff2))'?\)/g, (_, p) => `url(${data(join(root, p))})`);
let page = readFileSync(join(root, 'index.html'), 'utf8');
page = page.replace(/<link rel="stylesheet" href="\.\/([\w.-]+\.css)">/g, (_, f) => `<style data-file="${f}">\n${inline(readFileSync(join(root, f), 'utf8'))}\n</style>`);
page = page.replace(/<script src="\.\/([\w.-]+\.js)"><\/script>/g, (_, f) => `<script data-file="${f}">\n${readFileSync(join(root, f), 'utf8').replace(/<\/script>/g, '<\\/script>')}\n</script>`);
page = inline(page);
if (artifact) {
  const head = page.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta[^>]*>|<link[^>]*>/g, '').trim();
  const body = page.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].trim();
  page = `${head}\n${body}\n`;
}
writeFileSync(resolve(root, out), page);
console.log(`${out}: ${(Buffer.byteLength(page) / 1048576).toFixed(2)} МБ, ассетов ${cache.size}`);
