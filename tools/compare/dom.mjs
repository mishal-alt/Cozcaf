// Structural comparison: positions/sizes of every element of the site, matched by document order, plus computed styles.
import { dropGhostWrappers, freezeCss, launch, open, serve, waitReady } from './lib.mjs';
const [w, h, dpr, mobile] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), 1, process.argv[4] === 'mobile'];
const proto = await serve(new URL('../../reference/prototype/', import.meta.url).pathname, 4701);
const built = await serve(new URL('../../dist-test/', import.meta.url).pathname, 4702);
const browser = await launch();
const opts = { width: w, height: h, dpr, mobile, reducedMotion: 'reduce' };
const A = await open(browser, 'http://127.0.0.1:4701/index.html', opts);
const B = await open(browser, 'http://127.0.0.1:4702/', opts);
await Promise.all([A.page, B.page].map((p) => p.waitForFunction(() => !document.getElementById('loader'))));
await Promise.all([freezeCss(A.page), freezeCss(B.page), dropGhostWrappers(A.page)]);
const PROPS = ['display','position','width','height','margin-top','margin-bottom','padding-top','padding-bottom','padding-left','padding-right','font-size','line-height','font-weight','letter-spacing','color','background-color','opacity','transform','gap','border-top-width','overflow','text-align','align-items','justify-content','grid-template-columns','flex-direction','min-height','aspect-ratio'];
const grab = (p) => p.evaluate((PROPS) => {
  const out = [];
  for (const e of document.querySelectorAll('#site, #site *')) {
    if (e.closest('[hidden]')) continue; // pre-rendered menu panels that are not shown
    if (e.matches('.w, .wi')) continue;
    if (e.tagName === 'SPAN' && !e.className && !e.id) continue; // bare text wrappers (data-txt in the prototype) // the build splits headings into words up front; the prototype does it only when motion is on
    const r = e.getBoundingClientRect(), c = getComputedStyle(e);
    if (e.tagName === 'LI' && r.width === 0) continue; // the prototype keeps an empty <li> for each hidden social link
    const label = e.tagName.toLowerCase() + (e.id && e.id !== 'menu-cols' ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '');
    out.push({ label, rect: [r.x, r.y + scrollY, r.width, r.height].map((n) => +n.toFixed(1)), css: Object.fromEntries(PROPS.map((k) => [k, c.getPropertyValue(k)])) });
  }
  return out;
}, PROPS);
const [a, b] = await Promise.all([grab(A.page), grab(B.page)]);
console.log('elements: proto', a.length, 'build', b.length);
let shown = 0;
const n = Math.min(a.length, b.length);
for (let i = 0; i < n && shown < 60; i++) {
  const x = a[i], y = b[i];
  const msgs = [];
  if (x.label !== y.label) { msgs.push(`LABEL ${x.label} vs ${y.label}`); }
  if (x.rect.join() !== y.rect.join()) msgs.push(`rect ${x.rect} vs ${y.rect}`);
  for (const k of PROPS) if (x.css[k] !== y.css[k]) msgs.push(`${k}: ${x.css[k]} vs ${y.css[k]}`);
  if (msgs.length) { console.log(`#${i} ${x.label}\n   ` + msgs.slice(0, 6).join('\n   ')); shown++; if (x.label !== y.label) break; }
}
await browser.close(); proto.close(); built.close();
