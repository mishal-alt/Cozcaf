// Turns background-removed dish PNGs into identical square, transparent webp/avif cards in public/menu.
// Every dish is scaled by its type to a standard size and rests on one shared baseline, so the
// cards line up whatever the original photo framing was. Run after tools/cutout.swift:
//   node tools/menu-images.mjs <dir-with-cutout-pngs>
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { ICON_PATH, WORD_PATH } from '../src/components/logo-paths.ts';

const src = process.argv[2];
const out = new URL('../public/menu/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const CANVAS = 2048;
const SIZES = [1024, 2048];
const BASELINE = 0.91; // bottom edge of every dish, as a fraction of the card height
// standard size per dish type, as a fraction of the card: bowls by rim width, the rest by height
const STANDARD = { bowl: { w: 0.84 }, glass: { h: 0.7 }, short: { h: 0.64 } };
const TYPE = { 'dry-fruit-salad': 'short', 'fried-chicken': 'short' };

/** printed COZCAF mark for the plain green bucket: bean on top, lettering below (cream, like a printed cup) */
async function bucketLogo(width) {
  const svg = (box, d, w, h) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${w}" height="${h}"><path fill="#F4EEDD" fill-rule="evenodd" d="${d}"/></svg>`);
  const iconH = Math.round(width * 0.34), iconW = Math.round(iconH * 48 / 63);
  const wordH = Math.round(width * 0.17), wordW = Math.round(wordH * 306 / 63);
  const icon = await sharp(svg('127 310 48 63', ICON_PATH, iconW, iconH), { density: 72 }).png().toBuffer();
  const word = await sharp(svg('175 310 306 63', WORD_PATH, wordW, wordH), { density: 72 }).png().toBuffer();
  const gap = Math.round(width * 0.07);
  const W = Math.max(iconW, wordW), H = iconH + gap + wordH;
  const img = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: icon, left: Math.round((W - iconW) / 2), top: 0 }, { input: word, left: Math.round((W - wordW) / 2), top: iconH + gap }]).png().toBuffer();
  return { img, W, H };
}

for (const f of readdirSync(src).filter((n) => n.endsWith('.png'))) {
  const slug = f.replace(/\.png$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let { data, info } = await sharp(`${src}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, x1 = 0, y0 = info.height, y1 = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  let dish = await sharp(data, { raw: info }).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }).png().toBuffer();
  const w = x1 - x0 + 1, h = y1 - y0 + 1;

  if (slug === 'fried-chicken') {
    // print the logo on the bucket's front, centred on the body (below the rim; the wing sticks out right, so centre sits a little left)
    const bw = w * 0.5, { img, W, H } = await bucketLogo(bw);
    dish = await sharp(dish).composite([{ input: img, left: Math.round(w * 0.46 - W / 2), top: Math.round(h * 0.7 - H / 2), blend: 'over' }]).png().toBuffer();
  }

  const type = TYPE[slug] ?? (w / h > 1.3 ? 'bowl' : 'glass');
  const std = STANDARD[type];
  const scale = std.w ? (std.w * CANVAS) / w : (std.h * CANVAS) / h;
  const tw = Math.round(w * scale), th = Math.round(h * scale);
  const placed = await sharp(dish).resize(tw, th, { kernel: 'lanczos3' }).toBuffer();
  const card = sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: placed, left: Math.round((CANVAS - tw) / 2), top: Math.round(BASELINE * CANVAS - th) }]);
  const png = await card.png().toBuffer();
  for (const s of SIZES) {
    const r = sharp(png).resize(s, s, { kernel: 'lanczos3' });
    await r.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(`${out}${slug}-${s}.webp`);
    await r.clone().avif({ quality: 72 }).toFile(`${out}${slug}-${s}.avif`);
  }
  console.log(slug, type, `${tw}x${th}`);
}
