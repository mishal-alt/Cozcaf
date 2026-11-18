// Screenshots single sections of the running site (dev server or preview) at phone and desktop widths, with reveals shown.
//   node tools/compare/sections.mjs <base-url> <out-dir> [section-id ...]   e.g. node tools/compare/sections.mjs http://localhost:4321 /tmp/shots story menu signatures
import { launch } from './lib.mjs';

const [base, out, ...ids] = process.argv.slice(2);
const browser = await launch();
for (const [label, vp] of [['phone', { width: 390, height: 844, dpr: 2, mobile: true }], ['desktop', { width: 1440, height: 900, dpr: 1 }]]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dpr, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'load' }); // not networkidle: the opening film streams for ever
  await page.waitForTimeout(1500);
  // show everything the scroll reveals would show, skip the intro
  await page.addStyleTag({ content: '.rv,.rv-img,.split,.split *{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important} #loader{display:none!important}' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  for (const id of ids) {
    const el = page.locator(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    // menu: one shot per tab
    if (id === 'menu') {
      const tabs = await page.locator('.tab').all();
      for (let i = 0; i < tabs.length; i++) {
        await tabs[i].click(); await page.waitForTimeout(1300);
        // only the visible panel's photos; a lazy image in a hidden panel never decodes, so cap the wait
        await page.evaluate(() => Promise.race([new Promise((ok) => setTimeout(ok, 4000)), Promise.all([...document.querySelectorAll('#menu .menu-cols:not([hidden]) img')].map((im) => { im.loading = 'eager'; return im.decode().catch(() => {}); }))]));
        await el.screenshot({ path: `${out}/${label}-menu-${i}.png` });
      }
    } else {
      await page.evaluate((s) => Promise.race([new Promise((ok) => setTimeout(ok, 4000)), Promise.all([...document.querySelectorAll(`${s} img`)].map((im) => { im.loading = 'eager'; return im.decode().catch(() => {}); }))]), `#${id}`);
      await page.waitForTimeout(600);
      await el.screenshot({ path: `${out}/${label}-${id}.png` });
    }
  }
  console.log(label, 'horizontal overflow px:', overflow);
  await ctx.close();
}
await browser.close();
