// ad-hoc: evaluate an expression in both pages and print both results.  node tools/compare/q.mjs 1440 900 "<js expression>"
import { launch, open, serve } from './lib.mjs';
const [w, h] = [Number(process.argv[2]), Number(process.argv[3])];
const expr = process.argv[4];
const proto = await serve(new URL('../../reference/prototype/', import.meta.url).pathname, 4701);
const built = await serve(new URL('../../dist-test/', import.meta.url).pathname, 4702);
const browser = await launch();
const opts = { width: w, height: h, reducedMotion: 'reduce' };
const A = await open(browser, 'http://127.0.0.1:4701/index.html', opts);
const B = await open(browser, 'http://127.0.0.1:4702/', opts);
await Promise.all([A.page, B.page].map((p) => p.waitForFunction(() => !document.getElementById('loader'))));
for (const [n, E] of [['proto', A], ['build', B]]) console.log(n.padEnd(6), JSON.stringify(await E.page.evaluate(expr), null, 1));
await browser.close(); proto.close(); built.close();
