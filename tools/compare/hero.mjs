// Frame-for-frame comparison of the hero: the approved prototype vs the Astro test build, same browser, same clock.
//   npm run build:test && node tools/compare/hero.mjs [--quick]
import { mkdir, writeFile } from 'node:fs/promises';
import { diffPng, freezeCss, launch, open, serve, waitReady } from './lib.mjs';

const OUT = new URL('./out/hero/', import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

// maxT: a touch device floats the cup from real elapsed time once the intro ends, so only the intro itself (t <= 5.6) can be compared exactly there
const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '2560x1440', width: 2560, height: 1440 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844 touch', width: 390, height: 844, dpr: 2, mobile: true, maxT: 5.6 },
  { name: '360x640 touch', width: 360, height: 640, dpr: 3, mobile: true, maxT: 5.6 },
  { name: '412x915 touch', width: 412, height: 915, dpr: 2.625, mobile: true, maxT: 5.6 },
  { name: '390x844 mouse', width: 390, height: 844, dpr: 2 },
];
const TIMES = [0.3, 0.8, 1.2, 1.6, 2.0, 2.4, 2.9, 3.4, 3.9, 4.3, 4.7, 5.2, 5.6, 6.5];
const DOCKS = [[6.5, 0.3], [6.5, 0.7], [6.5, 1]];
const quick = process.argv.includes('--quick');

const proto = await serve(new URL('../../reference/prototype/', import.meta.url).pathname, 4701);
const built = await serve(new URL('../../dist-test/', import.meta.url).pathname, 4702);
const browser = await launch();
let bad = 0, total = 0;

for (const vp of VIEWPORTS) {
  if (quick && !['1440x900', '390x844 touch', '390x844 mouse'].includes(vp.name)) continue;
  const A = await open(browser, 'http://127.0.0.1:4701/index.html', vp);
  const B = await open(browser, 'http://127.0.0.1:4702/', vp);
  await Promise.all([waitReady(A.page), waitReady(B.page)]);
  await Promise.all([freezeCss(A.page), freezeCss(B.page)]);
  // the intro controls (Skip / sound) are masked: the prototype paints them first in the wrong place and then moves them, so their rounded edges antialias differently from a clean first paint (see DIFFERENCES.md)
  await Promise.all([A.page, B.page].map((p) => p.addStyleTag({ content: '#ui{visibility:hidden!important}' })));
  const shots = [...TIMES.map((t) => [t, 0]), ...DOCKS].filter(([t]) => t <= (vp.maxT ?? 99));
  for (const [t, dock] of shots) {
    await Promise.all([A.page, B.page].map((p) => p.evaluate(([t, d]) => window.__seek(t, d), [t, dock])));
    await Promise.all([A.page, B.page].map((p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))));
    const [a, b] = await Promise.all([A.page.screenshot({ type: 'png' }), B.page.screenshot({ type: 'png' })]);
    const r = diffPng(a, b);
    total++;
    const tag = `${vp.name} t=${t}${dock ? ' dock=' + dock : ''}`;
    if (r.diff !== 0) {
      bad++;
      const f = `${OUT}${vp.name}-t${t}-d${dock}`;
      await writeFile(f + '-proto.png', a); await writeFile(f + '-build.png', b);
      if (r.png) await writeFile(f + '-diff.png', r.png);
      console.log(`DIFF  ${tag}: ${r.diff} px differ (max channel delta ${r.max})${r.size ? ' ' + r.size : ''}`);
    } else console.log(`same  ${tag}`);
  }
  for (const E of [A, B]) if (E.errors.length) console.log(`  console errors (${E === A ? 'prototype' : 'build'}):`, E.errors.slice(0, 5));
  await A.ctx.close(); await B.ctx.close();
}
await browser.close(); proto.close(); built.close();
console.log(`\n${total - bad}/${total} frames identical`);
process.exit(bad ? 1 : 0);
