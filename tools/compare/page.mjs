// Whole-page comparison: scroll both pages in lock step and diff a screenshot at every step.
//   node tools/compare/page.mjs [--motion]   (default: reduced motion, so reveals are off and everything is static)
import { mkdir, writeFile } from 'node:fs/promises';
import { diffPng, dropGhostWrappers, freezeCss, launch, open, serve, waitReady } from './lib.mjs';

const motion = process.argv.includes('--motion');
const OUT = new URL('./out/page/', import.meta.url).pathname;
await mkdir(OUT, { recursive: true });
const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, dpr: 2, mobile: !motion }, // motion mode freezes the hero; a touch device floats the cup from real time, so use a mouse viewport there
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
];
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const proto = await serve(new URL('../../reference/prototype/', import.meta.url).pathname, 4701);
const built = await serve(new URL('../../dist-test/', import.meta.url).pathname, 4702);
const browser = await launch();
let bad = 0, total = 0;

for (const vp of VIEWPORTS) {
  if (only && vp.name !== only) continue;
  const opts = { ...vp, reducedMotion: motion ? 'no-preference' : 'reduce' };
  const A = await open(browser, 'http://127.0.0.1:4701/index.html', opts);
  const B = await open(browser, 'http://127.0.0.1:4702/', opts);
  await Promise.all([waitReady(A.page).catch(() => A.page.waitForFunction(() => !document.getElementById('loader'))), waitReady(B.page).catch(() => B.page.waitForFunction(() => !document.getElementById('loader')))]);
  if (motion) {
    // skip the intro to its end state, like a visitor who pressed Skip
    await Promise.all([A.page, B.page].map((p) => p.evaluate(() => window.__seek(6.5, 0))));
  }
  await Promise.all([freezeCss(A.page), freezeCss(B.page), dropGhostWrappers(A.page)]);
  await Promise.all([A.page, B.page].map((p) => p.addStyleTag({ content: '#ui{visibility:hidden!important}' }))); // see hero.mjs
  const heights = await Promise.all([A.page, B.page].map((p) => p.evaluate(() => document.documentElement.scrollHeight)));
  console.log(`${vp.name}: document height proto ${heights[0]} build ${heights[1]}`);
  if (heights[0] !== heights[1]) bad++;
  const H = Math.min(...heights), step = Math.round(vp.height * 0.8);
  for (let y = 0; y <= H - vp.height + step; y += step) {
    const yy = Math.min(y, H - vp.height);
    await Promise.all([A.page, B.page].map((p) => p.evaluate((yy) => window.scrollTo(0, yy), yy)));
    await Promise.all([A.page, B.page].map((p) => p.waitForTimeout(motion ? 4200 : 250)));
    const [a, b] = await Promise.all([A.page.screenshot({ type: 'png' }), B.page.screenshot({ type: 'png' })]);
    const r = diffPng(a, b);
    total++;
    if (r.diff !== 0) {
      bad++;
      const f = `${OUT}${vp.name}${motion ? '-motion' : ''}-y${yy}`;
      await writeFile(f + '-proto.png', a); await writeFile(f + '-build.png', b); if (r.png) await writeFile(f + '-diff.png', r.png);
      console.log(`  DIFF y=${yy}: ${r.diff} px (max delta ${r.max})`);
    } else console.log(`  same y=${yy}`);
    if (yy === H - vp.height) break;
  }
  for (const E of [A, B]) if (E.errors.length) console.log(`  console errors (${E === A ? 'prototype' : 'build'}):`, E.errors.slice(0, 5));
  await A.ctx.close(); await B.ctx.close();
}
await browser.close(); proto.close(); built.close();
console.log(`\n${total - bad}/${total} scroll positions identical`);
process.exit(bad ? 1 : 0);
