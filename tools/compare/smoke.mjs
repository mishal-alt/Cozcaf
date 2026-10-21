// Hygiene sweep of the production build: no horizontal scroll, no console errors / failed requests, alt text, h1, landmarks, touch targets.
//   npm run build && node tools/compare/smoke.mjs
import { launch, open, serve } from './lib.mjs';

const server = await serve(new URL('../../dist/', import.meta.url).pathname, 4704, { compress: true });
const browser = await launch();
let bad = 0;
const check = (name, ok, extra = '') => { if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' ' + extra : ''}`); };

for (const [width, height] of [[360, 640], [390, 844], [414, 896], [600, 900], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]]) {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    const touch = width < 800;
    const { ctx, page, errors } = await open(browser, 'http://127.0.0.1:4704/', { width, height, dpr: touch ? 2 : 1, mobile: touch, reducedMotion });
    await page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 30000 });
    if (reducedMotion === 'no-preference') await page.waitForTimeout(700);
    // scroll the whole page so every lazy image loads and every reveal fires
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += Math.round(height * 0.7)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const wide = [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > innerWidth + 1 && !e.closest('.ticker, #marq, .track, .sig-cards, .visit-bg, svg') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map((e) => e.className || e.tagName);
      return {
        overflowX: de.scrollWidth - innerWidth,
        h1: document.querySelectorAll('h1').length,
        noAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
        brokenImgs: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).length,
        main: document.querySelectorAll('main').length,
        lang: de.lang,
        wide,
      };
    });
    const tag = `${width}x${height} ${reducedMotion === 'reduce' ? 'reduced' : 'motion '}`;
    check(`${tag} no horizontal scroll`, r.overflowX <= 0, r.overflowX > 0 ? `(+${r.overflowX}px: ${r.wide.join(', ')})` : '');
    check(`${tag} one h1, one main, lang set, alt on every img`, r.h1 === 1 && r.main === 1 && r.lang === 'en' && r.noAlt === 0 && r.brokenImgs === 0, JSON.stringify(r));
    check(`${tag} no console errors / failed requests`, errors.length === 0, errors.slice(0, 3).join(' | '));
    if (touch && reducedMotion === 'reduce') {
      await page.evaluate(() => window.scrollTo(0, 0));
      const small = await page.evaluate(() => {
        const out = [];
        for (const e of document.querySelectorAll('a[href], button, [role=tab], summary, input, select, textarea')) {
          const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || e.closest('[hidden]') || e.closest('#lb')) continue;
          const inText = cs.display === 'inline' && e.closest('p, li, address') && !e.closest('.foot-cols li');
          const b = e.getBoundingClientRect(); if (b.width === 0) continue;
          // a link's tap area may extend past its box (the hero trust links use an ::after pad), so measure that too
          const pad = getComputedStyle(e, '::after'); const extra = pad.position === 'absolute' && pad.content !== 'none';
          const w = extra ? Math.max(b.width, parseFloat(pad.width)) : b.width, h = extra ? Math.max(b.height, parseFloat(pad.height)) : b.height;
          if ((w < 43.5 || h < 43.5) && !inText && !e.classList.contains('sr')) out.push(`${e.tagName.toLowerCase()}.${(e.className || e.id || '').toString().slice(0, 24)} ${Math.round(w)}x${Math.round(h)}`);
        }
        return out;
      });
      check(`${tag} touch targets >= 44px`, small.length === 0, small.slice(0, 6).join(' | '));
    }
    await ctx.close();
  }
}
await browser.close(); server.close();
console.log(bad ? `\n${bad} check(s) failed` : '\nall checks passed');
process.exit(bad ? 1 : 0);
