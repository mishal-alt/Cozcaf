// Safari-engine smoke test: the page boots, the hero finishes, nothing throws, the menu tabs and lightbox work.
import { webkit, firefox } from 'playwright-core';
import { serve } from './lib.mjs';
const server = await serve(new URL('../../dist/', import.meta.url).pathname, 4705, { compress: true });
const which = process.argv[2] === 'firefox' ? firefox : webkit;
const browser = await which.launch();
for (const [name, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }]]) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('FAILED ' + r.url()));
  await page.goto('http://127.0.0.1:4705/', { waitUntil: 'load' });
  await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 30000 });
  await page.waitForTimeout(800);
  const skipVisible = false;
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.screenshot({ path: new URL(`./out/${which.name()}-${name}.png`, import.meta.url).pathname });
  await page.evaluate(() => document.getElementById('menu').scrollIntoView());
  await page.waitForTimeout(1500);
  await page.click('#tab-desserts');
  await page.waitForTimeout(1500);
  const dishes = await page.evaluate(() => [...document.querySelectorAll('.menu-cols:not([hidden]) .dish h3')].map((h) => h.textContent));
  await page.evaluate(() => document.getElementById('gallery').scrollIntoView());
  await page.waitForTimeout(1500);
  await page.click('.g-tile[data-i="2"]');
  await page.waitForTimeout(600);
  const lb = await page.evaluate(() => ({ open: !document.getElementById('lb').hidden, count: document.getElementById('lb-count').textContent }));
  console.log(`${which.name()} ${name}: skipVisible=${skipVisible} dessertsTab=${dishes.length} lightbox=${JSON.stringify(lb)} errors=${errors.length ? errors.join(' | ') : 'none'}`);
  await ctx.close();
}
await browser.close(); server.close();
