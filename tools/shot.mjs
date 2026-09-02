#!/usr/bin/env node
// QA-съёмка страницы через DevTools-протокол (без Playwright): любая ширина, прокрутка к блоку,
// принудительное проявление reveal-элементов, клик по элементу перед кадром.
// node tools/shot.mjs <url> <out.png> [--w 900] [--h 1000] [--block .business] [--off 30] [--click .sel] [--eval "js"] [--wait 800]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const [url, out] = args;
const W = +opt('w', 900), H = +opt('h', 1000), block = opt('block', ''), off = +opt('off', 30), click = opt('click', ''), evalJs = opt('eval', ''), wait = +opt('wait', 900);
const mobile = W < 768;
const bin = `${homedir()}/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell`;
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(bin, [`--remote-debugging-port=${port}`, '--headless', '--disable-gpu', '--hide-scrollbars', `--window-size=${W},${H}`, `--user-data-dir=/tmp/shot-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
try {
  let targets;
  for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(100); } }
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile, screenWidth: W, screenHeight: H });
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.enable');
  await send('Page.navigate', { url });
  await sleep(1500);
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
  const prep = `
    document.querySelectorAll('.rv').forEach(n => n.classList.add('on'));
    document.querySelectorAll('.reveal').forEach(n => n.classList.add('is-visible'));
    document.querySelectorAll('.hero-word').forEach(n => { n.style.transition = 'none'; n.style.opacity = 1; n.style.transform = 'none'; });
    ${block ? `(() => { const el = document.querySelector(${JSON.stringify(block)}); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - ${off}, behavior: 'instant' }); })();` : ''}
    ${click ? `(() => { const el = document.querySelector(${JSON.stringify(click)}); if (el) el.click(); })();` : ''}
    ${evalJs}
    'ok'`;
  await send('Runtime.evaluate', { expression: prep });
  await sleep(wait);
  await send('Runtime.evaluate', { expression: block ? `(() => { const el = document.querySelector(${JSON.stringify(block)}); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - ${off}, behavior: 'instant' }); })()` : '0' });
  await sleep(250);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('ok', out);
} catch (e) { console.error('shot failed:', e.message); process.exitCode = 1; }
finally { chrome.kill(); }
