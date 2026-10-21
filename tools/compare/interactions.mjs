// Drive both pages through the same interactions and compare what the visitor sees (hero frozen at its end state so only the page is compared).
import { diffPng, dropGhostWrappers, freezeAnim, launch, open, serve, waitReady } from './lib.mjs';

const proto = await serve(new URL('../../reference/prototype/', import.meta.url).pathname, 4701);
const built = await serve(new URL('../../dist-test/', import.meta.url).pathname, 4702);
const browser = await launch();
let bad = 0, total = 0;
const report = (name, ok, extra = '') => { total++; if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' ' + extra : ''}`); };

async function pair(vp, fn) {
  const A = await open(browser, 'http://127.0.0.1:4701/index.html', vp);
  const B = await open(browser, 'http://127.0.0.1:4702/', vp);
  await Promise.all([waitReady(A.page), waitReady(B.page)]);
  await Promise.all([A.page, B.page].map((p) => p.evaluate(() => window.__seek(6.5, 0))));
  await dropGhostWrappers(A.page);
  await Promise.all([freezeAnim(A.page), freezeAnim(B.page)]);
  await fn(A, B);
  for (const [n, E] of [['prototype', A], ['build', B]]) if (E.errors.length) { report(`console errors (${n})`, false, E.errors.slice(0, 3).join(' | ')); }
  await A.ctx.close(); await B.ctx.close();
}
const both = (A, B, f) => Promise.all([f(A.page), f(B.page)]);
const settle = (A, B, ms = 1800) => both(A, B, (p) => p.waitForTimeout(ms));
async function shotsMatch(name, A, B, opts = {}) {
  const [a, b] = await Promise.all([A.page.screenshot({ type: 'png', ...opts }), B.page.screenshot({ type: 'png', ...opts })]);
  const r = diffPng(a, b);
  report(name, r.diff === 0, r.diff ? `${r.diff} px differ (max ${r.max})` : '');
}

// ---- desktop: menu tabs, keyboard on tabs, lightbox
await pair({ width: 1440, height: 900 }, async (A, B) => {
  await both(A, B, (p) => p.evaluate(() => document.getElementById('menu').scrollIntoView({ behavior: 'instant' })));
  await settle(A, B, 3000);
  await shotsMatch('menu: initial (Coffee)', A, B);
  for (const [label, id] of [['Coolers & Shakes', 'tab-coolers'], ['Kitchen', 'tab-kitchen'], ['Desserts', 'tab-desserts'], ['Coffee', 'tab-coffee']]) {
    await both(A, B, (p) => p.click('#' + id));
    await settle(A, B, 2600);
    await shotsMatch(`menu: click tab ${label}`, A, B);
  }
  await both(A, B, (p) => p.focus('#tab-coffee'));
  await both(A, B, (p) => p.keyboard.press('ArrowRight'));
  await both(A, B, (p) => p.keyboard.press('End'));
  await settle(A, B, 2600);
  await shotsMatch('menu: keyboard ArrowRight then End', A, B);
  const sel = await both(A, B, (p) => p.evaluate(() => [...document.querySelectorAll('.tab')].map((t) => t.getAttribute('aria-selected') + t.tabIndex + (document.activeElement === t ? 'F' : '')).join(',') + '|' + document.getElementById('panel').getAttribute('aria-labelledby')));
  report('menu: aria state after keyboard', sel[0] === sel[1], sel[0] === sel[1] ? sel[0] : `${sel[0]} vs ${sel[1]}`);

  // lightbox
  await both(A, B, (p) => p.evaluate(() => document.getElementById('gallery').scrollIntoView({ behavior: 'instant' })));
  await settle(A, B, 2800);
  await both(A, B, (p) => p.click('.g-tile[data-i="1"]'));
  await settle(A, B, 800);
  await shotsMatch('lightbox: open tile 2', A, B);
  await both(A, B, (p) => p.keyboard.press('ArrowRight'));
  await settle(A, B, 500);
  await shotsMatch('lightbox: ArrowRight', A, B);
  await both(A, B, (p) => p.keyboard.press('ArrowLeft'));
  await both(A, B, (p) => p.keyboard.press('ArrowLeft'));
  await settle(A, B, 500);
  await shotsMatch('lightbox: wraps to last (ArrowLeft x2)', A, B);
  // focus trap: Tab cycles inside
  const foc = [];
  for (let i = 0; i < 4; i++) { await both(A, B, (p) => p.keyboard.press('Tab')); foc.push(await both(A, B, (p) => p.evaluate(() => document.activeElement.className))); }
  report('lightbox: Tab stays inside', foc.every(([a, b]) => a === b && /lb-/.test(a)), foc.map((f) => f[1]).join(' > '));
  await both(A, B, (p) => p.keyboard.press('Escape'));
  await settle(A, B, 600);
  const after = await both(A, B, (p) => p.evaluate(() => ({ hidden: document.getElementById('lb').hidden, focus: document.activeElement.className, inert: ['page', 'hdr', 'ui'].map((i) => document.getElementById(i).inert), lbOpen: document.documentElement.classList.contains('lb-open') })));
  report('lightbox: Esc closes, focus returns, page not inert', JSON.stringify(after[0]) === JSON.stringify(after[1]), JSON.stringify(after[1]));
  await shotsMatch('lightbox: closed', A, B);
});

// ---- phone: sheet menu, tap targets
await pair({ width: 390, height: 844, dpr: 2, mobile: false }, async (A, B) => {
  await both(A, B, (p) => p.click('#burger'));
  await settle(A, B, 400);
  await shotsMatch('mobile: menu sheet open', A, B);
  const st = await both(A, B, (p) => p.evaluate(() => [document.getElementById('burger').getAttribute('aria-expanded'), document.getElementById('burger').getAttribute('aria-label'), document.activeElement.textContent].join('|')));
  report('mobile: sheet a11y state', st[0] === st[1], st[1]);
  await both(A, B, (p) => p.keyboard.press('Escape'));
  await settle(A, B, 300);
  const st2 = await both(A, B, (p) => p.evaluate(() => [document.getElementById('sheet').hidden, document.activeElement.id, document.getElementById('burger').getAttribute('aria-expanded')].join('|')));
  report('mobile: Esc closes sheet and refocuses burger', st2[0] === st2[1] && st2[1].startsWith('true|burger'), st2[1]);
  await both(A, B, (p) => p.click('#burger'));
  await both(A, B, (p) => p.mouse.click(200, 700));
  await settle(A, B, 300);
  const st3 = await both(A, B, (p) => p.evaluate(() => document.getElementById('sheet').hidden));
  report('mobile: outside tap closes sheet', st3[0] === st3[1] && st3[1] === true);
  await both(A, B, (p) => p.click('#burger'));
  await both(A, B, (p) => p.click('#sheet a:nth-child(3)'));
  await settle(A, B, 2500);
  const sy = await both(A, B, (p) => p.evaluate(() => Math.round(scrollY)));
  report('mobile: sheet link scrolls to the same place', sy[0] === sy[1], `scrollY ${sy[0]} vs ${sy[1]}`);
  await shotsMatch('mobile: sheet link scrolls to Visit', A, B);
});

// ---- Skip, short return visit, reduced motion (state level: the canvas keeps moving in real time)
async function liveState(vp, label, prep, wait, check) {
  const A = await open(browser, 'http://127.0.0.1:4701/index.html', vp, prep);
  const B = await open(browser, 'http://127.0.0.1:4702/', vp, prep);
  void A; void B;
}
for (const mode of ['first visit + Skip', 'return visit (short)', 'reduced motion']) {
  const vp = { width: 1440, height: 900, reducedMotion: mode === 'reduced motion' ? 'reduce' : 'no-preference' };
  const mk = async (url) => {
    const E = await open(browser, 'about:blank', vp);
    if (mode === 'return visit (short)') await E.page.addInitScript(() => sessionStorage.setItem('cozcaf.intro.seen', '1'));
    await E.page.goto(url, { waitUntil: 'load' });
    return E;
  };
  const A = await mk('http://127.0.0.1:4701/index.html'), B = await mk('http://127.0.0.1:4702/');
  const snap = (p) => p.evaluate(() => { const S = window.COZ.state(); return { phase: S.phase, mode: S.clockMode ?? S.mode, loader: !!document.getElementById('loader'), skipShown: document.getElementById('skip').classList.contains('show'), sndVisible: getComputedStyle(document.getElementById('snd')).display, replay: getComputedStyle(document.getElementById('replay')).display }; });
  const t0 = Date.now();
  if (mode === 'first visit + Skip') {
    await Promise.all([A, B].map((E) => E.page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 30000 })));
    await Promise.all([A, B].map((E) => E.page.waitForTimeout(900)));
    const pre = await Promise.all([A, B].map((E) => snap(E.page)));
    report(`${mode}: intro running, Skip button visible`, JSON.stringify(pre[0]) === JSON.stringify(pre[1]) && pre[1].phase === 'intro' && pre[1].skipShown, JSON.stringify(pre[1]));
    await Promise.all([A, B].map((E) => E.page.click('#skip')));
    await Promise.all([A, B].map((E) => E.page.waitForTimeout(900)));
    const post = await Promise.all([A, B].map((E) => snap(E.page)));
    report(`${mode}: after Skip the page is live, Skip hidden`, JSON.stringify(post[0]) === JSON.stringify(post[1]) && post[1].phase === 'live' && !post[1].skipShown, JSON.stringify(post[1]));
  } else if (mode === 'return visit (short)') {
    await Promise.all([A, B].map((E) => E.page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 30000 })));
    const pre = await Promise.all([A, B].map((E) => snap(E.page)));
    report(`${mode}: starts the short intro, no Skip`, JSON.stringify(pre[0]) === JSON.stringify(pre[1]) && pre[1].mode === 'short' && !pre[1].skipShown, JSON.stringify(pre[1]));
    await Promise.all([A, B].map((E) => E.page.waitForTimeout(2200)));
    const post = await Promise.all([A, B].map((E) => snap(E.page)));
    report(`${mode}: finishes in about 1.5 s`, JSON.stringify(post[0]) === JSON.stringify(post[1]) && post[1].phase === 'live', JSON.stringify(post[1]));
  } else {
    await Promise.all([A, B].map((E) => E.page.waitForFunction(() => !document.getElementById('loader'), null, { timeout: 30000 })));
    const s = await Promise.all([A, B].map((E) => snap(E.page)));
    report(`${mode}: one calm finished frame, no running loop`, JSON.stringify(s[0]) === JSON.stringify(s[1]) && s[1].phase === 'live', JSON.stringify(s[1]));
    const st = await Promise.all([A, B].map((E) => E.page.evaluate(() => window.COZ.state().running)));
    report(`${mode}: animation frame loop is not running`, st[0] === st[1] && st[1] === false, String(st[1]));
  }
  for (const [n, E] of [['prototype', A], ['build', B]]) if (E.errors.length) report(`console errors (${n}) in ${mode}`, false, E.errors.slice(0, 3).join(' | '));
  await A.ctx.close(); await B.ctx.close();
  void t0;
}
await browser.close(); proto.close(); built.close();
console.log(`\n${total - bad}/${total} interaction checks matched`);
process.exit(bad ? 1 : 0);
