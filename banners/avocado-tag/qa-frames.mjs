#!/usr/bin/env node
// QA-раскадровка анимации: открывает vN.html в headless Chrome, ставит все CSS-анимации на паузу
// и снимает кадры на заданных секундах. node qa-frames.mjs <url> <outdir> <t1,t2,...> [--scale .5]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
const [url, outdir, timesArg] = process.argv.slice(2);
const times = timesArg.split(',').map(Number);
mkdirSync(outdir, { recursive: true });
const bin = `${homedir()}/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell`;
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(bin, [`--remote-debugging-port=${port}`, '--headless', '--disable-gpu', '--hide-scrollbars', '--window-size=960,720', `--user-data-dir=/tmp/shot-${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { pending.set(++id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
try {
  let targets;
  for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(100); } }
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await send('Emulation.setDeviceMetricsOverride', { width: 960, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Page.enable');
  await send('Page.navigate', { url });
  await sleep(1200);
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
  await send('Runtime.evaluate', { expression: `(() => { const b = document.querySelector('.banner'); b.classList.remove('pre'); b.classList.add('play'); })()` });
  await sleep(100);
  for (const t of times) {
    await send('Runtime.evaluate', { expression: `document.getAnimations().forEach(a => { a.pause(); a.currentTime = ${Math.round(t * 1000)}; })` });
    await sleep(120);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(`${outdir}/t${t.toFixed(2)}.png`, Buffer.from(shot.data, 'base64'));
  }
  console.log('ok', outdir, times.join(','));
} catch (e) { console.error('frames failed:', e.message); process.exitCode = 1; }
finally { chrome.kill(); }
