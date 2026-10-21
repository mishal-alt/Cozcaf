// Chrome trace of the production build: the biggest main-thread tasks and what is inside them.
//   node tools/trace.mjs [minMs=12]
import { launch, serve } from '../compare/lib.mjs';
const min = Number(process.argv[2] ?? 12);
const server = await serve(new URL('../../dist/', import.meta.url).pathname, 4703);
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await browser.startTracing(page, { categories: ['devtools.timeline', 'v8.execute', 'disabled-by-default-devtools.timeline', 'blink.user_timing'] });
await page.goto('http://127.0.0.1:4703/', { waitUntil: 'load' });
await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 60000 });
await page.waitForTimeout(1200);
const buf = await browser.stopTracing();
const events = JSON.parse(buf.toString()).traceEvents;
// find the renderer main thread
const main = events.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
const pid = main.pid, tid = main.tid;
const ev = events.filter((e) => e.pid === pid && e.tid === tid && e.ph === 'X').sort((a, b) => a.ts - b.ts);
const t0 = events.find((e) => e.name === 'navigationStart' && e.pid === pid)?.ts ?? ev[0].ts;
const tasks = ev.filter((e) => e.name === 'RunTask' && e.dur / 1000 >= min);
console.log(`tasks >= ${min}ms on the main thread (start ms from navigation, duration ms):`);
for (const t of tasks) {
  const inside = ev.filter((e) => e !== t && e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e.dur > 1500);
  const agg = new Map();
  for (const e of inside) {
    const label = e.name === 'FunctionCall' || e.name === 'EvaluateScript' ? `${e.name} ${(e.args?.data?.url || '').split('/').pop()}:${e.args?.data?.functionName || ''}${e.args?.data?.lineNumber ?? ''}` : e.name;
    agg.set(label, (agg.get(label) ?? 0) + e.dur / 1000);
  }
  const top = [...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7).map(([k, v]) => `${k}=${v.toFixed(1)}`).join(' | ');
  console.log(`${((t.ts - t0) / 1000).toFixed(0).padStart(6)}  ${(t.dur / 1000).toFixed(1).padStart(6)}  ${top}`);
}
await browser.close(); server.close();
