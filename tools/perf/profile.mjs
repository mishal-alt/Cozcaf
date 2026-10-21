// CPU profile of the production build at 4x slowdown: which functions own the long tasks?
//   node tools/profile.mjs
import { launch, serve } from '../compare/lib.mjs';
const server = await serve(new URL('../../dist/', import.meta.url).pathname, 4703);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.argv[2] ?? 4) });
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
await page.addInitScript(() => {
  window.__lt = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true });
});
await cdp.send('Profiler.start');
await page.goto('http://127.0.0.1:4703/', { waitUntil: 'load' });
await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 60000 });
await page.waitForTimeout(1500);
const { profile } = await cdp.send('Profiler.stop');
const lt = await page.evaluate(() => window.__lt);
console.log('long tasks (start ms, duration ms) at 4x CPU:', JSON.stringify(lt));
console.log('total blocking over 50ms:', lt.reduce((s, [, d]) => s + Math.max(0, d - 50), 0));
// aggregate self time per function
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const dt = profile.timeDeltas; const total = dt.reduce((a, b) => a + b, 0);
profile.samples.forEach((id, i) => { const n = byId.get(id); const k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`; self.set(k, (self.get(k) ?? 0) + (dt[i] ?? 0)); });
console.log('\ntop self-time (ms, at 4x):');
[...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(String(Math.round(v / 1000)).padStart(6), k));
console.log('total profile ms', Math.round(total / 1000));
await browser.close(); server.close();
