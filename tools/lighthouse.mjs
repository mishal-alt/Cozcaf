// Lighthouse against the production build: mobile (default emulation, simulated slow 4G + 4x CPU) and desktop.
//   npm run build && npm run lighthouse [-- --runs=3]
import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';
import { serve, CHROME } from './compare/lib.mjs';

const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
const runs = Number(process.argv.find((a) => a.startsWith('--runs='))?.slice(7) ?? 1);
const OUT = new URL('./compare/out/lh/', import.meta.url).pathname;
await mkdir(OUT, { recursive: true });
const server = await serve(new URL('../dist/', import.meta.url).pathname, 4703, { compress: true, cache: true });
process.env.CHROME_PATH = CHROME;
const chrome = await launchChrome({ chromePath: CHROME, chromeFlags: ['--headless=new', '--disable-gpu-sandbox'] });

const pct = (n) => Math.round((n ?? 0) * 100);
for (const form of ['mobile', 'desktop'].filter((f) => !only || f === only)) {
  const rows = [];
  for (let i = 0; i < runs; i++) {
    const flags = { port: chrome.port, output: ['json', 'html'], logLevel: 'error', formFactor: form, screenEmulation: form === 'desktop' ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false } : undefined };
    const config = form === 'desktop' ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', throttlingMethod: 'simulate', throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 }, screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, emulatedUserAgent: undefined } } : undefined;
    const r = await lighthouse('http://127.0.0.1:4703/', flags, config);
    if (process.argv.includes('--trace')) await writeFile(`${OUT}${form}-trace.json`, JSON.stringify(r.artifacts.Trace));
    const lhr = r.lhr, a = lhr.audits, c = lhr.categories;
    rows.push({
      perf: pct(c.performance.score), a11y: pct(c.accessibility.score), bp: pct(c['best-practices'].score), seo: pct(c.seo.score),
      FCP: a['first-contentful-paint'].displayValue, LCP: a['largest-contentful-paint'].displayValue, TBT: a['total-blocking-time'].displayValue, CLS: a['cumulative-layout-shift'].displayValue, SI: a['speed-index'].displayValue, TTI: a.interactive.displayValue,
    });
    if (i === runs - 1) {
      await writeFile(`${OUT}${form}.html`, r.report[1]);
      await writeFile(`${OUT}${form}.json`, r.report[0]);
      const failing = Object.values(a).filter((x) => x.score !== null && x.score < 1 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual');
      console.log(`\n== ${form}: audits below 100%`);
      for (const x of failing) console.log(`  ${Math.round(x.score * 100).toString().padStart(3)}  ${x.id}  ${x.displayValue ?? ''}`);
    }
  }
  console.log(`\n== ${form} (${runs} run${runs > 1 ? 's' : ''})`);
  console.table(rows);
}
await chrome.kill();
server.close();
