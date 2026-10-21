// Which element accounts for a difference? Hide candidates one at a time and recount.
import { diffPng, freezeCss, launch, open, serve, waitReady } from './lib.mjs';
const [w, h, dpr, mobile, t] = [Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]), process.argv[5] === 'mobile', Number(process.argv[6])];
const hide = (process.argv[7] ?? 'glow,marq,grain,hdrBg,ui,hdr,fx,badge,trust').split(',');
const proto = await serve(new URL('../../reference/prototype/', import.meta.url).pathname, 4701);
const built = await serve(new URL('../../dist-test/', import.meta.url).pathname, 4702);
const browser = await launch();
const vp = { width: w, height: h, dpr, mobile };
const A = await open(browser, 'http://127.0.0.1:4701/index.html', vp);
const B = await open(browser, 'http://127.0.0.1:4702/', vp);
await Promise.all([waitReady(A.page), waitReady(B.page)]);
await Promise.all([freezeCss(A.page), freezeCss(B.page)]);
const shot = async () => {
  await Promise.all([A.page, B.page].map((p) => p.evaluate((t) => window.__seek(t, 0), t)));
  await Promise.all([A.page, B.page].map((p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))));
  const [a, b] = await Promise.all([A.page.screenshot({ type: 'png' }), B.page.screenshot({ type: 'png' })]);
  return diffPng(a, b);
};
console.log('baseline'.padEnd(10), (await shot()).diff);
for (const id of hide) {
  await Promise.all([A.page, B.page].map((p) => p.addStyleTag({ content: `#${id}{visibility:hidden!important}` })));
  console.log(('hide ' + id).padEnd(14), (await shot()).diff);
}
await browser.close(); proto.close(); built.close();
