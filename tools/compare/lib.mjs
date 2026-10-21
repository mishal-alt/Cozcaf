// Shared helpers for the comparison harness: tiny static servers, a browser, and exact PNG diffing.
import { createServer } from 'node:http';
import { brotliCompressSync, constants } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

export const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

/** compress: send text assets as brotli, like Netlify / Vercel / Cloudflare do (used for Lighthouse so transfer sizes are realistic) */
export function serve(root, port, { compress = false, cache = false } = {}) {
  const server = createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const file = join(root, normalize(p));
      if (!(await stat(file)).isFile()) throw new Error('nf');
      const type = MIME[extname(file)] ?? 'application/octet-stream';
      let body = await readFile(file);
      const headers = { 'content-type': type };
      if (cache) headers['cache-control'] = p.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : p.startsWith('/img/') ? 'public, max-age=86400, stale-while-revalidate=604800' : 'public, max-age=0, must-revalidate';
      if (compress && /^(text\/|application\/(json|xml)|image\/svg)/.test(type) && /\bbr\b/.test(req.headers['accept-encoding'] ?? '')) {
        body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
        headers['content-encoding'] = 'br';
      }
      res.writeHead(200, headers);
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

export const launch = () => chromium.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text', '--disable-gpu', '--disable-accelerated-2d-canvas'] });

/** open a page in a fresh context (so sessionStorage is empty = a first visit) with a fixed clock */
export async function open(browser, url, { width, height, dpr = 1, reducedMotion = 'no-preference', mobile = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dpr,
    reducedMotion,
    isMobile: mobile,
    hasTouch: mobile,
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('REQUEST FAILED ' + r.url()));
  await page.clock.setFixedTime(new Date('2026-10-20T10:00:00+05:30'));
  await page.goto(url, { waitUntil: 'load' });
  return { ctx, page, errors };
}

/** wait until the hero has booted and handed off from the loader */
export async function waitReady(page) {
  await page.waitForFunction(() => !document.getElementById('loader') && typeof window.__seek === 'function', null, { timeout: 30000 });
}

/** stop every CSS animation / transition so only the deterministic hero frame is compared */
export const freezeCss = (page) => page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });

/** exact comparison of two PNG buffers: count of differing pixels, max channel delta, and a diff image */
export function diffPng(a, b) {
  const A = PNG.sync.read(a), B = PNG.sync.read(b);
  if (A.width !== B.width || A.height !== B.height) return { size: `${A.width}x${A.height} vs ${B.width}x${B.height}`, diff: -1, max: 255, png: null };
  const out = new PNG({ width: A.width, height: A.height });
  let diff = 0, max = 0;
  for (let i = 0; i < A.data.length; i += 4) {
    const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]), Math.abs(A.data[i + 3] - B.data[i + 3]));
    if (d > 0) { diff++; if (d > max) max = d; out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; out.data[i + 3] = 255; }
    else { out.data[i] = A.data[i] >> 2; out.data[i + 1] = A.data[i + 1] >> 2; out.data[i + 2] = A.data[i + 2] >> 2; out.data[i + 3] = 255; }
  }
  return { diff, max, png: PNG.sync.write(out), total: A.width * A.height };
}

/** The prototype keeps an empty <li>/<p> around every hidden link (WhatsApp, phone, email), which adds a stray gap while those are unset.
    The build renders nothing for them, so drop the wrappers from the prototype before comparing. */
export const dropGhostWrappers = (page) =>
  page.evaluate(() => {
    document.querySelectorAll('li, p').forEach((el) => {
      const onlyHidden = [...el.childNodes].every((n) => (n.nodeType === 3 ? !n.textContent.trim() : n.hidden));
      if (el.children.length && onlyHidden) el.remove();
    });
  });

/** stop CSS animations only (marquee, pulses); transitions keep running so interaction behaviour is still real */
export const freezeAnim = (page) => page.addStyleTag({ content: '*,*::before,*::after{animation:none!important}' });
